"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdapterForOrg } from "@/lib/gateways";
import { pareceToken } from "@/lib/domain/tokens";
import type { Periodicidade } from "@/lib/gateways/types";

export interface ResultadoDaAutorizacao {
  ok: boolean;
  mensagem?: string;
  qrCodePayload?: string | null;
  qrCodeImagem?: string | null;
  linkPagamento?: string | null;
}

/**
 * Inicia a autorização de Pix Automático.
 *
 * Este é o ÚNICO ponto do fluxo público que usa o cliente service-role, e vale
 * explicar por quê: criar o mandato exige descriptografar a credencial de
 * gateway da organização, e essa tabela não tem policy de propósito. Não há
 * como fazer isso com o papel `anon`.
 *
 * O que torna aceitável: isto é Server Action, roda só no servidor, e a busca
 * é ancorada no TOKEN — nada aqui aceita `org_id` vindo do cliente. Quem não
 * tem um token válido não chega a lugar nenhum.
 *
 * SOBRE O FLUXO, que não é o que o plano original supunha: o Pix Automático do
 * Asaas não é "clicar e autorizar". O gateway devolve um QR Code, o pagador
 * PAGA a primeira cobrança, e é a liquidação desse pagamento que ativa a
 * autorização. Por isso a tela precisa dizer que há um pagamento agora — e o
 * valor precisa estar visível antes do QR aparecer.
 */
export async function iniciarAutorizacao(
  token: string,
): Promise<ResultadoDaAutorizacao> {
  if (!pareceToken(token)) {
    return { ok: false, mensagem: "Esse link não é válido." };
  }

  const supa = supabaseAdmin();

  const { data: convite, error } = await supa
    .from("invitations")
    .select(
      `id, org_id, status, expires_at, mandate_id,
       contracts ( id, amount_cents, frequency, due_day, description,
                   payers ( name, email, phone_e164, tax_id, external_id ) )`,
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !convite) {
    return { ok: false, mensagem: "Esse link não vale mais." };
  }
  if (new Date(convite.expires_at) <= new Date()) {
    return { ok: false, mensagem: "Esse link expirou. Peça um novo." };
  }

  const contrato = (convite.contracts as unknown as {
    id: string;
    amount_cents: number;
    frequency: string;
    due_day: number | null;
    description: string | null;
    payers: {
      name: string;
      email: string | null;
      phone_e164: string | null;
      tax_id: string | null;
      external_id: string | null;
    };
  }) ?? null;

  if (!contrato?.payers) {
    return { ok: false, mensagem: "Não conseguimos carregar esta cobrança." };
  }
  if (!contrato.payers.tax_id) {
    // O gateway exige CPF para criar a autorização. Melhor dizer com clareza
    // do que deixar o erro do Asaas vazar para a tela do pagador.
    return {
      ok: false,
      mensagem:
        "Falta o CPF no seu cadastro para autorizar o débito. Avise quem te enviou este link.",
    };
  }

  let adapter;
  try {
    adapter = await getAdapterForOrg(convite.org_id);
  } catch {
    return {
      ok: false,
      mensagem: "Não conseguimos preparar a autorização agora. Tente em alguns minutos.",
    };
  }

  // Teto: 20% acima do valor atual, para o reajuste anual comum não estourar
  // e exigir reautorização já no primeiro ano (RF-66). Acima disso, o pagador
  // é chamado de novo — e é assim que tem que ser: ele autorizou um valor, não
  // um cheque em branco.
  const tetoCentavos = Math.round(contrato.amount_cents * 1.2);

  try {
    const autorizacao = await adapter.createMandate({
      pagador: {
        nome: contrato.payers.name,
        email: contrato.payers.email,
        telefoneE164: contrato.payers.phone_e164,
        cpfCnpj: contrato.payers.tax_id,
        externalId: contrato.payers.external_id,
      },
      valorCentavos: contrato.amount_cents,
      tetoCentavos,
      periodicidade: contrato.frequency as Periodicidade,
      diaVencimento: contrato.due_day ?? 10,
      descricao: contrato.description ?? "Mensalidade",
    });

    const { data: mandato } = await supa
      .from("mandates")
      .insert({
        org_id: convite.org_id,
        contract_id: contrato.id,
        provider: adapter.provider,
        external_mandate_id: autorizacao.externalMandateId,
        status: "pending",
        ceiling_cents: tetoCentavos,
        expires_at: autorizacao.expiraEm,
      })
      .select("id")
      .single();

    if (mandato) {
      await supa
        .from("invitations")
        .update({ mandate_id: mandato.id })
        .eq("id", convite.id);
    }

    return {
      ok: true,
      qrCodePayload: autorizacao.qrCodePayload,
      qrCodeImagem: autorizacao.qrCodeImagem,
      linkPagamento: autorizacao.linkPagamento,
    };
  } catch (causa) {
    return {
      ok: false,
      mensagem:
        causa instanceof Error
          ? causa.message
          : "Não conseguimos preparar a autorização agora.",
    };
  }
}
