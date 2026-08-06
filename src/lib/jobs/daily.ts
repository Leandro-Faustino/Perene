import { supabaseAdmin } from "@/lib/supabase/admin";
import { montarAvisoPre } from "@/lib/messaging/templates";
import {
  buscarTemplateCustom,
  aplicarVariaveis,
  primeiroNome,
} from "@/lib/messaging/custom-templates";
import { formatarReais } from "@/lib/utils";
import { alertarOperador, montarResumoDiario } from "@/lib/domain/alertas";

import { enfileirar, enfileirarVarios } from "./enqueue";
import { chaveDeIdempotencia } from "./types";

import "server-only";

export interface ResumoDiario {
  avisosD3Enfileirados: number;
  cobrancasD0Enfileiradas: number;
  fallbacksD1Reenfileirados: number;
  resumosDiariosEnviados: number;
}

/**
 * As três operações do cron diário (08h UTC = 05h BRT).
 *
 * Sequencial de propósito: as três operações compartilham o cliente admin e
 * tocam tabelas relacionadas. Paralelizar aqui não traz ganho mensurável e
 * introduz risco de colisão (ex: D0 agenda uma cobrança que D+1 já detecta
 * como "pendente" no mesmo tick).
 */
export async function rodarDiario(hoje: Date = new Date()): Promise<ResumoDiario> {
  const avisosD3Enfileirados = await enviarAvisosD3(hoje);
  const cobrancasD0Enfileiradas = await agendarCobrancasD0(hoje);
  const fallbacksD1Reenfileirados = await verificarFallbackD1(hoje);
  const resumosDiariosEnviados = await enviarResumoDiario(hoje);

  return {
    avisosD3Enfileirados,
    cobrancasD0Enfileiradas,
    fallbacksD1Reenfileirados,
    resumosDiariosEnviados,
  };
}

// -----------------------------------------------------------------------------
// D-3 — aviso pré-débito
//
// O pagador tem a autorização ativa mas pode não ter o hábito do débito
// automático no extrato. Um aviso 3 dias antes evita a ligação "o que é esse
// débito?" e reforça a percepção de que o sistema funciona.
// -----------------------------------------------------------------------------
async function enviarAvisosD3(hoje: Date): Promise<number> {
  const supa = supabaseAdmin();

  const alvo = new Date(hoje);
  alvo.setDate(alvo.getDate() + 3);

  const diaAlvo = alvo.getDate();
  const cycleRef = formatarCycleRef(alvo);
  const ultimoDiaDoMes = ultimoDia(alvo);

  // Contratos cujo vencimento cai exatamente no dia alvo — inclusive os que
  // têm due_day > dias do mês e "encostam" no último dia.
  const query = supa
    .from("contracts")
    .select(
      `id, org_id, amount_cents, due_day,
       payers ( name, phone_e164 ),
       organizations ( name )`,
    )
    .eq("status", "active")
    .eq("current_method", "pix_automatico");

  const { data: contratos } = diaAlvo === ultimoDiaDoMes
    ? await query.gte("due_day", diaAlvo)
    : await query.eq("due_day", diaAlvo);

  if (!contratos || contratos.length === 0) return 0;

  let enfileirados = 0;

  for (const contrato of contratos) {
    const pagador = contrato.payers as unknown as {
      name: string; phone_e164: string | null;
    } | null;
    const org = contrato.organizations as unknown as { name: string } | null;

    if (!pagador?.phone_e164) continue;

    const dataDebitoStr = formatarDataPorExtenso(alvo);
    const customBody = await buscarTemplateCustom(contrato.org_id, "aviso_pre_cobranca", "whatsapp");
    const corpo = customBody
      ? aplicarVariaveis(customBody, {
          pagador: primeiroNome(pagador.name),
          organizacao: org?.name ?? "",
          valor: formatarReais(contrato.amount_cents),
          dataDebito: dataDebitoStr,
        })
      : montarAvisoPre({
          pagador: pagador.name,
          organizacao: org?.name ?? "",
          valorCentavos: contrato.amount_cents,
          dataDebito: dataDebitoStr,
        });

    const { data: mensagem } = await supa
      .from("messages")
      .insert({
        org_id: contrato.org_id,
        template_key: "aviso_pre_cobranca",
        channel: "whatsapp",
        to_address: pagador.phone_e164,
        body: corpo,
        status: "queued",
      })
      .select("id")
      .single();

    if (!mensagem) continue;

    await enfileirar(
      { kind: "send_message", messageId: mensagem.id },
      {
        orgId: contrato.org_id,
        idempotencyKey: `aviso-d3:${contrato.id}:${cycleRef}`,
      },
    );

    enfileirados++;
  }

  return enfileirados;
}

// -----------------------------------------------------------------------------
// D0 — agenda as cobranças do dia
//
// Um job por contrato. Se o cron rodar duas vezes no mesmo dia (falha seguida
// de retry), a chave de idempotência impede duplicata.
// -----------------------------------------------------------------------------
async function agendarCobrancasD0(hoje: Date): Promise<number> {
  const supa = supabaseAdmin();

  const diaHoje = hoje.getDate();
  const cycleRef = formatarCycleRef(hoje);
  const ultimoDiaDoMes = ultimoDia(hoje);

  const query = supa
    .from("contracts")
    .select("id, org_id")
    .eq("status", "active")
    .eq("current_method", "pix_automatico");

  const { data: contratos } = diaHoje === ultimoDiaDoMes
    ? await query.gte("due_day", diaHoje)
    : await query.eq("due_day", diaHoje);

  if (!contratos || contratos.length === 0) return 0;

  await enfileirarVarios(
    contratos.map((c) => ({
      payload: { kind: "schedule_charge" as const, contractId: c.id, cycleRef },
      orgId: c.org_id,
      idempotencyKey: chaveDeIdempotencia.agendarCobranca(c.id, cycleRef),
    })),
  );

  return contratos.length;
}

// -----------------------------------------------------------------------------
// D+1 — rede de segurança para cobranças travadas
//
// Se um job `charge_status_poll` morreu antes de resolver a cobrança (falha
// irrecuperável, instabilidade de rede), a cobrança fica em `scheduled` ou
// `retrying` para sempre. O cron do dia seguinte detecta e re-enfileira a
// sonda com chave de idempotência diferente — não duplica se já há uma
// sonda ativa para o mesmo charge.
// -----------------------------------------------------------------------------
async function verificarFallbackD1(hoje: Date): Promise<number> {
  const supa = supabaseAdmin();

  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const dataOntem = ontem.toISOString().slice(0, 10);
  const hojeStr = hoje.toISOString().slice(0, 10);

  const { data: cobranças } = await supa
    .from("charges")
    .select("id, org_id")
    .eq("due_date", dataOntem)
    .in("status", ["scheduled", "retrying"]);

  if (!cobranças || cobranças.length === 0) return 0;

  await enfileirarVarios(
    cobranças.map((c) => ({
      payload: { kind: "charge_status_poll" as const, chargeId: c.id },
      orgId: c.org_id,
      // Chave com data de hoje: permite re-enfileirar mesmo que o poll
      // original (chave `poll:{chargeId}`) já tenha sido marcado como 'done'.
      idempotencyKey: `poll-d1:${c.id}:${hojeStr}`,
    })),
  );

  return cobranças.length;
}

// -----------------------------------------------------------------------------
// Resumo diário por organização
//
// Enviado ao telefone de notificação configurado em /configuracoes/mensagens.
// Só envia se há notification_phone; orgs sem configuração são ignoradas.
// Separa por org para que cada operador veja apenas seus próprios números.
// -----------------------------------------------------------------------------
async function enviarResumoDiario(hoje: Date): Promise<number> {
  const supa = supabaseAdmin();

  const { data: orgs } = await supa
    .from("organizations")
    .select("id, name, notification_phone")
    .not("notification_phone", "is", null);

  if (!orgs || orgs.length === 0) return 0;

  const inicioDoDia = new Date(hoje);
  inicioDoDia.setHours(0, 0, 0, 0);
  const inicioIso = inicioDoDia.toISOString();
  const dataStr = hoje.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  let enviados = 0;

  for (const org of orgs) {
    const [cobResult, riscResult, msgResult] = await Promise.all([
      supa
        .from("charges")
        .select("status")
        .eq("org_id", org.id)
        .gte("updated_at", inicioIso),
      supa
        .from("risk_events")
        .select("id", { count: "exact", head: true })
        .eq("org_id", org.id)
        .is("resolved_at", null),
      supa
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("org_id", org.id)
        .eq("status", "sent")
        .gte("sent_at", inicioIso),
    ]);

    const cobranças = cobResult.data ?? [];
    const sucesso = cobranças.filter((c) => c.status === "succeeded").length;
    const falhas = cobranças.filter((c) => c.status === "failed").length;

    const corpo = montarResumoDiario({
      organizacao: org.name,
      cobrancasSucesso: sucesso,
      cobrancasFalhas: falhas,
      mensagensEnviadas: msgResult.count ?? 0,
      riscoPendente: riscResult.count ?? 0,
      data: dataStr,
    });

    await alertarOperador(org.id, corpo);
    enviados++;
  }

  return enviados;
}

// -----------------------------------------------------------------------------
// Auxiliares
// -----------------------------------------------------------------------------

function formatarCycleRef(data: Date): string {
  const ano = data.getFullYear();
  const mes = data.getMonth() + 1;
  return `${ano}-${String(mes).padStart(2, "0")}`;
}

function ultimoDia(data: Date): number {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
}

function formatarDataPorExtenso(data: Date): string {
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
}
