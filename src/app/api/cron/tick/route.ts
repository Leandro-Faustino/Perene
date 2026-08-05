import { rodarTick } from "@/lib/jobs/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * O worker, a cada minuto (`vercel.json`).
 *
 * A rota é pública no `proxy.ts` — o Vercel Cron não carrega sessão — então a
 * autenticação é o segredo no header. Sem ele, qualquer um dispara a fila de
 * qualquer cliente.
 */
export async function GET(pedido: Request) {
  const segredo = process.env.CRON_SECRET;

  if (!segredo) {
    return Response.json(
      { erro: "CRON_SECRET não configurado." },
      { status: 500 },
    );
  }

  // A Vercel envia `Authorization: Bearer <CRON_SECRET>`; aceitamos também um
  // header próprio, para dar para chamar em desenvolvimento com curl.
  const cabecalho =
    pedido.headers.get("authorization") ?? pedido.headers.get("x-cron-secret");
  const informado = cabecalho?.replace(/^Bearer\s+/i, "");

  if (informado !== segredo) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }

  try {
    const resumo = await rodarTick();
    return Response.json(resumo, { headers: { "Cache-Control": "no-store" } });
  } catch (causa) {
    return Response.json(
      { erro: causa instanceof Error ? causa.message : String(causa) },
      { status: 500 },
    );
  }
}
