import { supabaseAdmin } from "@/lib/supabase/admin";
import { encerrarRegua } from "@/lib/jobs/enqueue";
import { reagirAFalhaDeCobranca } from "@/lib/domain/cobranca";
import { alertarOperador, montarAlertaDeRisco } from "@/lib/domain/alertas";
import type { EventoNormalizado } from "@/lib/gateways/types";

import type { PayloadDeJob, ResultadoDoJob } from "../types";

import "server-only";

/**
 * Processa um evento de webhook já gravado.
 *
 * O handler HTTP não faz nada além de verificar assinatura, gravar e enfileirar
 * — responder rápido é o que evita o gateway considerar o endpoint morto e
 * parar de mandar. Toda a lógica é aqui.
 *
 * A organização vem SEMPRE da FK do evento já gravado, nunca do corpo do
 * webhook. O corpo é entrada não confiável: quem descobre a URL pode postar
 * nela, e um `org_id` vindo dali permitiria escrever na base de outra empresa.
 */
export async function processarEventoDeWebhook(
  payload: Extract<PayloadDeJob, { kind: "process_webhook_event" }>,
): Promise<ResultadoDoJob> {
  const supa = supabaseAdmin();

  const { data: evento, error } = await supa
    .from("webhook_events")
    .select("id, org_id, provider, raw, processed_at")
    .eq("id", payload.webhookEventId)
    .maybeSingle();

  if (error || !evento) {
    return { estado: "falhou", erro: "evento não encontrado", recuperavel: false };
  }
  if (evento.processed_at) {
    return { estado: "feito", detalhe: "já processado" };
  }

  const normalizado = evento.raw as unknown as { normalizado?: EventoNormalizado };
  const dados = normalizado?.normalizado;

  if (!dados) {
    await marcarProcessado(evento.id, "evento sem forma normalizada");
    return { estado: "feito", detalhe: "ignorado" };
  }

  // `switch` em vez de `startsWith`: só ele estreita a união discriminada, e
  // um tipo novo em EventoNormalizado sem caso aqui vira erro de compilação.
  switch (dados.tipo) {
    case "mandate.authorized":
    case "mandate.rejected":
    case "mandate.cancelled":
    case "mandate.expired":
      await tratarMandato(dados, evento.org_id);
      break;
    case "charge.succeeded":
    case "charge.failed":
    case "charge.scheduled":
    case "charge.retrying":
      await tratarCobranca(dados, evento.org_id);
      break;
  }

  await marcarProcessado(evento.id, null);
  return { estado: "feito" };
}

async function marcarProcessado(id: string, erro: string | null) {
  await supabaseAdmin()
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString(), error: erro })
    .eq("id", id);
}

async function tratarMandato(
  evento: Extract<EventoNormalizado, { tipo: `mandate.${string}` }>,
  orgId: string | null,
) {
  const supa = supabaseAdmin();

  const status = {
    "mandate.authorized": "authorized",
    "mandate.rejected": "rejected",
    "mandate.cancelled": "cancelled",
    "mandate.expired": "expired",
  }[evento.tipo]!;

  const { data: mandato } = await supa
    .from("mandates")
    .update({
      status,
      authorized_at: status === "authorized" ? evento.ocorridoEm : undefined,
      cancelled_at: status === "cancelled" ? evento.ocorridoEm : undefined,
    })
    .eq("external_mandate_id", evento.externalMandateId)
    .select("id, contract_id, org_id")
    .maybeSingle();

  if (!mandato) return;

  if (status === "authorized") {
    // A migração aconteceu. Três coisas, nesta ordem.
    const { data: convite } = await supa
      .from("invitations")
      .update({ status: "authorized" })
      .eq("mandate_id", mandato.id)
      .select("id")
      .maybeSingle();

    // A régua para AGORA. Continuar lembrando quem já autorizou é o caminho
    // mais curto para a denúncia que derruba o número.
    if (convite) await encerrarRegua(convite.id);

    await supa
      .from("contracts")
      .update({
        migrated_at: evento.ocorridoEm,
        current_method: "pix_automatico",
      })
      .eq("id", mandato.contract_id);

    return;
  }

  // Cancelamento e expiração viram evento de risco NO MESMO DIA (RF-65). É o
  // único evento que a Pulse não pode prevenir — só pode detectar rápido, e é
  // onde o Pilar SUSTENTAR se prova ou desmorona.
  if (status === "cancelled" || status === "expired") {
    const kind = status === "cancelled" ? "mandate_cancelled" : "mandate_expired";
    const detail =
      status === "cancelled"
        ? "Autorização cancelada pelo pagador no app do banco."
        : "Autorização expirou.";

    await supa.from("risk_events").insert({
      org_id: mandato.org_id ?? orgId,
      contract_id: mandato.contract_id,
      mandate_id: mandato.id,
      kind,
      severity: "attention",
      detail,
    });

    await alertarOperador(
      (mandato.org_id ?? orgId) as string,
      montarAlertaDeRisco(kind, detail),
    );

    // Volta ao método anterior para não parecer migrado no medidor: um número
    // que conta quem já não está mais migrado é um número que mente.
    await supa
      .from("contracts")
      .update({ migrated_at: null })
      .eq("id", mandato.contract_id);
  }
}

async function tratarCobranca(
  evento: Extract<EventoNormalizado, { tipo: `charge.${string}` }>,
  orgId: string | null,
) {
  const supa = supabaseAdmin();

  const status = {
    "charge.succeeded": "succeeded",
    "charge.failed": "failed",
    "charge.scheduled": "scheduled",
    "charge.retrying": "retrying",
  }[evento.tipo]!;

  const { data: cobranca } = await supa
    .from("charges")
    .update({
      status,
      paid_at: status === "succeeded" ? evento.ocorridoEm : undefined,
      failure_reason: evento.motivo,
    })
    .eq("external_charge_id", evento.externalChargeId)
    .select("id, contract_id, org_id")
    .maybeSingle();

  if (!cobranca) return;

  if (status === "failed") {
    const detail = evento.motivo ?? "Cobrança não passou.";

    // risk_event para a fila /atencao.
    await supa.from("risk_events").insert({
      org_id: cobranca.org_id ?? orgId,
      contract_id: cobranca.contract_id,
      charge_id: cobranca.id,
      kind: "charge_failed_repeated",
      severity: "attention",
      detail,
    });

    await alertarOperador(
      (cobranca.org_id ?? orgId) as string,
      montarAlertaDeRisco("charge_failed_repeated", detail),
    );

    // Pix avulso imediato + incremento de failure_count_12m.
    // A função é idempotente: se o poll também chamar, o segundo disparo é
    // silenciado pela verificação de mensagem existente.
    await reagirAFalhaDeCobranca(cobranca.id);
  }
}
