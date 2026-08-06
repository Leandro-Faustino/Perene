/**
 * Lógica pura de reajuste de valor (RF-66).
 *
 * Um mandato tem um teto (ceiling_cents): o pagador autorizou débitos até
 * esse valor. Se o novo valor ultrapassa o teto, o mandato atual não cobre —
 * cobrar acima sem nova autorização seria débito não consentido.
 *
 * A função é pura e testável sem banco. A decisão de criar a nova convite e
 * agendar a régua vive na action, não aqui.
 */

/**
 * Retorna true se o reajuste exige que o pagador reautorize o mandato.
 *
 * - Sem mandato autorizado: nada a verificar (talvez seja pix_manual).
 * - Sem teto registrado: gateway não informou o ceiling — não bloqueamos,
 *   pois poderia travar contratos legítimos por falta de dado.
 * - Com teto: compara estritamente (igual ao teto é seguro).
 */
export function precisaReautorizar(
  novoValorCentavos: number,
  ceilingCents: number | null | undefined,
): boolean {
  if (!ceilingCents) return false;
  return novoValorCentavos > ceilingCents;
}
