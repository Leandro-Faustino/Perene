import { describe, expect, it } from "vitest";

import {
  calcularDiagnostico,
  type ContratoParaDiagnostico,
  type Tarifa,
} from "./diagnostico";

const TARIFA_CARTAO: Tarifa = {
  metodo: "card",
  percentBps: 290,
  fixedCents: 0,
  origem: "faixa de mercado",
};

const TARIFA_BOLETO: Tarifa = {
  metodo: "boleto",
  percentBps: 0,
  fixedCents: 349,
  origem: "faixa de mercado",
};

const TARIFA_PIX: Tarifa = {
  metodo: "pix_automatico",
  percentBps: 0,
  fixedCents: 10,
  origem: "tarifa por transação",
};

function contratos(
  n: number,
  metodo: ContratoParaDiagnostico["metodo"],
  valorCentavos: number,
  cobrancasPorAno = 12,
): ContratoParaDiagnostico[] {
  return Array.from({ length: n }, () => ({
    metodo,
    valorCentavos,
    cobrancasPorAno,
  }));
}

describe("calcularDiagnostico", () => {
  it("reproduz a conta do brand book: 400 contratos de R$ 250 no cartão a 2,9%", () => {
    const d = calcularDiagnostico({
      contratos: contratos(400, "card", 25_000),
      tarifas: [TARIFA_CARTAO],
      falhas12m: [],
      tarifaPixAutomatico: TARIFA_PIX,
    });

    // 25000 centavos * 290bps / 10000 = 725 centavos por cobrança
    // 725 * 400 = 290.000 centavos = R$ 2.900,00/mês
    expect(d.custoMensalAtualCentavos).toBe(290_000);
    expect(d.receitaMensalCentavos).toBe(10_000_000);

    // No Pix Automático: R$ 0,10 x 400 = R$ 40,00
    expect(d.custoMensalTudoPixCentavos).toBe(4_000);
    expect(d.economiaMensalMaximaCentavos).toBe(286_000);
  });

  it("mensaliza periodicidades diferentes em vez de somar valor cru", () => {
    // Um contrato anual de R$ 1.200 não é R$ 1.200 de receita mensal.
    const d = calcularDiagnostico({
      contratos: contratos(1, "card", 120_000, 1),
      tarifas: [TARIFA_CARTAO],
      falhas12m: [],
      tarifaPixAutomatico: TARIFA_PIX,
    });

    expect(d.receitaMensalCentavos).toBe(10_000); // 120000 / 12
  });

  it("soma tarifa fixa por cobrança, não por contrato", () => {
    const d = calcularDiagnostico({
      contratos: contratos(10, "boleto", 15_000),
      tarifas: [TARIFA_BOLETO],
      falhas12m: [],
      tarifaPixAutomatico: TARIFA_PIX,
    });

    expect(d.custoMensalAtualCentavos).toBe(3_490); // 349 x 10
  });

  it("prioriza os contratos mais caros nos cenários, como a onda faz", () => {
    // 2 contratos caros e 8 baratos. A 50% de adesão, migram os 5 mais caros —
    // e a economia precisa refletir isso, não a média.
    const d = calcularDiagnostico({
      contratos: [
        ...contratos(2, "card", 100_000),
        ...contratos(8, "card", 10_000),
      ],
      tarifas: [TARIFA_CARTAO],
      falhas12m: [],
      tarifaPixAutomatico: TARIFA_PIX,
    });

    const cenario50 = d.cenarios.find((c) => c.adesao === 0.5)!;
    expect(cenario50.contratosMigrados).toBe(5);

    // Se migrasse os 5 mais baratos a economia seria muito menor. Confirma que
    // os caros entraram primeiro.
    const economiaSeFossemBaratos = 5 * (Math.round((10_000 * 290) / 10_000) - 10);
    expect(cenario50.economiaMensalCentavos).toBeGreaterThan(
      economiaSeFossemBaratos,
    );
  });

  it("não conta o que já está em Pix Automático como migrável", () => {
    const d = calcularDiagnostico({
      contratos: [
        ...contratos(10, "card", 25_000),
        ...contratos(10, "pix_automatico", 25_000),
      ],
      tarifas: [TARIFA_CARTAO, TARIFA_PIX],
      falhas12m: [],
      tarifaPixAutomatico: TARIFA_PIX,
    });

    const cenario90 = d.cenarios.find((c) => c.adesao === 0.9)!;
    expect(cenario90.contratosMigrados).toBe(9); // 90% de 10, não de 20
  });

  it("não inventa custo quando a tarifa é desconhecida, e diz isso", () => {
    const d = calcularDiagnostico({
      contratos: contratos(50, "debito_automatico", 30_000),
      tarifas: [], // nenhuma tarifa informada
      falhas12m: [],
      tarifaPixAutomatico: TARIFA_PIX,
    });

    expect(d.custoMensalAtualCentavos).toBe(0);
    expect(d.custoPorMetodo[0].memoria).toContain("tarifa não informada");
  });

  it("expõe memória de cálculo em todo número apresentado", () => {
    const d = calcularDiagnostico({
      contratos: contratos(400, "card", 25_000),
      tarifas: [TARIFA_CARTAO],
      falhas12m: [{ metodo: "card", valorCentavos: 25_000 }],
      tarifaPixAutomatico: TARIFA_PIX,
    });

    expect(d.memoriaGeral.length).toBeGreaterThan(0);
    expect(d.falhas.memoria).toContain("R$");
    for (const metodo of d.custoPorMetodo) {
      expect(metodo.memoria).toContain("Origem da tarifa");
    }
    for (const cenario of d.cenarios) {
      expect(cenario.memoria).toContain("contratos migráveis");
    }
  });

  it("lida com base vazia sem quebrar nem dividir por zero", () => {
    const d = calcularDiagnostico({
      contratos: [],
      tarifas: [TARIFA_CARTAO],
      falhas12m: [],
      tarifaPixAutomatico: TARIFA_PIX,
    });

    expect(d.contratosAtivos).toBe(0);
    expect(d.custoMensalAtualCentavos).toBe(0);
    expect(d.economiaMensalMaximaCentavos).toBe(0);
    expect(d.cenarios).toHaveLength(3);
  });
});
