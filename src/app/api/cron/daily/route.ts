import { rodarDiario } from "@/lib/jobs/daily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — agendamentos em lote podem levar mais que o tick

/**
 * Cron diário — `vercel.json` dispara em `0 8 * * *` (08h UTC = 05h BRT).
 *
 * Três operações, nesta ordem:
 * 1. D-3 — aviso pré-débito para quem vence daqui a 3 dias.
 * 2. D0  — agenda cobranças de todos os contratos que vencem hoje.
 * 3. D+1 — rede de segurança: re-enfileira sonda de cobranças que ficaram
 *           presas em `scheduled` ou `retrying` do dia anterior.
 *
 * Autenticação: mesmo esquema do `/api/cron/tick` — segredo no header.
 * A rota é pública no `proxy.ts`; a proteção é o segredo, não o Clerk.
 */
export async function GET(pedido: Request) {
  const segredo = process.env.CRON_SECRET;

  if (!segredo) {
    return Response.json(
      { erro: "CRON_SECRET não configurado." },
      { status: 500 },
    );
  }

  const cabecalho =
    pedido.headers.get("authorization") ?? pedido.headers.get("x-cron-secret");
  const informado = cabecalho?.replace(/^Bearer\s+/i, "");

  if (informado !== segredo) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }

  try {
    const resumo = await rodarDiario();
    return Response.json(resumo, { headers: { "Cache-Control": "no-store" } });
  } catch (causa) {
    return Response.json(
      { erro: causa instanceof Error ? causa.message : String(causa) },
      { status: 500 },
    );
  }
}
