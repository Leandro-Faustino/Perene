import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdapterForOrg } from "@/lib/gateways";
import { reagirAFalhaDeCobranca } from "@/lib/domain/cobranca";
import { alertarOperador, montarAlertaDeRisco } from "@/lib/domain/alertas";
import type { PayloadDeJob, ResultadoDoJob } from "../types";

import "server-only";

/** Sonda a cada hora. */
const INTERVALO_SONDA_MS = 60 * 60_000;
/** Desiste se a cobrança ficou pendente por mais de 48 horas. */
const LIMITE_HORAS = 48;

/**
 * Sonda o resultado de uma cobrança e reage ao que encontrar.
 *
 * O fluxo principal:
 * - succeeded → feito, nada a fazer.
 * - failed    → envia Pix avulso ao pagador como fallback + gera risk_event.
 * - pending   → reagenda para daqui a 1 hora (sem consumir tentativas).
 * - >48h sem resposta → falha permanente + risk_event.
 *
 * "Política de retentativa" aqui significa enviar o Pix avulso uma única vez:
 * o mandato segue ativo para o próximo ciclo, e forçar uma segunda tentativa
 * automática de débito neste ciclo pode causar dupla cobrança.
 */
export async function sondarCobranca(
  payload: Extract<PayloadDeJob, { kind: "charge_status_poll" }>,
): Promise<ResultadoDoJob> {
  const supa = supabaseAdmin();

  const { data: cobranca, error } = await supa
    .from("charges")
    .select(
      `id, org_id, contract_id, mandate_id, provider, external_charge_id,
       amount_cents, due_date, status, cycle_ref, created_at,
       contracts (
         payers ( name, phone_e164 ),
         organizations ( name )
       )`,
    )
    .eq("id", payload.chargeId)
    .maybeSingle();

  if (error || !cobranca) {
    return { estado: "falhou", erro: "cobrança não encontrada", recuperavel: false };
  }

  if (cobranca.status === "succeeded") {
    return { estado: "feito", detalhe: "cobrança já liquidada" };
  }

  // Já está marcada como falha (veio via webhook antes da sonda).
  // `reagirAFalhaDeCobranca` é idempotente: se o webhook já enviou o Pix, esta
  // chamada é silenciada pelo check de mensagem existente.
  if (cobranca.status === "failed") {
    await reagirAFalhaDeCobranca(cobranca.id);
    return { estado: "feito", detalhe: "webhook já marcou falha — fallback garantido" };
  }

  // Cobrança pendente por tempo demais → desiste.
  const horasDecorridas =
    (Date.now() - new Date(cobranca.created_at).getTime()) / 3_600_000;

  if (horasDecorridas > LIMITE_HORAS) {
    await supa.from("charges").update({ status: "failed" }).eq("id", cobranca.id);
    const detalheTimeout = `Cobrança ficou pendente por mais de ${LIMITE_HORAS}h sem confirmação.`;
    await supa.from("risk_events").insert({
      org_id: cobranca.org_id,
      contract_id: cobranca.contract_id,
      mandate_id: cobranca.mandate_id,
      charge_id: cobranca.id,
      kind: "charge_failed_repeated",
      severity: "critical",
      detail: detalheTimeout,
    });
    await alertarOperador(
      cobranca.org_id,
      montarAlertaDeRisco("charge_failed_repeated", detalheTimeout),
    );
    return {
      estado: "falhou",
      erro: `cobrança pendente por mais de ${LIMITE_HORAS}h`,
      recuperavel: false,
    };
  }

  // Ainda não temos external_charge_id → o insert falhou silenciosamente.
  if (!cobranca.external_charge_id) {
    return { estado: "reagendar", quando: new Date(Date.now() + INTERVALO_SONDA_MS) };
  }

  // Consulta o gateway.
  let estadoGateway;
  try {
    const adapter = await getAdapterForOrg(cobranca.org_id);
    estadoGateway = await adapter.getCharge(cobranca.external_charge_id);
  } catch (causa) {
    // Falha de rede → tenta de novo na próxima hora.
    return {
      estado: "reagendar",
      quando: new Date(Date.now() + INTERVALO_SONDA_MS),
      detalhe: causa instanceof Error ? causa.message : String(causa),
    };
  }

  // Atualiza o banco com o estado atual.
  await supa
    .from("charges")
    .update({
      status: estadoGateway.status,
      paid_at: estadoGateway.pagoEm ?? undefined,
      failure_reason: estadoGateway.motivo ?? undefined,
    })
    .eq("id", cobranca.id);

  if (estadoGateway.status === "succeeded") {
    return { estado: "feito" };
  }

  if (estadoGateway.status === "failed") {
    await reagirAFalhaDeCobranca(cobranca.id);
    return { estado: "feito", detalhe: "cobrança falhou — fallback Pix enviado" };
  }

  // scheduled ou retrying → continua sondando.
  return {
    estado: "reagendar",
    quando: new Date(Date.now() + INTERVALO_SONDA_MS),
    detalhe: `status atual: ${estadoGateway.status}`,
  };
}

