import { randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Token do convite.
 *
 * Vira URL pública: `/autorizar/{token}`. Quem tiver o link autoriza um débito
 * recorrente na própria conta — então o token é a única credencial dessa
 * página, e precisa se comportar como uma.
 *
 * Três decisões que vêm disso:
 *
 * 1. OPACO. Não deriva de id, CPF, e-mail nem sequência. Se desse para
 *    adivinhar o token de outro contrato a partir do seu, dava para abrir a
 *    tela de autorização de um estranho e ver nome e valor.
 * 2. 256 bits de entropia. Um espaço de busca que não se varre.
 * 3. Base64 seguro para URL, sem `+`, `/` ou `=` — esses viram %2B e %2F
 *    quando o link passa por WhatsApp, e o link quebra na mão do pagador.
 */

const BYTES = 32; // 256 bits

export function gerarToken(): string {
  return randomBytes(BYTES).toString("base64url");
}

/**
 * Formato esperado, para descartar lixo antes de ir ao banco. Não prova que o
 * token existe — só que vale a pena procurar.
 */
export function pareceToken(valor: string): boolean {
  return /^[A-Za-z0-9_-]{40,64}$/.test(valor);
}

/**
 * Comparação em tempo constante.
 *
 * A busca por token normalmente acontece no índice único do banco, mas onde
 * houver comparação em memória ela passa por aqui: comparar segredo com `===`
 * vaza o prefixo correto pelo tempo de resposta.
 */
export function tokensIguais(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Validade do convite.
 *
 * 14 dias por padrão. Curto demais e a régua D+10 morre antes do último
 * lembrete; longo demais e um link esquecido continua abrindo uma tela de
 * autorização meses depois, com um valor que já mudou.
 */
export const DIAS_DE_VALIDADE = 14;

export function calcularExpiracao(
  criadoEm: Date,
  dias = DIAS_DE_VALIDADE,
): Date {
  const expira = new Date(criadoEm);
  expira.setDate(expira.getDate() + dias);
  return expira;
}

export function expirou(expiraEm: Date | string, agora = new Date()): boolean {
  const data = typeof expiraEm === "string" ? new Date(expiraEm) : expiraEm;
  return data.getTime() <= agora.getTime();
}
