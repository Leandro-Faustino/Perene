import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Manutenção diária. O `vercel.json` já agendava esta rota; ela não existia.
 *
 * Duas tarefas, e a primeira é a que importa:
 *
 * 1. DESTRAVAR TRABALHOS PRESOS. Um tick que morre no meio — timeout da
 *    função, deploy durante a execução, processo derrubado — deixa o job em
 *    `running` para sempre. Ninguém o pega de novo, ninguém reclama, e o
 *    lembrete simplesmente não sai. É a falha mais silenciosa que esta fila
 *    tem, e a única defesa é uma varredura.
 *
 * 2. EXPIRAR CONVITES VENCIDOS que, por qualquer motivo, ficaram sem o job de
 *    expiração. Cinto e suspensório: um link de autorização vivo além da conta
 *    abre uma tela de cobrança com valor que já mudou.
 */

// Um job legítimo não passa disso. Acima, é resquício de execução morta.
const MINUTOS_ATE_CONSIDERAR_PRESO = 15;

export async function GET(pedido: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) {
    return Response.json({ erro: "CRON_SECRET não configurado." }, { status: 500 });
  }

  const cabecalho =
    pedido.headers.get("authorization") ?? pedido.headers.get("x-cron-secret");
  if (cabecalho?.replace(/^Bearer\s+/i, "") !== segredo) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }

  const supa = supabaseAdmin();
  const limite = new Date(
    Date.now() - MINUTOS_ATE_CONSIDERAR_PRESO * 60_000,
  ).toISOString();

  // Volta para a fila. `attempts` não é zerado: se o job está travando o worker
  // repetidamente, ele precisa esgotar as tentativas e virar evento de risco,
  // em vez de rodar em círculo para sempre.
  const { data: destravados } = await supa
    .from("jobs")
    .update({ status: "pending", locked_by: null, locked_at: null })
    .eq("status", "running")
    .lt("locked_at", limite)
    .select("id");

  const { data: expirados } = await supa
    .from("invitations")
    .update({ status: "expired" })
    .in("status", ["pending", "opened"])
    .lt("expires_at", new Date().toISOString())
    .select("id");

  return Response.json(
    {
      destravados: destravados?.length ?? 0,
      conviteExpirados: expirados?.length ?? 0,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
