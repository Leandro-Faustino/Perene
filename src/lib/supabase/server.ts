import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

import "server-only";

/**
 * Cliente Supabase para RSC e Server Actions.
 *
 * O token da sessão Clerk vai junto em toda requisição, e o Postgres aplica
 * RLS a partir dele. Nenhuma consulta feita por aqui consegue enxergar dado de
 * outra organização, mesmo que o código esqueça o filtro — é isolamento por
 * banco, não por disciplina de quem escreve a query.
 *
 * NOTA SOBRE O PLANO: o `PLAN.md` descreve a rota antiga (JWT template do Clerk
 * assinado com o segredo do Supabase, passado no header Authorization). Essa
 * rota foi substituída pela integração de terceiros: `accessToken` recebe o
 * token de sessão do Clerk diretamente. Menos peça para configurar e sem
 * segredo compartilhado entre os dois sistemas.
 */
export function supabaseServidor() {
  return createClient(processoEnv("NEXT_PUBLIC_SUPABASE_URL"), chavePublica(), {
    accessToken: async () => {
      const { getToken } = await auth();
      return getToken();
    },
  });
}

/**
 * O Supabase renomeou as chaves de cliente: a `anon` (um JWT) virou
 * `publishable` (prefixo `sb_publishable_`). Projetos novos só recebem a nova;
 * os antigos ainda usam a legada. Aceitamos as duas, com preferência pela nova,
 * para que o mesmo código rode nos dois casos.
 */
export function chavePublica(): string {
  const chave =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!chave) {
    throw new Error(
      "Defina NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou a legada NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }
  return chave;
}

function processoEnv(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor;
}
