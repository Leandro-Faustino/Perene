import { supabaseAdmin } from "@/lib/supabase/admin";
import { criarProvedorDeMensagem } from "@/lib/messaging/zapi";

import type { PayloadDeJob, ResultadoDoJob } from "../types";

import "server-only";

/**
 * Envia uma mensagem já gravada na tabela `messages`.
 *
 * A mensagem é montada por quem a cria (ex: `charge-status-poll`) e gravada
 * com `status='queued'`. Este handler é responsável apenas pelo transporte —
 * a separação existe para que a lógica de composição e a lógica de envio
 * possam falhar e ser retriadas de forma independente.
 *
 * Idempotente: mensagem já enviada (status != 'queued') é ignorada sem erro.
 */
export async function enviarMensagem(
  payload: Extract<PayloadDeJob, { kind: "send_message" }>,
): Promise<ResultadoDoJob> {
  const supa = supabaseAdmin();

  const { data: mensagem, error } = await supa
    .from("messages")
    .select("id, status, to_address, body")
    .eq("id", payload.messageId)
    .maybeSingle();

  if (error || !mensagem) {
    return { estado: "falhou", erro: "mensagem não encontrada", recuperavel: false };
  }

  if (mensagem.status !== "queued") {
    return { estado: "feito", detalhe: `já processada (${mensagem.status})` };
  }

  const resultado = await criarProvedorDeMensagem().enviar({
    para: mensagem.to_address,
    corpo: mensagem.body,
  });

  await supa
    .from("messages")
    .update({
      status: resultado.ok ? "sent" : "failed",
      provider_message_id: resultado.idExterno ?? null,
      error: resultado.erro ?? null,
      sent_at: resultado.ok ? new Date().toISOString() : null,
    })
    .eq("id", mensagem.id);

  if (!resultado.ok) {
    return {
      estado: "falhou",
      erro: resultado.erro ?? "falha no envio",
      recuperavel: resultado.recuperavel ?? false,
    };
  }

  return { estado: "feito" };
}
