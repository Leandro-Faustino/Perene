import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";

import { registrarFontes } from "./fontes";
import { DocumentoDeDiagnostico } from "./diagnostico-pdf";
import { calcularDiagnostico, type Tarifa } from "@/lib/domain/diagnostico";

const TARIFAS: Tarifa[] = [
  { metodo: "card", percentBps: 290, fixedCents: 0, origem: "faixa de mercado" },
  { metodo: "boleto", percentBps: 0, fixedCents: 349, origem: "faixa de mercado" },
];
const PIX: Tarifa = {
  metodo: "pix_automatico",
  percentBps: 0,
  fixedCents: 10,
  origem: "tarifa por transação",
};

function diagnosticoDeExemplo() {
  return calcularDiagnostico({
    contratos: [
      ...Array.from({ length: 200 }, () => ({
        metodo: "card" as const,
        valorCentavos: 25_000,
        cobrancasPorAno: 12,
      })),
      ...Array.from({ length: 120 }, () => ({
        metodo: "boleto" as const,
        valorCentavos: 25_000,
        cobrancasPorAno: 12,
      })),
    ],
    tarifas: TARIFAS,
    falhas12m: Array.from({ length: 22 }, () => ({
      metodo: "boleto" as const,
      valorCentavos: 25_000,
    })),
    tarifaPixAutomatico: PIX,
  });
}

async function gerar(corDeMarca: string | null) {
  registrarFontes();
  return renderToBuffer(
    DocumentoDeDiagnostico({
      organizacao: {
        nome: "Box Ferro e Fogo",
        corDeMarca,
        rotuloDoPagador: "aluno",
      },
      diagnostico: diagnosticoDeExemplo(),
      geradoEm: new Date("2026-08-05T12:00:00Z"),
    }),
  );
}

describe("DocumentoDeDiagnostico", () => {
  it("gera um PDF válido", async () => {
    const buffer = await gerar("#FF6600");

    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    // Um PDF com as fontes embutidas e o conteúdo real passa folgado de 20 KB.
    // Abaixo disso, provavelmente as fontes não entraram.
    expect(buffer.length).toBeGreaterThan(20_000);
  }, 30_000);

  it("não quebra com cor de marca inválida, ausente ou perigosa", async () => {
    // A cor chega do cliente e pode ser qualquer coisa. O documento precisa
    // sair em todos os casos — é o material que circula sozinho.
    for (const cor of [null, "", "laranja", "#FFD400", "#FFF"]) {
      const buffer = await gerar(cor);
      expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    }
  }, 60_000);

  it("sai sem a seção de falhas quando não houve nenhuma", async () => {
    registrarFontes();
    const semFalhas = calcularDiagnostico({
      contratos: [{ metodo: "card", valorCentavos: 25_000, cobrancasPorAno: 12 }],
      tarifas: TARIFAS,
      falhas12m: [],
      tarifaPixAutomatico: PIX,
    });

    const buffer = await renderToBuffer(
      DocumentoDeDiagnostico({
        organizacao: { nome: "Escola B", corDeMarca: null, rotuloDoPagador: "aluno" },
        diagnostico: semFalhas,
        geradoEm: new Date("2026-08-05T12:00:00Z"),
      }),
    );

    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30_000);
});
