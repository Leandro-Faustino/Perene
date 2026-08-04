import { decrypt } from "@/lib/crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

import type { GatewayAdapter, Provider } from "./types";
import { AdapterAsaas } from "./asaas";

import "server-only";

/**
 * Fábrica de adapter por organização.
 *
 * É o ÚNICO lugar do sistema onde a credencial de um cliente é descriptografada,
 * e por isso é `server-only`. Se este arquivo virar importável do browser, a
 * chave de API de todo cliente vaza junto.
 *
 * Também é o único lugar que conhece nome de provedor. Quem chama recebe um
 * `GatewayAdapter` e não sabe — nem deve saber — se por trás está Asaas ou
 * outro. É o que torna o segundo adapter uma adição, não uma reforma.
 */
const REGISTRO: Record<Provider, (config: ConfigDoBanco) => GatewayAdapter> = {
  asaas: (config) =>
    new AdapterAsaas({
      apiKey: config.apiKey,
      environment: config.environment,
      webhookSecret: config.webhookSecret,
    }),
};

interface ConfigDoBanco {
  apiKey: string;
  environment: "sandbox" | "production";
  webhookSecret: string | null;
}

/**
 * Adapter construído a partir de credenciais em memória, sem passar pelo banco.
 *
 * Existe para um caso só: testar a chave que o operador acabou de colar, ANTES
 * de gravá-la. Salvar primeiro e descobrir depois que a chave não presta
 * deixaria a organização num estado "conectada" que não conecta — e o operador
 * descobriria no meio da primeira onda.
 */
export function criarAdapterAvulso(
  provider: Provider,
  config: ConfigDoBanco,
): GatewayAdapter {
  const construir = REGISTRO[provider];
  if (!construir) {
    throw new Error(`Provedor sem adapter implementado: ${provider}`);
  }
  return construir(config);
}

export async function getAdapterForOrg(orgId: string): Promise<GatewayAdapter> {
  const supa = supabaseAdmin();

  const { data, error } = await supa
    .from("gateway_connections")
    .select("provider, environment, api_key_encrypted, api_key_iv, webhook_secret")
    .eq("org_id", orgId)
    .eq("is_primary", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao carregar a conexão de gateway: ${error.message}`);
  }
  if (!data) {
    throw new Error(
      "Esta organização ainda não tem gateway conectado. Conclua o onboarding em /conectar-gateway.",
    );
  }

  const construir = REGISTRO[data.provider as Provider];
  if (!construir) {
    throw new Error(`Provedor sem adapter implementado: ${data.provider}`);
  }

  return construir({
    apiKey: decrypt(data.api_key_encrypted, data.api_key_iv),
    environment: data.environment,
    webhookSecret: data.webhook_secret,
  });
}

/**
 * Variante para o handler de webhook, que descobre a organização a partir do
 * provedor e do id externo — nunca a partir do corpo do webhook.
 */
export async function getAdapterParaVerificacao(
  provider: Provider,
  orgId: string,
): Promise<GatewayAdapter> {
  const adapter = await getAdapterForOrg(orgId);
  if (adapter.provider !== provider) {
    throw new Error(
      `Webhook de ${provider} chegou para uma organização conectada a ${adapter.provider}.`,
    );
  }
  return adapter;
}

export type { GatewayAdapter } from "./types";
