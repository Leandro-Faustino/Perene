import { formatarReais } from "@/lib/utils";

/**
 * Os textos da régua.
 *
 * São produto, não copy — o brand book trata o vocabulário como requisito
 * funcional (§3.2, Insight 8). Ficam aqui, juntos e versionados, para que a
 * auditoria trimestral consiga lê-los de uma vez.
 *
 * As regras que todos seguem:
 * - o pagador NUNCA é chamado de devedor ou inadimplente (§4.3);
 * - quem assina é a organização, não a Pulse;
 * - nada de urgência fabricada — produto financeiro vendido com pressa perde
 *   a credibilidade de que a marca inteira depende (§4.6);
 * - o valor aparece em todas, porque é o que a pessoa precisa conferir.
 */

export interface DadosDaMensagem {
  pagador: string;
  organizacao: string;
  valorCentavos: number;
  link: string;
  rotuloDoPagador: string;
}

export type ChaveDeTemplate =
  | "convite_d0"
  | "convite_d2"
  | "convite_d5"
  | "convite_d10";

const PRIMEIRO_NOME = (nome: string) => nome.trim().split(/\s+/)[0];

export const TEMPLATES: Record<
  ChaveDeTemplate,
  { categoriaMeta: "utility"; montar: (d: DadosDaMensagem) => string }
> = {
  // D0 — o convite. Explica o que é, quanto é, e o que muda para ele.
  convite_d0: {
    categoriaMeta: "utility",
    montar: (d) =>
      `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
      `Estamos mudando a forma de cobrar a mensalidade de ${formatarReais(d.valorCentavos)} para Pix Automático — ` +
      `você autoriza uma vez e não precisa lembrar de pagar nos próximos meses.\n\n` +
      `Leva menos de um minuto: ${d.link}\n\n` +
      `Qualquer dúvida, é só responder aqui.`,
  },

  // D+2 — lembrete curto. Quem não abriu, provavelmente não viu.
  convite_d2: {
    categoriaMeta: "utility",
    montar: (d) =>
      `Oi, ${PRIMEIRO_NOME(d.pagador)}! Passando para lembrar da autorização do Pix Automático da ${d.organizacao}.\n\n` +
      `É rápido e depois a mensalidade entra sozinha: ${d.link}`,
  },

  // D+5 — responde à dúvida que não foi feita. A objeção real do pagador é
  // "o que eu estou autorizando?".
  convite_d5: {
    categoriaMeta: "utility",
    montar: (d) =>
      `Oi, ${PRIMEIRO_NOME(d.pagador)}. Sobre o Pix Automático da ${d.organizacao}:\n\n` +
      `Você autoriza pelo app do seu banco, com um valor máximo definido — nada acima disso é cobrado sem você autorizar de novo. ` +
      `E dá para cancelar quando quiser, pelo próprio banco.\n\n` +
      `${d.link}`,
  },

  // D+10 — o último. Diz que é o último, sem ameaça, e deixa a porta aberta.
  // Continuar insistindo depois disso é o que faz o número ser denunciado.
  convite_d10: {
    categoriaMeta: "utility",
    montar: (d) =>
      `Oi, ${PRIMEIRO_NOME(d.pagador)}! Este é o último lembrete sobre o Pix Automático da ${d.organizacao} — ` +
      `não vamos insistir mais.\n\n` +
      `Se quiser autorizar: ${d.link}\n\n` +
      `Se preferir continuar como está, tudo bem: nada muda para você.`,
  },
};

const POR_PASSO: Record<1 | 2 | 3 | 4, ChaveDeTemplate> = {
  1: "convite_d0",
  2: "convite_d2",
  3: "convite_d5",
  4: "convite_d10",
};

export function templateDoPasso(passo: 1 | 2 | 3 | 4): ChaveDeTemplate {
  return POR_PASSO[passo];
}

export function montarMensagem(
  passo: 1 | 2 | 3 | 4,
  dados: DadosDaMensagem,
): { chave: ChaveDeTemplate; corpo: string } {
  const chave = templateDoPasso(passo);
  return { chave, corpo: TEMPLATES[chave].montar(dados) };
}
