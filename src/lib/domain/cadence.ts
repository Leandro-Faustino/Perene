/**
 * A RÉGUA da onda (RF-43, RF-44).
 *
 * D0 / D+2 / D+5 / D+10: o convite, e depois três lembretes. É a diferença
 * entre "publicamos o endpoint" e "fizemos o trabalho" — o brand book define a
 * categoria inteira do produto por esse trabalho de convidar, lembrar,
 * acompanhar e não desistir (§3.5, Pilar MIGRAR).
 *
 * Duas regras que este módulo existe para garantir:
 *
 * 1. A régua PARA no instante da autorização. Continuar cobrando quem já
 *    autorizou é a forma mais rápida de transformar um cliente satisfeito em
 *    denúncia no WhatsApp — e denúncia derruba o número, que §3.1 classifica
 *    como risco existencial.
 * 2. Nada é enviado fora do horário civil. Mensagem de cobrança às 3h da manhã
 *    não é eficiência, é motivo para bloquear o remetente.
 */

export type PassoDaRegua = 1 | 2 | 3 | 4;

export interface Regua {
  /** Dias após o disparo em que cada passo sai. O primeiro é sempre 0. */
  dias: number[];
  /** Faixa de horário civil em que é aceitável enviar. */
  horaInicial: number;
  horaFinal: number;
}

export const REGUA_PADRAO: Regua = {
  dias: [0, 2, 5, 10],
  horaInicial: 9,
  horaFinal: 20,
};

export interface EnvioAgendado {
  passo: PassoDaRegua;
  quando: Date;
}

/**
 * Calcula quando cada passo da régua deve sair.
 *
 * Recebe `agora` por parâmetro em vez de ler o relógio: uma régua que só dá
 * para testar esperando dois dias não é uma régua testada.
 */
export function agendarRegua(
  inicio: Date,
  regua: Regua = REGUA_PADRAO,
): EnvioAgendado[] {
  return regua.dias.map((dias, indice) => {
    const quando = new Date(inicio);
    quando.setDate(quando.getDate() + dias);
    return {
      passo: (indice + 1) as PassoDaRegua,
      quando: dentroDoHorarioCivil(quando, regua),
    };
  });
}

/**
 * Empurra um horário para dentro da janela aceitável.
 *
 * Antes da abertura, espera. Depois do fechamento, vai para a manhã seguinte —
 * nunca para trás, porque antecipar um lembrete o faria chegar antes do
 * anterior.
 */
export function dentroDoHorarioCivil(
  momento: Date,
  regua: Regua = REGUA_PADRAO,
): Date {
  const ajustado = new Date(momento);
  const hora = ajustado.getHours();

  if (hora < regua.horaInicial) {
    ajustado.setHours(regua.horaInicial, 0, 0, 0);
  } else if (hora >= regua.horaFinal) {
    ajustado.setDate(ajustado.getDate() + 1);
    ajustado.setHours(regua.horaInicial, 0, 0, 0);
  }

  return ajustado;
}

/**
 * A régua deve continuar?
 *
 * Uma função só, usada tanto pelo agendador quanto pelo handler do job, para
 * que não existam duas respostas diferentes para a mesma pergunta.
 */
export function deveContinuar(estado: {
  statusDoConvite: string;
  statusDoMandato: string | null;
  expiraEm: Date | string;
  agora?: Date;
}): { continua: boolean; motivo: string } {
  const agora = estado.agora ?? new Date();

  if (estado.statusDoMandato === "authorized") {
    return { continua: false, motivo: "autorização concedida" };
  }
  if (estado.statusDoConvite === "authorized") {
    return { continua: false, motivo: "convite já autorizado" };
  }
  if (estado.statusDoConvite === "declined") {
    return { continua: false, motivo: "pagador recusou" };
  }
  if (estado.statusDoConvite === "expired") {
    return { continua: false, motivo: "convite expirado" };
  }

  const expira =
    typeof estado.expiraEm === "string" ? new Date(estado.expiraEm) : estado.expiraEm;
  if (expira.getTime() <= agora.getTime()) {
    return { continua: false, motivo: "convite expirado" };
  }

  return { continua: true, motivo: "" };
}

/**
 * Divide os convites em lotes diários (RF-42).
 *
 * O limite existe por dois motivos, e o segundo é o que importa: não parecer
 * spam, e não queimar o número. Disparar 400 mensagens de uma vez por um
 * número de WhatsApp é o caminho mais curto para o bloqueio que §3.1 descreve
 * como irreversível na prática.
 */
export function dividirEmLotesDiarios<T>(
  itens: T[],
  limiteDiario: number,
  inicio: Date,
  regua: Regua = REGUA_PADRAO,
): { dia: Date; itens: T[] }[] {
  if (limiteDiario <= 0) return [];

  const lotes: { dia: Date; itens: T[] }[] = [];

  for (let i = 0; i < itens.length; i += limiteDiario) {
    const dia = new Date(inicio);
    dia.setDate(dia.getDate() + Math.floor(i / limiteDiario));
    lotes.push({
      dia: dentroDoHorarioCivil(dia, regua),
      itens: itens.slice(i, i + limiteDiario),
    });
  }

  return lotes;
}
