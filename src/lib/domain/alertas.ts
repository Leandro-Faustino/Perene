import { supabaseAdmin } from "@/lib/supabase/admin";
import { enfileirar } from "@/lib/jobs/enqueue";

import "server-only";

/**
 * Envia uma mensagem WhatsApp ao operador da organização.
 *
 * Fire-and-forget deliberado: alertas são informativos — falhar ao enviar um
 * alerta não deve interromper o fluxo que o gerou (ex: processar um webhook).
 * O operador ainda vê o evento em /atencao; o WhatsApp é conveniência,
 * não dado primário.
 *
 * Não cria mensagem se `notification_phone` não estiver configurado — a org
 * optou por não receber alertas.
 */
export async function alertarOperador(
  orgId: string,
  corpo: string,
): Promise<void> {
  try {
    const supa = supabaseAdmin();

    const { data: org } = await supa
      .from("organizations")
      .select("id, notification_phone")
      .eq("id", orgId)
      .maybeSingle();

    if (!org?.notification_phone) return;

    const { data: mensagem } = await supa
      .from("messages")
      .insert({
        org_id: orgId,
        template_key: null,
        channel: "whatsapp",
        to_address: org.notification_phone,
        body: corpo,
        status: "queued",
      })
      .select("id")
      .single();

    if (!mensagem) return;

    await enfileirar(
      { kind: "send_message", messageId: mensagem.id },
      { orgId, idempotencyKey: `alerta:${orgId}:${mensagem.id}` },
    );
  } catch {
    // Silencia: alerta não pode derrubar o fluxo principal.
  }
}

/**
 * Monta o texto do alerta de risco crítico.
 *
 * Tom: objetivo, sem jargão. O operador precisa entender o que aconteceu e
 * saber que pode ver mais detalhes em /atencao — sem dramatizar.
 */
export function montarAlertaDeRisco(
  kind: string,
  detalhe: string | null,
  nomeDoPagador?: string,
): string {
  const ROTULOS: Record<string, string> = {
    mandate_cancelled: "Autorização cancelada",
    mandate_expired: "Autorização expirada",
    charge_failed_repeated: "Cobrança não passou",
    ceiling_exceeded: "Valor acima do teto",
    integration_error: "Erro de integração",
  };

  const rotulo = ROTULOS[kind] ?? kind;
  const pagadorParte = nomeDoPagador ? ` — ${nomeDoPagador}` : "";
  const detalheParte = detalhe ? `\n${detalhe}` : "";

  return (
    `⚠️ Pulse: ${rotulo}${pagadorParte}${detalheParte}\n\n` +
    `Veja os detalhes em /atencao.`
  );
}

/**
 * Monta o resumo diário da operação.
 */
export function montarResumoDiario(dados: {
  organizacao: string;
  cobrancasSucesso: number;
  cobrancasFalhas: number;
  mensagensEnviadas: number;
  riscoPendente: number;
  data: string;
}): string {
  const linhas: string[] = [
    `📊 Pulse — resumo de ${dados.data} (${dados.organizacao})`,
    "",
  ];

  if (dados.cobrancasSucesso > 0 || dados.cobrancasFalhas > 0) {
    linhas.push(
      `Cobranças: ${dados.cobrancasSucesso} ok` +
        (dados.cobrancasFalhas > 0
          ? `, ${dados.cobrancasFalhas} com falha`
          : ""),
    );
  }

  if (dados.mensagensEnviadas > 0) {
    linhas.push(`Mensagens enviadas: ${dados.mensagensEnviadas}`);
  }

  if (dados.riscoPendente > 0) {
    linhas.push(
      `Atenção: ${dados.riscoPendente} item${dados.riscoPendente > 1 ? "s" : ""} pendente${dados.riscoPendente > 1 ? "s" : ""} em /atencao`,
    );
  }

  if (
    dados.cobrancasSucesso === 0 &&
    dados.cobrancasFalhas === 0 &&
    dados.riscoPendente === 0
  ) {
    linhas.push("Nenhuma operação hoje. Tudo tranquilo.");
  }

  return linhas.join("\n");
}
