/**
 * Lógica de domínio do ciclo de cobrança.
 *
 * Centraliza o que precisa acontecer quando uma cobrança falha, evitando
 * duplicação entre `charge-status-poll` (caminho do polling) e
 * `process-webhook-event` (caminho do webhook, que é o caminho "imediato").
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdapterForOrg } from "@/lib/gateways";
import { montarPixAvulso } from "@/lib/messaging/templates";
import {
  buscarTemplateCustom,
  aplicarVariaveis,
  primeiroNome,
} from "@/lib/messaging/custom-templates";
import { formatarReais } from "@/lib/utils";

import { enfileirar } from "@/lib/jobs/enqueue";
import { chaveDeIdempotencia } from "@/lib/jobs/types";

import "server-only";

/**
 * Reage a uma cobrança que falhou definitivamente.
 *
 * Idempotente: se já existe uma mensagem `pix_avulso` vinculada a esta
 * cobrança, a função retorna imediatamente sem duplicar o envio. Isso permite
 * que o webhook e o poll chamem esta função de forma independente — quem
 * chegar primeiro faz o trabalho, o segundo é silenciado pelo banco.
 *
 * O que acontece aqui:
 * 1. Incrementa `failure_count_12m` no contrato (alimenta segmentação de ondas).
 * 2. Cria Pix avulso no gateway como link de pagamento alternativo.
 * 3. Insere mensagem `pix_avulso` na fila.
 * 4. Enfileira `send_message` para disparar no próximo tick.
 */
export async function reagirAFalhaDeCobranca(chargeId: string): Promise<void> {
  const supa = supabaseAdmin();

  // ── Idempotência ────────────────────────────────────────────────────────────
  // Webhook e poll podem chegar ao mesmo ponto de forma independente.
  // A query de count é a trava: quem chegar segundo não encontra nada para fazer.
  const { count } = await supa
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("charge_id", chargeId)
    .eq("template_key", "pix_avulso");

  if (count && count > 0) return;

  // ── Carga de dados ──────────────────────────────────────────────────────────
  const { data: cobranca } = await supa
    .from("charges")
    .select(
      `id, org_id, contract_id, mandate_id, amount_cents, cycle_ref, failure_reason,
       contracts (
         failure_count_12m,
         payers ( name, phone_e164, tax_id, email, external_id ),
         organizations ( name )
       )`,
    )
    .eq("id", chargeId)
    .maybeSingle();

  if (!cobranca) return;

  const contrato = cobranca.contracts as unknown as {
    failure_count_12m: number;
    payers: { name: string; phone_e164: string | null; tax_id: string | null; email: string | null; external_id: string | null };
    organizations: { name: string };
  } | null;

  const telefone = contrato?.payers?.phone_e164;
  if (!telefone) return;

  // ── Incremento de falhas ─────────────────────────────────────────────────
  // Race condition impossível na prática: o ciclo é mensal e o worker é
  // sequencial. Leitura-escrita em dois passos é suficiente e evita uma função
  // SQL dedicada.
  await supa
    .from("contracts")
    .update({ failure_count_12m: (contrato?.failure_count_12m ?? 0) + 1 })
    .eq("id", cobranca.contract_id);

  // ── Pix avulso ──────────────────────────────────────────────────────────────
  let pixLink: string | null = null;

  if (contrato?.payers?.tax_id) {
    try {
      const adapter = await getAdapterForOrg(cobranca.org_id);
      const pix = await adapter.createOneOffPix({
        pagador: {
          nome: contrato.payers.name,
          email: contrato.payers.email,
          telefoneE164: contrato.payers.phone_e164,
          cpfCnpj: contrato.payers.tax_id,
          externalId: contrato.payers.external_id,
        },
        valorCentavos: cobranca.amount_cents,
        descricao: `Pix avulso — ciclo ${cobranca.cycle_ref}`,
        vencimento: new Date().toISOString().slice(0, 10),
        referenciaExterna: `pix-avulso:${cobranca.id}`,
      });
      pixLink = pix.linkPagamento ?? pix.qrCodePayload;
    } catch {
      // Falha ao criar Pix avulso não cancela o fluxo — segue sem o link.
    }
  }

  const fallbackLink = pixLink ?? "(link indisponível — entre em contato conosco)";
  const nomePagador = contrato?.payers?.name ?? "cliente";
  const nomeOrg = contrato?.organizations?.name ?? "";

  const customBody = await buscarTemplateCustom(cobranca.org_id, "pix_avulso", "whatsapp");
  const [ano, mes] = cobranca.cycle_ref.split("-");
  const mesExtenso = new Date(`${ano}-${mes}-01`).toLocaleString("pt-BR", { month: "long" });

  const corpo = customBody
    ? aplicarVariaveis(customBody, {
        pagador: primeiroNome(nomePagador),
        organizacao: nomeOrg,
        valor: formatarReais(cobranca.amount_cents),
        link: fallbackLink,
        mesRef: mesExtenso,
      })
    : montarPixAvulso({
        pagador: nomePagador,
        organizacao: nomeOrg,
        valorCentavos: cobranca.amount_cents,
        cycleRef: cobranca.cycle_ref,
        link: fallbackLink,
      });

  // ── Mensagem ─────────────────────────────────────────────────────────────────
  const { data: mensagem } = await supa
    .from("messages")
    .insert({
      org_id: cobranca.org_id,
      charge_id: cobranca.id,
      template_key: "pix_avulso",
      channel: "whatsapp",
      to_address: telefone,
      body: corpo,
      status: "queued",
    })
    .select("id")
    .single();

  if (!mensagem) return;

  await enfileirar(
    { kind: "send_message", messageId: mensagem.id },
    {
      orgId: cobranca.org_id,
      idempotencyKey: chaveDeIdempotencia.mensagem(mensagem.id),
    },
  );
}
