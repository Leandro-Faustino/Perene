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
    // O token vai no header em vez de pelo callback `accessToken`.
    //
    // Motivo prático: `accessToken` faz o supabase-js tentar autenticar o
    // canal de Realtime na construção do cliente, e este cliente é criado uma
    // vez por requisição de servidor, onde Realtime não é usado. O efeito era
    // um "Failed to set initial Realtime auth token" por render.
    //
    // Renovação de token não se perde: o cliente vive o tempo de uma
    // requisição, e o Clerk entrega um token válido a cada uma. Realtime, que
    // precisa de renovação, é assunto do cliente de browser.
    global: {
      fetch: async (entrada, init) => {
        const { getToken } = await auth();
        const token = await getToken();

        const cabecalhos = new Headers(init?.headers);
        if (token) cabecalhos.set("Authorization", `Bearer ${token}`);

        return fetch(entrada, { ...init, headers: cabecalhos });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Cliente sem sessão, para a página do pagador.
 *
 * Ele chega por um link e não faz login — nem deve: é uma tela e um botão
 * (§3.6). Sem token, este cliente age como `anon`, que não enxerga nenhuma
 * tabela. O acesso ao convite passa por `pulse.convite_por_token`, uma função
 * SECURITY DEFINER que devolve um convite exato e nada mais.
 *
 * Deliberadamente NÃO é o cliente service-role: aquela chave ignora RLS em
 * todas as tabelas, e carregá-la numa rota pública transformaria qualquer bug
 * ali em vazamento da base inteira.
 */
export function supabasePublico() {
  return createClient(processoEnv("NEXT_PUBLIC_SUPABASE_URL"), chavePublica(), {
    auth: { persistSession: false, autoRefreshToken: false },
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
