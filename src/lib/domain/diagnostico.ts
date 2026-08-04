import type { Centavos, MetodoPagamento } from "@/lib/gateways/types";

/**
 * O diagnóstico (RF-30 a RF-33).
 *
 * É o produto de entrada, o conteúdo de topo e o ato fundador da marca: existe
 * para tornar visível a perda que está distribuída (brand book, Insight 2).
 *
 * Duas decisões de projeto que vêm do valor PRECISÃO (§4.2) e não de gosto:
 *
 * 1. É uma FUNÇÃO PURA. Sem banco, sem rede, sem data de hoje lida de dentro.
 *    Tudo entra por parâmetro. Um número que o operador não consegue reproduzir
 *    não vale, e um cálculo que só roda com o banco ligado ninguém consegue
 *    verificar.
 * 2. Toda cifra sai acompanhada da MEMÓRIA DE CÁLCULO. `memoria` não é
 *    opcional nem gerada depois para a tela: é parte do retorno, porque a
 *    obrigação de poder refazer a conta é do cálculo, não da interface.
 */

export interface Tarifa {
  metodo: MetodoPagamento;
  /** Pontos-base: 300 = 3,00%. */
  percentBps: number;
  fixedCents: Centavos;
  /** De onde veio esta tarifa. Aparece na memória de cálculo. */
  origem: string;
}

export interface ContratoParaDiagnostico {
  metodo: MetodoPagamento;
  valorCentavos: Centavos;
  /** Cobranças por ano. Mensal = 12. */
  cobrancasPorAno: number;
}

export interface FalhaHistorica {
  metodo: MetodoPagamento;
  valorCentavos: Centavos;
}

export interface EntradaDoDiagnostico {
  contratos: ContratoParaDiagnostico[];
  tarifas: Tarifa[];
  /** Falhas dos últimos 12 meses (RF-32). */
  falhas12m: FalhaHistorica[];
  /** Tarifa do Pix Automático, o destino da migração. */
  tarifaPixAutomatico: Tarifa;
}

export interface CustoPorMetodo {
  metodo: MetodoPagamento;
  contratos: number;
  receitaMensalCentavos: Centavos;
  custoMensalCentavos: Centavos;
  memoria: string;
}

export interface Cenario {
  adesao: number; // 0.5, 0.7, 0.9
  contratosMigrados: number;
  economiaMensalCentavos: Centavos;
  economiaAnualCentavos: Centavos;
  memoria: string;
}

export interface Diagnostico {
  contratosAtivos: number;
  receitaMensalCentavos: Centavos;
  custoMensalAtualCentavos: Centavos;
  custoMensalTudoPixCentavos: Centavos;
  economiaMensalMaximaCentavos: Centavos;
  custoPorMetodo: CustoPorMetodo[];
  falhas: {
    quantidade: number;
    valorCentavos: Centavos;
    memoria: string;
  };
  cenarios: Cenario[];
  memoriaGeral: string[];
}

const CENARIOS_PADRAO = [0.5, 0.7, 0.9] as const;

/** Métodos que a migração consegue substituir. */
const MIGRAVEIS: MetodoPagamento[] = [
  "card",
  "boleto",
  "pix_manual",
  "debito_automatico",
];

export function calcularDiagnostico(entrada: EntradaDoDiagnostico): Diagnostico {
  const { contratos, tarifas, falhas12m, tarifaPixAutomatico } = entrada;

  const porMetodo = new Map<MetodoPagamento, ContratoParaDiagnostico[]>();
  for (const contrato of contratos) {
    const lista = porMetodo.get(contrato.metodo) ?? [];
    lista.push(contrato);
    porMetodo.set(contrato.metodo, lista);
  }

  const custoPorMetodo: CustoPorMetodo[] = [];

  for (const [metodo, lista] of porMetodo) {
    const tarifa = acharTarifa(tarifas, metodo);
    const receitaMensal = lista.reduce(
      (soma, c) => soma + mensalizar(c.valorCentavos, c.cobrancasPorAno),
      0,
    );
    const custoMensal = lista.reduce(
      (soma, c) => soma + custoMensalDoContrato(c, tarifa),
      0,
    );

    custoPorMetodo.push({
      metodo,
      contratos: lista.length,
      receitaMensalCentavos: receitaMensal,
      custoMensalCentavos: custoMensal,
      memoria: memoriaDoMetodo(metodo, lista.length, tarifa, custoMensal),
    });
  }

  custoPorMetodo.sort((a, b) => b.custoMensalCentavos - a.custoMensalCentavos);

  const receitaMensal = custoPorMetodo.reduce(
    (s, m) => s + m.receitaMensalCentavos,
    0,
  );
  const custoMensalAtual = custoPorMetodo.reduce(
    (s, m) => s + m.custoMensalCentavos,
    0,
  );

  // Custo hipotético com a base inteira em Pix Automático. É o piso, não a
  // promessa — nem todo contrato é migrável (banco sem suporte, pagador que
  // recusa), e por isso os cenários existem.
  const custoTudoPix = contratos.reduce(
    (soma, c) => soma + custoMensalDoContrato(c, tarifaPixAutomatico),
    0,
  );

  const migraveis = contratos.filter((c) => MIGRAVEIS.includes(c.metodo));

  const cenarios = CENARIOS_PADRAO.map((adesao) =>
    calcularCenario(adesao, migraveis, tarifas, tarifaPixAutomatico),
  );

  const valorFalhas = falhas12m.reduce((s, f) => s + f.valorCentavos, 0);

  return {
    contratosAtivos: contratos.length,
    receitaMensalCentavos: receitaMensal,
    custoMensalAtualCentavos: custoMensalAtual,
    custoMensalTudoPixCentavos: custoTudoPix,
    economiaMensalMaximaCentavos: Math.max(0, custoMensalAtual - custoTudoPix),
    custoPorMetodo,
    falhas: {
      quantidade: falhas12m.length,
      valorCentavos: valorFalhas,
      memoria: `${falhas12m.length} cobranças não entraram nos últimos 12 meses, somando ${reais(valorFalhas)}. Considera boleto vencido e não pago, cobrança recusada e estorno.`,
    },
    cenarios,
    memoriaGeral: [
      `Base considerada: ${contratos.length} contratos ativos.`,
      `Receita mensal: soma do valor de cada contrato, convertido para base mensal pela periodicidade.`,
      `Custo por método: (valor × percentual da tarifa) + tarifa fixa, por cobrança, mensalizado.`,
      `Contratos migráveis: ${migraveis.length} — os que hoje estão em cartão, boleto, Pix manual ou débito automático.`,
      `Tarifa do Pix Automático usada: ${descreverTarifa(tarifaPixAutomatico)} (${tarifaPixAutomatico.origem}).`,
    ],
  };
}

// -----------------------------------------------------------------------------

function calcularCenario(
  adesao: number,
  migraveis: ContratoParaDiagnostico[],
  tarifas: Tarifa[],
  tarifaPix: Tarifa,
): Cenario {
  // Arredonda para baixo: prometer meio contrato migrado é o tipo de número
  // que o operador não consegue reproduzir.
  const quantidade = Math.floor(migraveis.length * adesao);

  // Migra primeiro o que custa mais caro — é a ordem que a onda sugere
  // (RF-41), então a projeção precisa refletir a mesma ordem. Projetar sobre
  // os contratos mais baratos subestimaria a economia e desalinharia a
  // expectativa do operador com o que ele vai ver acontecer.
  const ordenados = [...migraveis].sort(
    (a, b) =>
      custoMensalDoContrato(b, acharTarifa(tarifas, b.metodo)) -
      custoMensalDoContrato(a, acharTarifa(tarifas, a.metodo)),
  );
  const selecionados = ordenados.slice(0, quantidade);

  const custoAntes = selecionados.reduce(
    (s, c) => s + custoMensalDoContrato(c, acharTarifa(tarifas, c.metodo)),
    0,
  );
  const custoDepois = selecionados.reduce(
    (s, c) => s + custoMensalDoContrato(c, tarifaPix),
    0,
  );
  const economiaMensal = Math.max(0, custoAntes - custoDepois);

  return {
    adesao,
    contratosMigrados: quantidade,
    economiaMensalCentavos: economiaMensal,
    economiaAnualCentavos: economiaMensal * 12,
    memoria: `${Math.round(adesao * 100)}% de ${migraveis.length} contratos migráveis = ${quantidade} contratos, priorizando os de maior custo. Custo hoje ${reais(custoAntes)}/mês; no Pix Automático ${reais(custoDepois)}/mês.`,
  };
}

function custoMensalDoContrato(
  contrato: ContratoParaDiagnostico,
  tarifa: Tarifa,
): Centavos {
  const custoPorCobranca =
    Math.round((contrato.valorCentavos * tarifa.percentBps) / 10_000) +
    tarifa.fixedCents;
  return mensalizar(custoPorCobranca, contrato.cobrancasPorAno);
}

/**
 * Converte um valor por cobrança em valor mensal.
 *
 * Anual vira 1/12 por mês; semanal vira 52/12. Sem isso, uma base mista de
 * mensal e anual apresentaria um "custo mensal" que não bate com o extrato —
 * e o operador que confere uma vez e não bate não confere de novo.
 */
function mensalizar(valorPorCobranca: Centavos, cobrancasPorAno: number): Centavos {
  if (cobrancasPorAno <= 0) return 0;
  return Math.round((valorPorCobranca * cobrancasPorAno) / 12);
}

function acharTarifa(tarifas: Tarifa[], metodo: MetodoPagamento): Tarifa {
  const encontrada = tarifas.find((t) => t.metodo === metodo);
  if (encontrada) return encontrada;
  // Sem tarifa conhecida, o custo é zero e a memória diz por quê. É melhor
  // subestimar declaradamente do que inventar um número: "quando não sabemos,
  // dizemos que não sabemos" (§4.2).
  return {
    metodo,
    percentBps: 0,
    fixedCents: 0,
    origem: "tarifa não informada — custo não contabilizado",
  };
}

function memoriaDoMetodo(
  metodo: MetodoPagamento,
  quantidade: number,
  tarifa: Tarifa,
  custoMensal: Centavos,
): string {
  return `${quantidade} contratos em ${rotulo(metodo)}, a ${descreverTarifa(tarifa)}: ${reais(custoMensal)}/mês. Origem da tarifa: ${tarifa.origem}.`;
}

export function descreverTarifa(tarifa: Tarifa): string {
  const partes: string[] = [];
  if (tarifa.percentBps > 0) {
    partes.push(`${(tarifa.percentBps / 100).toFixed(2).replace(".", ",")}%`);
  }
  if (tarifa.fixedCents > 0) partes.push(reais(tarifa.fixedCents));
  return partes.length > 0 ? partes.join(" + ") : "sem tarifa informada";
}

/** Rótulos na língua de quem opera (§4.3). Nada de `CREDIT_CARD` na tela. */
export function rotulo(metodo: MetodoPagamento): string {
  switch (metodo) {
    case "card":
      return "cartão";
    case "boleto":
      return "boleto";
    case "pix_manual":
      return "Pix manual";
    case "debito_automatico":
      return "débito automático";
    case "pix_automatico":
      return "Pix Automático";
    default:
      return "outro método";
  }
}

function reais(centavos: Centavos): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}
