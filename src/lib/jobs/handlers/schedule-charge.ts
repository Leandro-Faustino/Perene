import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdapterForOrg } from "@/lib/gateways";

import { enfileirar } from "../enqueue";
import { chaveDeIdempotencia } from "../types";
import type { PayloadDeJob, ResultadoDoJob } from "../types";

import "server-only";

/** Quanto tempo após a criação do job agendamos a primeira sonda. */
const PRIMEIRA_SONDA_MIN = 30;

/**
 * Cria a instrução de cobrança no gateway para um ciclo de contrato migrado.
 *
 * Pré-condições que o handler verifica em vez de assumir:
 * - contrato com status 'active' e método 'pix_automatico'
 * - mandato com status 'authorized' e external_mandate_id preenchido
 * - nenhuma cobrança não-cancelada já existe para este ciclo (unique index)
 *
 * O índice UNIQUE `charges_um_por_ciclo` garante que mesmo que o cron dispare
 * duas vezes o job, a segunda inserção no banco falha com 23505 e é silenciada
 * pelo `enfileirar` — a cobrança não duplica.
 */
export async function agendarCobranca(
  payload: Extract<PayloadDeJob, { kind: "schedule_charge" }>,
): Promise<ResultadoDoJob> {
  const supa = supabaseAdmin();

  // Carrega contrato + mandato numa query só para não ter TOCTOU entre as duas.
  const { data: contrato, error } = await supa
    .from("contracts")
    .select(
      `id, org_id, amount_cents, due_day, description, frequency,
       mandates ( id, external_mandate_id, status, provider, ceiling_cents )`,
    )
    .eq("id", payload.contractId)
    .eq("status", "active")
    .eq("current_method", "pix_automatico")
    .maybeSingle();

  if (error || !contrato) {
    return {
      estado: "falhou",
      erro: "contrato não encontrado ou não elegível para cobrança",
      recuperavel: false,
    };
  }

  const mandatos = (contrato.mandates ?? []) as unknown as {
    id: string;
    external_mandate_id: string | null;
    status: string;
    provider: string;
    ceiling_cents: number | null;
  }[];

  const mandato = mandatos.find(
    (m) => m.status === "authorized" && m.external_mandate_id,
  );

  if (!mandato) {
    return {
      estado: "falhou",
      erro: "nenhum mandato autorizado encontrado para o contrato",
      recuperavel: false,
    };
  }

  const vencimento = calcularVencimento(payload.cycleRef, contrato.due_day ?? 10);

  let resultado;
  try {
    const adapter = await getAdapterForOrg(contrato.org_id);
    resultado = await adapter.scheduleCharge({
      externalMandateId: mandato.external_mandate_id!,
      valorCentavos: contrato.amount_cents,
      vencimento,
      descricao: contrato.description ?? `Mensalidade ${payload.cycleRef}`,
      referenciaExterna: chaveDeIdempotencia.agendarCobranca(
        contrato.id,
        payload.cycleRef,
      ),
    });
  } catch (causa) {
    return {
      estado: "falhou",
      erro: causa instanceof Error ? causa.message : String(causa),
      recuperavel: true,
    };
  }

  // Insere no banco. Código 23505 = ciclo já tem cobrança → silencioso.
  const { data: cobranca, error: errInsert } = await supa
    .from("charges")
    .insert({
      org_id: contrato.org_id,
      contract_id: contrato.id,
      mandate_id: mandato.id,
      provider: mandato.provider,
      external_charge_id: resultado.externalChargeId,
      cycle_ref: payload.cycleRef,
      amount_cents: contrato.amount_cents,
      due_date: vencimento,
      status: resultado.status,
    })
    .select("id")
    .single();

  if (errInsert) {
    if (errInsert.code === "23505") {
      // Duplicata — o cron rodou duas vezes. Sem consequência.
      return { estado: "feito", detalhe: "cobrança já existia para o ciclo" };
    }
    return { estado: "falhou", erro: errInsert.message, recuperavel: true };
  }

  // Agenda a primeira sonda: em 30 minutos checaremos se o pagamento entrou.
  const quando = new Date(Date.now() + PRIMEIRA_SONDA_MIN * 60_000);
  await enfileirar(
    { kind: "charge_status_poll", chargeId: cobranca.id },
    {
      orgId: contrato.org_id,
      quando,
      idempotencyKey: chaveDeIdempotencia.sondaCobranca(cobranca.id),
    },
  );

  return { estado: "feito" };
}

/**
 * Calcula a data de vencimento a partir do ciclo e do dia de vencimento do
 * contrato.
 *
 * `due_day > dias_no_mes` → ajusta para o último dia. Fevereiro com due_day=31
 * vence no dia 28 (ou 29), não em março — o contrato não adianta o ciclo por
 * causa do calendário.
 */
function calcularVencimento(cycleRef: string, dueDay: number): string {
  const [ano, mes] = cycleRef.split("-").map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const dia = Math.min(dueDay, ultimoDia);
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}
