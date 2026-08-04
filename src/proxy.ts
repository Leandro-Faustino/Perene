import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Em Next.js 16 a convenção `middleware.ts` foi renomeada para `proxy.ts` e a
 * função exportada precisa se chamar `proxy`. O `PLAN.md` ainda descreve
 * `src/middleware.ts` — mesma responsabilidade, arquivo novo.
 *
 * Rotas públicas, nesta ordem de importância:
 * - `/autorizar/*` é a página do pagador. Ela NÃO pode exigir login: uma tela,
 *   um botão, sem cadastro (brand book §3.6). Se cair atrás do Clerk, o
 *   produto inteiro para de funcionar para quem ele existe para servir.
 * - `/api/webhooks/*` recebe do gateway, que não carrega sessão. A autenticação
 *   ali é a assinatura do webhook, verificada pelo adapter.
 * - `/api/cron/*` é chamado pelo Vercel Cron, autenticado por segredo próprio.
 * - o site público, incluindo a calculadora, que mostra o número antes de pedir
 *   cadastro — inverter isso inverteria a lógica da marca (§6.3).
 */
const ehRotaPublica = createRouteMatcher([
  "/",
  "/como-funciona",
  "/para-quem",
  "/calculadora",
  "/precos",
  "/conteudo(.*)",
  "/sobre",
  "/entrar(.*)",
  "/cadastrar(.*)",
  "/autorizar(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/api/health",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (!ehRotaPublica(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Tudo, menos arquivos internos do Next e estáticos — a menos que apareçam
    // em query string.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre roda para rotas de API.
    "/(api|trpc)(.*)",
  ],
};
