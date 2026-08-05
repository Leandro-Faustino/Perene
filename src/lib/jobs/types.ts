/**
 * A fila.
 *
 * União discriminada por `kind`: adicionar um tipo de job sem tratar o caso no
 * worker vira erro de compilação, não um job que fica preso em `pending` para
 * sempre. Numa operação em que job parado significa lembrete não enviado, o
 * compilador é o vigia mais barato que existe.
 */
export type PayloadDeJob =
  | { kind: "send_cadence_step"; invitationId: string; passo: 1 | 2 | 3 | 4 }
  | { kind: "expire_invitation"; invitationId: string }
  | { kind: "process_webhook_event"; webhookEventId: string }
  | { kind: "send_message"; messageId: string };

export type TipoDeJob = PayloadDeJob["kind"];

export interface Job {
  id: string;
  org_id: string | null;
  kind: TipoDeJob;
  payload: Record<string, unknown>;
  run_at: string;
  status: "pending" | "running" | "done" | "failed";
  attempts: number;
  max_attempts: number;
  idempotency_key: string | null;
  last_error: string | null;
}

/**
 * Resultado de um handler.
 *
 * `reagendar` existe para o caso legítimo de "ainda não é hora" — por exemplo,
 * um passo da régua que caiu fora do horário civil. É diferente de falha: não
 * consome tentativa nem gera evento de risco.
 */
export type ResultadoDoJob =
  | { estado: "feito"; detalhe?: string }
  | { estado: "reagendar"; quando: Date; detalhe?: string }
  | { estado: "falhou"; erro: string; recuperavel: boolean };

/**
 * Chaves de idempotência.
 *
 * Convenção única, num lugar só. É o que garante que reenviar o mesmo webhook
 * três vezes, ou o cron rodar duas vezes no mesmo minuto, não vire três
 * mensagens para a mesma pessoa.
 */
export const chaveDeIdempotencia = {
  reguaPasso: (invitationId: string, passo: number) =>
    `cadence:${invitationId}:step${passo}`,
  expirarConvite: (invitationId: string) => `expire:${invitationId}`,
  webhook: (webhookEventId: string) => `whev:${webhookEventId}`,
  mensagem: (messageId: string) => `msg:${messageId}`,
};

/**
 * Espera entre tentativas, com teto.
 *
 * Exponencial a partir de um minuto: 1, 2, 4, 8, 16. O teto de 30 minutos
 * existe porque uma mensalidade não melhora esperando horas — se ainda não foi
 * depois disso, o problema não é passageiro e precisa virar evento de risco.
 */
export function esperaAntesDeRetentar(tentativas: number): number {
  const minutos = Math.min(2 ** Math.max(0, tentativas - 1), 30);
  return minutos * 60_000;
}
