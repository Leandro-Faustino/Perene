import type { MetodoPagamento } from "@/lib/gateways/types";

/**
 * A ONDA: um lote de contratos convidados a migrar, com regra de segmentação e
 * régua (RF-40, RF-41).
 *
 * "Onda" é termo proprietário da marca (§4.3) e aparece assim na interface —
 * nunca "campanha" nem "disparo", que são vocabulário de quem manda mensagem,
 * não de quem opera uma migração.
 */

export interface Segmento {
  metodos?: MetodoPagamento[];
  valorMinimoCentavos?: number;
  valorMaximoCentavos?: number;
  /** Só contratos com pelo menos N falhas nos últimos 12 meses. */
  falhasMinimas?: number;
  tags?: string[];
  /** Exclui quem não tem como ser convidado. Ligado por padrão. */
  exigirContato?: boolean;
}

export interface ContratoCandidato {
  id: string;
  valorCentavos: number;
  metodo: MetodoPagamento;
  falhas12m: number;
  tags: string[];
  temTelefone: boolean;
  temEmail: boolean;
  jaMigrado: boolean;
  /** Convite ainda vivo para este contrato: não convidamos duas vezes. */
  temConviteAberto: boolean;
}

/** Métodos que a migração consegue substituir. */
const MIGRAVEIS: MetodoPagamento[] = [
  "card",
  "boleto",
  "pix_manual",
  "debito_automatico",
];

export interface MotivoDeExclusao {
  id: string;
  motivo: string;
}

export interface SelecaoDaOnda {
  elegiveis: ContratoCandidato[];
  excluidos: MotivoDeExclusao[];
}

/**
 * Aplica o segmento e devolve quem entra — e por que os outros ficaram de fora.
 *
 * O `excluidos` não é enfeite: o operador vai perguntar "por que só 180 dos
 * meus 320?", e "porque 140 não têm telefone cadastrado" é uma resposta que
 * gera ação. Um número sem explicação gera desconfiança, que é o oposto do que
 * o produto vende.
 */
export function selecionarParaOnda(
  candidatos: ContratoCandidato[],
  segmento: Segmento = {},
): SelecaoDaOnda {
  const elegiveis: ContratoCandidato[] = [];
  const excluidos: MotivoDeExclusao[] = [];
  const exigirContato = segmento.exigirContato ?? true;

  for (const c of candidatos) {
    if (c.jaMigrado) {
      excluidos.push({ id: c.id, motivo: "já está em Pix Automático" });
      continue;
    }
    if (c.temConviteAberto) {
      excluidos.push({ id: c.id, motivo: "já tem convite em aberto" });
      continue;
    }
    if (!MIGRAVEIS.includes(c.metodo)) {
      excluidos.push({ id: c.id, motivo: "método atual não é migrável" });
      continue;
    }
    if (exigirContato && !c.temTelefone && !c.temEmail) {
      excluidos.push({ id: c.id, motivo: "sem telefone e sem e-mail" });
      continue;
    }
    if (segmento.metodos && !segmento.metodos.includes(c.metodo)) {
      excluidos.push({ id: c.id, motivo: "fora dos métodos escolhidos" });
      continue;
    }
    if (
      segmento.valorMinimoCentavos !== undefined &&
      c.valorCentavos < segmento.valorMinimoCentavos
    ) {
      excluidos.push({ id: c.id, motivo: "abaixo da faixa de valor" });
      continue;
    }
    if (
      segmento.valorMaximoCentavos !== undefined &&
      c.valorCentavos > segmento.valorMaximoCentavos
    ) {
      excluidos.push({ id: c.id, motivo: "acima da faixa de valor" });
      continue;
    }
    if (
      segmento.falhasMinimas !== undefined &&
      c.falhas12m < segmento.falhasMinimas
    ) {
      excluidos.push({ id: c.id, motivo: "menos falhas do que o filtro pede" });
      continue;
    }
    if (segmento.tags?.length && !segmento.tags.some((t) => c.tags.includes(t))) {
      excluidos.push({ id: c.id, motivo: "fora das etiquetas escolhidas" });
      continue;
    }

    elegiveis.push(c);
  }

  return { elegiveis, excluidos };
}

/**
 * Ordem sugerida do convite (RF-41): quem mais falha primeiro.
 *
 * O critério não é o valor, é a FALHA. Quem já teve cobrança quebrada é quem
 * tem mais a ganhar com a migração e quem está mais perto de virar churn
 * acidental — o antagonista da marca. Migrar essa gente primeiro faz a onda
 * render mais em retenção, não só em economia.
 *
 * Desempate por valor: entre dois contratos igualmente problemáticos, o mais
 * caro economiza mais, e é o que aparece antes no medidor.
 */
export function ordenarParaConvite(
  contratos: ContratoCandidato[],
): ContratoCandidato[] {
  return [...contratos].sort((a, b) => {
    if (b.falhas12m !== a.falhas12m) return b.falhas12m - a.falhas12m;
    if (b.valorCentavos !== a.valorCentavos) return b.valorCentavos - a.valorCentavos;
    return a.id.localeCompare(b.id);
  });
}

export interface ResumoDaOnda {
  elegiveis: number;
  excluidos: number;
  motivos: { motivo: string; quantidade: number }[];
  valorMensalEmJogoCentavos: number;
}

export function resumirOnda(selecao: SelecaoDaOnda): ResumoDaOnda {
  const contagem = new Map<string, number>();
  for (const e of selecao.excluidos) {
    contagem.set(e.motivo, (contagem.get(e.motivo) ?? 0) + 1);
  }

  return {
    elegiveis: selecao.elegiveis.length,
    excluidos: selecao.excluidos.length,
    motivos: [...contagem.entries()]
      .map(([motivo, quantidade]) => ({ motivo, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade),
    valorMensalEmJogoCentavos: selecao.elegiveis.reduce(
      (s, c) => s + c.valorCentavos,
      0,
    ),
  };
}
