import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import "server-only";

/**
 * Cliente service-role. Ignora RLS por completo.
 *
 * USO PERMITIDO: apenas em handlers de webhook e handlers de job — contextos
 * sem sessão de usuário.
 *
 * REGRA INEGOCIÁVEL: toda query feita por aqui filtra `.eq('org_id', orgId)`
 * explicitamente, e o `orgId` vem SEMPRE de uma FK do próprio evento já
 * gravado, nunca do corpo do webhook. O payload de webhook é entrada não
 * confiável: quem descobre a URL pode postar nela, e um `org_id` vindo do
 * corpo permitiria escrever na organização de outra pessoa.
 */
let instancia: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (instancia) return instancia;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !chave) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para o cliente admin.",
    );
  }

  instancia = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return instancia;
}
