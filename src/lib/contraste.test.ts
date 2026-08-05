import { describe, expect, it } from "vitest";

import {
  corDeDestaque,
  paraRgb,
  razaoDeContraste,
  textoSobre,
} from "./contraste";

describe("razaoDeContraste", () => {
  it("bate com os valores do brand book", () => {
    // §5.2 documenta estas razões, e este teste é o que as mantém honestas.
    // Três delas estavam superestimadas na v1.0 do documento e foram
    // corrigidas na v1.2 a partir daqui — nenhuma mudava decisão, mas o brand
    // book afirma que todo número tem origem verificável.
    expect(razaoDeContraste("#12161C", "#FFFFFF")!).toBeCloseTo(18.1, 1);
    expect(razaoDeContraste("#2B50F5", "#FFFFFF")!).toBeCloseTo(5.9, 1);
    expect(razaoDeContraste("#475467", "#FFFFFF")!).toBeCloseTo(7.7, 1);
    expect(razaoDeContraste("#667085", "#FFFFFF")!).toBeCloseTo(5.0, 1);
    expect(razaoDeContraste("#7B93FF", "#12161C")!).toBeCloseTo(6.45, 1);
  });

  it("confirma que cobalto sobre grafite reprova, e que o claro resolve", () => {
    // A razão de existir do token --pl-cobalto-claro.
    expect(razaoDeContraste("#2B50F5", "#12161C")!).toBeLessThan(4.5);
    expect(razaoDeContraste("#7B93FF", "#12161C")!).toBeGreaterThan(4.5);
  });

  it("confirma que --pl-texto-fraco reprova para texto", () => {
    expect(razaoDeContraste("#98A2B3", "#FFFFFF")!).toBeLessThan(4.5);
    // E que a alternativa acessível passa.
    expect(razaoDeContraste("#667085", "#FFFFFF")!).toBeGreaterThan(4.5);
  });
});

describe("textoSobre", () => {
  it("usa branco sobre fundo escuro", () => {
    expect(textoSobre("#2B50F5")).toBe("#FFFFFF");
    expect(textoSobre("#12161C")).toBe("#FFFFFF");
  });

  it("troca para grafite quando o branco sumiria", () => {
    // O caso que motiva a regra: cliente sobe um amarelo de marca.
    expect(textoSobre("#FFD400")).toBe("#12161C");
    expect(textoSobre("#7CFC00")).toBe("#12161C");
  });

  it("cai em grafite diante de cor inválida, em vez de arriscar", () => {
    expect(textoSobre("não é cor")).toBe("#12161C");
    expect(textoSobre("")).toBe("#12161C");
  });
});

describe("paraRgb", () => {
  it("aceita hex de 3 e de 6 dígitos, com ou sem #", () => {
    expect(paraRgb("#FFF")).toEqual([255, 255, 255]);
    expect(paraRgb("2B50F5")).toEqual([43, 80, 245]);
  });

  it("recusa lixo", () => {
    expect(paraRgb("#GGGGGG")).toBeNull();
    expect(paraRgb("#12345")).toBeNull();
  });
});

describe("corDeDestaque", () => {
  it("usa a cor da organização quando ela é válida", () => {
    expect(corDeDestaque("#FF6600")).toBe("#FF6600");
  });

  it("cai no cobalto quando não há cor ou ela é inválida", () => {
    expect(corDeDestaque(null)).toBe("#2B50F5");
    expect(corDeDestaque("laranja")).toBe("#2B50F5");
  });
});
