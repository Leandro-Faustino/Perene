"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { criarAdapterAvulso } from "@/lib/gateways";
import { encrypt } from "@/lib/crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirOrgAtual } from "@/lib/clerk/user-service";

const Entrada = z.object({
  provider: z.literal("asaas"),
  environment: z.enum(["sandbox", "production"]),
  apiKey: z.string().trim().min(20, "A chave parece curta demais. Copie ela inteira."),
});

export interface EstadoDaConexao {
  ok: boolean;
  mensagem: string;
  nomeDaConta?: string;
}

/**
 * Conectar o gateway.
 *
 * A ordem importa e não é a mais óbvia: TESTA primeiro, grava depois. Uma
 * organização marcada como "conectada" com uma chave que não funciona é pior
 * que uma organização sem gateway — ela só descobriria o problema no meio da
 * primeira onda, com os convites já disparados.
 */
export async function conectarGateway(
  _anterior: EstadoDaConexao | null,
  formulario: FormData,
): Promise<EstadoDaConexao> {
  const orgId = await exigirOrgAtual();

  const analise = Entrada.safeParse({
    provider: formulario.get("provider"),
    environment: formulario.get("environment"),
    apiKey: formulario.get("apiKey"),
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem:
        analise.error.issues[0]?.message ?? "Confira os campos e tente de novo.",
    };
  }

  const { provider, environment, apiKey } = analise.data;

  const adapter = criarAdapterAvulso(provider, {
    apiKey,
    environment,
    webhookSecret: null,
  });

  const teste = await adapter.testConnection();
  if (!teste.ok) {
    return { ok: false, mensagem: teste.mensagem };
  }

  // A chave nunca toca o banco em claro. A chave mestra vive em
  // APP_ENCRYPTION_KEY, fora do Postgres.
  const { encrypted, iv } = encrypt(apiKey);

  const supa = supabaseAdmin();

  const { data: organizacao, error: erroOrg } = await supa
    .from("organizations")
    .select("id")
    .eq("clerk_org_id", orgId)
    .maybeSingle();

  if (erroOrg || !organizacao) {
    return {
      ok: false,
      mensagem:
        "Não encontramos sua organização. Volte um passo e conclua o cadastro dela.",
    };
  }

  // Um gateway primário por organização. Rebaixa o anterior antes de promover
  // o novo — o índice único não permitiria dois.
  await supa
    .from("gateway_connections")
    .update({ is_primary: false })
    .eq("org_id", organizacao.id)
    .eq("is_primary", true);

  const { error } = await supa.from("gateway_connections").insert({
    org_id: organizacao.id,
    provider,
    environment,
    api_key_encrypted: encrypted,
    api_key_iv: iv,
    is_primary: true,
    status: "connected",
    last_checked_at: new Date().toISOString(),
  });

  if (error) {
    return {
      ok: false,
      mensagem:
        "A chave funciona, mas não conseguimos salvar agora. Tente de novo.",
    };
  }

  redirect("/importar-base");
}
