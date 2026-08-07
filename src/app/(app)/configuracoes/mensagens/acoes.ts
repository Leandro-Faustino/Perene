"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { supabaseServidor } from "@/lib/supabase/server";
import { exigirOrgAtual } from "@/lib/clerk/user-service";

export interface ResultadoDeSalvamento {
  ok: boolean;
  mensagem: string;
}

const EntradaTemplate = z.object({
  key: z.string().min(1),
  body: z.string().max(2000, "Máximo 2000 caracteres."),
});

/**
 * Salva (upsert) ou restaura (delete) um template customizado.
 *
 * Body vazio = restaurar ao texto padrão (remove o custom da tabela).
 * A chave de upsert é (org_id, key, channel) — sem index unique na migration
 * usamos delete+insert para garantir idempotência.
 */
export async function salvarTemplate(
  _anterior: ResultadoDeSalvamento | null,
  formulario: FormData,
): Promise<ResultadoDeSalvamento> {
  await exigirOrgAtual();
  const supa = supabaseServidor();

  const analise = EntradaTemplate.safeParse({
    key: formulario.get("key"),
    body: (formulario.get("body") as string)?.trim(),
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem: analise.error.issues[0]?.message ?? "Confira os campos.",
    };
  }

  const { key, body } = analise.data;

  const { data: org } = await supa
    .from("organizations")
    .select("id")
    .maybeSingle();

  if (!org) return { ok: false, mensagem: "Organização não encontrada." };

  // Restaurar padrão: remove o custom.
  if (!body) {
    await supa
      .from("message_templates")
      .delete()
      .eq("org_id", org.id)
      .eq("key", key)
      .eq("channel", "whatsapp");

    revalidatePath("/configuracoes/mensagens");
    return { ok: true, mensagem: "Template restaurado ao padrão." };
  }

  // Upsert via delete+insert para evitar constraint de (org_id, key, channel).
  await supa
    .from("message_templates")
    .delete()
    .eq("org_id", org.id)
    .eq("key", key)
    .eq("channel", "whatsapp");

  const { error } = await supa.from("message_templates").insert({
    org_id: org.id,
    key,
    channel: "whatsapp",
    meta_category: "utility",
    body,
  });

  if (error) {
    return {
      ok: false,
      mensagem: `Não foi possível salvar: ${error.message}`,
    };
  }

  revalidatePath("/configuracoes/mensagens");
  return { ok: true, mensagem: "Template salvo." };
}

const NICHOS_VALIDOS = ["academia", "clinica", "condominio", "escola", "clube", "outro"] as const;

const EntradaNicho = z.object({
  nicho: z.enum([...NICHOS_VALIDOS, ""] as [string, ...string[]]).optional(),
});

/**
 * Salva (ou limpa) o nicho da organização.
 * Nicho vazio = sem nicho → templates genéricos.
 */
export async function salvarNicho(
  _anterior: ResultadoDeSalvamento | null,
  formulario: FormData,
): Promise<ResultadoDeSalvamento> {
  await exigirOrgAtual();
  const supa = supabaseServidor();

  const analise = EntradaNicho.safeParse({ nicho: formulario.get("nicho") });
  if (!analise.success) {
    return { ok: false, mensagem: "Segmento inválido." };
  }

  const nicho = analise.data.nicho || null;

  const { error } = await supa
    .from("organizations")
    .update({ nicho });

  if (error) {
    return { ok: false, mensagem: `Erro ao salvar: ${error.message}` };
  }

  revalidatePath("/configuracoes/mensagens");
  return { ok: true, mensagem: nicho ? "Segmento salvo." : "Segmento removido." };
}

const EntradaNotificacao = z.object({
  notification_phone: z
    .string()
    .max(20)
    .regex(/^\+?[\d\s()-]*$/, "Número inválido.")
    .optional()
    .transform((v) => (v?.trim() || null)),
});

/**
 * Salva o telefone de notificação do operador.
 */
export async function salvarNotificacao(
  _anterior: ResultadoDeSalvamento | null,
  formulario: FormData,
): Promise<ResultadoDeSalvamento> {
  await exigirOrgAtual();
  const supa = supabaseServidor();

  const analise = EntradaNotificacao.safeParse({
    notification_phone: formulario.get("notification_phone"),
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem: analise.error.issues[0]?.message ?? "Confira os campos.",
    };
  }

  const { error } = await supa
    .from("organizations")
    .update({ notification_phone: analise.data.notification_phone });

  if (error) {
    return { ok: false, mensagem: `Erro ao salvar: ${error.message}` };
  }

  revalidatePath("/configuracoes/mensagens");
  return { ok: true, mensagem: "Configuração salva." };
}
