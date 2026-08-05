/**
 * Tipos e formatação do convite.
 *
 * Separado de `convite.ts` de propósito: aquele é `server-only` porque toca o
 * banco, e o cartão de autorização é componente de cliente. Sem esta divisão,
 * o build quebra — e a quebra é a proteção funcionando, não um estorvo: ela
 * impede que código de acesso a dados vá parar no navegador do pagador.
 */

export interface ConviteParaPagador {
  invitationId: string;
  status: string;
  expiraEm: string;
  mandateId: string | null;
  mandateStatus: string | null;
  pagador: string;
  valorCentavos: number;
  periodicidade: string;
  diaVencimento: number | null;
  descricao: string | null;
  tetoCentavos: number | null;
  organizacao: {
    nome: string;
    logoUrl: string | null;
    corDeMarca: string | null;
    rotuloDoPagador: string;
  };
}

/** Rótulos na língua do pagador. Nada de `MONTHLY` na tela de ninguém. */
export function descreverPeriodicidade(
  periodicidade: string,
  diaVencimento: number | null,
): string {
  const nome =
    {
      weekly: "toda semana",
      monthly: "todo mês",
      quarterly: "a cada três meses",
      semiannual: "a cada seis meses",
      annual: "uma vez por ano",
    }[periodicidade] ?? "todo mês";

  return diaVencimento ? `${nome}, no dia ${diaVencimento}` : nome;
}
