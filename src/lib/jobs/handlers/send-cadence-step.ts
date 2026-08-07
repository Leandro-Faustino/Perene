import { supabaseAdmin } from "@/lib/supabase/admin";
import { criarProvedorDeMensagem } from "@/lib/messaging/zapi";
import { templateDoPasso, montarMensagem } from "@/lib/messaging/templates";
import { resolverCorpoDoTemplate, primeiroNome } from "@/lib/messaging/custom-templates";
import { formatarReais } from "@/lib/utils";
import { deveContinuar, dentroDoHorarioCivil } from "@/lib/domain/cadence";

import type { PayloadDeJob, ResultadoDoJob } from "../types";

import "server-only";

/**
 * Um passo da régua.
 *
 * A primeira coisa que ele faz é perguntar se ainda deve enviar — e essa é a
 * parte mais importante do handler. Entre o agendamento e a execução podem ter
 * passado dez dias: o pagador pode ter autorizado, recusado, ou o convite pode
 * ter expirado. Enviar assim mesmo é o comportamento que faz o número ser
 * denunciado.
 */
export async function enviarPassoDaRegua(
  payload: Extract<PayloadDeJob, { kind: "send_cadence_step" }>,
): Promise<ResultadoDoJob> {
  const supa = supabaseAdmin();

  const { data: convite, error } = await supa
    .from("invitations")
    .select(
      `id, org_id, token, status, expires_at,
       mandates ( status ),
       contracts ( amount_cents, payers ( name, phone_e164 ) ),
       organizations ( name, payer_label, nicho )`,
    )
    .eq("id", payload.invitationId)
    .maybeSingle();

  if (error || !convite) {
    return { estado: "falhou", erro: "convite não encontrado", recuperavel: false };
  }

  const mandato = convite.mandates as unknown as { status: string } | null;
  const decisao = deveContinuar({
    statusDoConvite: convite.status,
    statusDoMandato: mandato?.status ?? null,
    expiraEm: convite.expires_at,
  });

  if (!decisao.continua) {
    // Não é falha: é a régua funcionando. O motivo fica registrado para
    // aparecer na linha do tempo do contrato.
    return { estado: "feito", detalhe: decisao.motivo };
  }

  // Se o job atrasou e caiu fora do horário civil, empurra em vez de enviar.
  // Mensagem de cobrança às 3h não é eficiência, é motivo para bloqueio.
  const agora = new Date();
  const permitido = dentroDoHorarioCivil(agora);
  if (permitido.getTime() > agora.getTime()) {
    return {
      estado: "reagendar",
      quando: permitido,
      detalhe: "fora do horário civil",
    };
  }

  const contrato = convite.contracts as unknown as {
    amount_cents: number;
    payers: { name: string; phone_e164: string | null };
  };
  const organizacao = convite.organizations as unknown as {
    name: string;
    payer_label: string;
    nicho: string | null;
  };

  if (!contrato?.payers?.phone_e164) {
    return {
      estado: "falhou",
      erro: "pagador sem telefone cadastrado",
      recuperavel: false,
    };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const link = `${base}/autorizar/${convite.token}`;
  const chave = templateDoPasso(payload.passo);

  // Resolução da mensagem: custom > nicho > genérico.
  const dadosDeNicho = {
    pagador: contrato.payers.name,
    organizacao: organizacao.name,
    valorCentavos: contrato.amount_cents,
    link,
  };
  const resolvido = await resolverCorpoDoTemplate({
    orgId: convite.org_id,
    nicho: organizacao.nicho,
    chave,
    dadosDeNicho,
    variaveisCustom: {
      pagador: primeiroNome(contrato.payers.name),
      organizacao: organizacao.name,
      valor: formatarReais(contrato.amount_cents),
      link,
    },
  });

  const corpo = resolvido ?? montarMensagem(payload.passo, {
    pagador: contrato.payers.name,
    organizacao: organizacao.name,
    valorCentavos: contrato.amount_cents,
    link,
    rotuloDoPagador: organizacao.payer_label,
  }).corpo;

  // Grava a mensagem ANTES de enviar. Se o envio explodir no meio, existe
  // registro do que foi tentado — sem isso, a linha do tempo do contrato mente.
  const { data: registro } = await supa
    .from("messages")
    .insert({
      org_id: convite.org_id,
      invitation_id: convite.id,
      template_key: chave,
      channel: "whatsapp",
      to_address: contrato.payers.phone_e164,
      body: corpo,
      status: "queued",
    })
    .select("id")
    .single();

  const resultado = await criarProvedorDeMensagem().enviar({
    para: contrato.payers.phone_e164,
    corpo,
  });

  await supa
    .from("messages")
    .update({
      status: resultado.ok ? "sent" : "failed",
      provider_message_id: resultado.idExterno ?? null,
      error: resultado.erro ?? null,
      sent_at: resultado.ok ? new Date().toISOString() : null,
    })
    .eq("id", registro?.id ?? "");

  if (!resultado.ok) {
    return {
      estado: "falhou",
      erro: resultado.erro ?? "falha no envio",
      recuperavel: resultado.recuperavel ?? false,
    };
  }

  return { estado: "feito" };
}
