/**
 * Contraste WCAG.
 *
 * Existe por causa de uma regra do brand book (§5.2) que não é sugestão: a
 * página de autorização e o PDF do diagnóstico usam a cor da ORGANIZAÇÃO, não
 * a nossa. Essa cor chega arbitrária — o cliente escolheu, subiu, e pode ser
 * um amarelo sobre o qual texto branco some.
 *
 * "Nunca confiar na cor que o cliente subiu." Então calculamos na hora do
 * render e trocamos o texto para grafite quando o branco reprova.
 */

const GRAFITE = "#12161C";
const BRANCO = "#FFFFFF";

export function paraRgb(hex: string): [number, number, number] | null {
  const limpo = hex.trim().replace(/^#/, "");

  const expandido =
    limpo.length === 3
      ? limpo
          .split("")
          .map((c) => c + c)
          .join("")
      : limpo;

  if (!/^[0-9a-fA-F]{6}$/.test(expandido)) return null;

  return [
    parseInt(expandido.slice(0, 2), 16),
    parseInt(expandido.slice(2, 4), 16),
    parseInt(expandido.slice(4, 6), 16),
  ];
}

/** Luminância relativa, conforme WCAG 2.1. */
export function luminancia(hex: string): number | null {
  const rgb = paraRgb(hex);
  if (!rgb) return null;

  const [r, g, b] = rgb.map((canal) => {
    const s = canal / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores. 1:1 é igual, 21:1 é preto sobre branco. */
export function razaoDeContraste(a: string, b: string): number | null {
  const la = luminancia(a);
  const lb = luminancia(b);
  if (la === null || lb === null) return null;

  const claro = Math.max(la, lb);
  const escuro = Math.min(la, lb);
  return (claro + 0.05) / (escuro + 0.05);
}

/**
 * Qual cor de texto usar sobre um fundo arbitrário.
 *
 * Devolve branco quando ele passa em AA (4,5:1); senão grafite. Cor inválida
 * cai em grafite — errar para o lado legível é o único erro aceitável aqui.
 */
export function textoSobre(fundo: string): string {
  const comBranco = razaoDeContraste(fundo, BRANCO);
  if (comBranco === null) return GRAFITE;
  return comBranco >= 4.5 ? BRANCO : GRAFITE;
}

/**
 * A cor de destaque da organização, validada.
 *
 * Se a cor não veio, ou veio inválida, cai no cobalto da marca. É o único
 * ponto do sistema em que a Pulse aparece por cima da organização, e é
 * deliberado: melhor a nossa cor do que um destaque ilegível.
 */
export function corDeDestaque(corDaOrganizacao: string | null | undefined): string {
  if (!corDaOrganizacao) return "#2B50F5";
  return paraRgb(corDaOrganizacao) ? corDaOrganizacao : "#2B50F5";
}
