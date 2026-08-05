import { carregarConvite } from "@/lib/domain/convite";

export const dynamic = "force-dynamic";

/**
 * Polling do status da autorização (RF-53).
 *
 * O pagador fica nesta tela enquanto o pagamento liquida — e é o único momento
 * em que a marca fica visível por vários segundos seguidos, com o símbolo
 * pulsando (§5.6). Esta rota é o que diz à tela quando parar de pulsar.
 *
 * Devolve o mínimo: um estado. Nada de nome, valor ou dado do pagador — a
 * página já os tem, e uma rota de polling que repete dado pessoal a cada três
 * segundos é superfície sem necessidade.
 */
export async function GET(
  _pedido: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const convite = await carregarConvite(token);

  if (!convite) {
    return Response.json({ estado: "invalido" }, { status: 404 });
  }

  const estado =
    convite.mandateStatus === "authorized" || convite.status === "authorized"
      ? "autorizado"
      : convite.mandateStatus === "rejected"
        ? "recusado"
        : convite.mandateStatus === "cancelled" || convite.mandateStatus === "expired"
          ? "encerrado"
          : "aguardando";

  return Response.json(
    { estado },
    { headers: { "Cache-Control": "no-store" } },
  );
}
