import { supabaseAdmin } from "@/lib/supabase/admin";
import { criarAdapterAvulso } from "@/lib/gateways";
import { decrypt } from "@/lib/crypto";
import { enfileirar } from "@/lib/jobs/enqueue";
import { chaveDeIdempotencia } from "@/lib/jobs/types";
import type { Provider } from "@/lib/gateways/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Entrada de webhook do gateway.
 *
 * Este handler faz quatro coisas e NENHUMA regra de negócio:
 *  1. verifica a assinatura;
 *  2. grava o evento cru;
 *  3. enfileira o processamento;
 *  4. responde 200, rápido.
 *
 * Rápido importa: gateway que recebe timeout considera o endpoint morto e
 * eventualmente para de mandar — e aí a Pulse deixa de saber que uma
 * autorização foi cancelada, que é justamente o que ela promete detectar no
 * mesmo dia.
 *
 * A dedupe fica no índice único `(provider, external_event_id)`. Reenviar o
 * mesmo evento três vezes grava uma linha e enfileira um job.
 */
export async function POST(
  pedido: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const bruto = await pedido.text();

  const supa = supabaseAdmin();

  // Qual organização? Descobrimos pelo segredo do webhook, testando as conexões
  // daquele provedor. NUNCA pelo corpo: quem descobre a URL pode postar nela, e
  // um org_id vindo dali permitiria escrever na base de outra empresa.
  const { data: conexoes } = await supa
    .from("gateway_connections")
    .select("org_id, environment, api_key_encrypted, api_key_iv, webhook_secret")
    .eq("provider", provider)
    .not("webhook_secret", "is", null);

  const conexao = (conexoes ?? []).find((c) => {
    try {
      const adapter = criarAdapterAvulso(provider as Provider, {
        apiKey: decrypt(c.api_key_encrypted, c.api_key_iv),
        environment: c.environment,
        webhookSecret: c.webhook_secret,
      });
      return adapter.verifyWebhook(bruto, pedido.headers);
    } catch {
      return false;
    }
  });

  if (!conexao) {
    return new Response("assinatura inválida", { status: 401 });
  }

  const adapter = criarAdapterAvulso(provider as Provider, {
    apiKey: decrypt(conexao.api_key_encrypted, conexao.api_key_iv),
    environment: conexao.environment,
    webhookSecret: conexao.webhook_secret,
  });

  const eventos = adapter.parseWebhook(bruto);

  // Evento que não ajuda a migrar nem a manter a autorização viva é ignorado —
  // o filtro de escopo do produto vale também aqui.
  if (eventos.length === 0) {
    return Response.json({ ignorado: true });
  }

  for (const evento of eventos) {
    const { data, error } = await supa
      .from("webhook_events")
      .insert({
        org_id: conexao.org_id,
        provider,
        external_event_id: evento.externalEventId,
        event_type: evento.tipo,
        // Guardamos o cru E a forma normalizada: o cru para auditoria, o
        // normalizado para o handler não depender do formato do provedor.
        raw: { bruto: JSON.parse(bruto), normalizado: evento },
      })
      .select("id")
      .single();

    // 23505 = já vimos este evento. Não é erro.
    if (error?.code === "23505") continue;
    if (error || !data) continue;

    await enfileirar(
      { kind: "process_webhook_event", webhookEventId: data.id },
      {
        orgId: conexao.org_id,
        idempotencyKey: chaveDeIdempotencia.webhook(data.id),
      },
    );
  }

  return Response.json({ recebido: eventos.length });
}
