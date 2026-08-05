import { describe, expect, it } from "vitest";

import {
  analisarCpf,
  analisarDinheiro,
  analisarMetodo,
  analisarTelefone,
  detectarSeparador,
  importarCsv,
} from "./importacao";

describe("analisarDinheiro", () => {
  it("lê o formato brasileiro, com ponto de milhar e vírgula decimal", () => {
    // Interpretar "1.234,56" como 1.234 é errar por duas ordens de grandeza no
    // diagnóstico inteiro.
    expect(analisarDinheiro("R$ 1.234,56")).toBe(123456);
    expect(analisarDinheiro("1.234,56")).toBe(123456);
    expect(analisarDinheiro("250,00")).toBe(25000);
    expect(analisarDinheiro("250")).toBe(25000);
  });

  it("lê o formato americano quando é claramente decimal", () => {
    expect(analisarDinheiro("250.00")).toBe(25000);
    expect(analisarDinheiro("1234.56")).toBe(123456);
  });

  it("trata ponto sem duas casas como separador de milhar", () => {
    expect(analisarDinheiro("1.234")).toBe(123400);
  });

  it("recusa valor ausente, zerado ou não numérico", () => {
    expect(analisarDinheiro("")).toBeNull();
    expect(analisarDinheiro("0")).toBeNull();
    expect(analisarDinheiro("combinar")).toBeNull();
  });
});

describe("analisarTelefone e analisarCpf", () => {
  it("normaliza telefone brasileiro para E.164", () => {
    expect(analisarTelefone("(11) 98888-7777")).toBe("+5511988887777");
    expect(analisarTelefone("5511988887777")).toBe("+5511988887777");
    expect(analisarTelefone("11 3333-4444")).toBe("+551133334444");
  });

  it("recusa telefone curto ou longo demais em vez de inventar", () => {
    expect(analisarTelefone("99999")).toBeNull();
    expect(analisarTelefone("123456789012345")).toBeNull();
  });

  it("aceita CPF e CNPJ, guardando só os dígitos", () => {
    expect(analisarCpf("123.456.789-09")).toBe("12345678909");
    expect(analisarCpf("12.345.678/0001-95")).toBe("12345678000195");
    expect(analisarCpf("123")).toBeNull();
  });
});

describe("detectarSeparador", () => {
  it("reconhece ponto e vírgula, comum em planilha exportada no Brasil", () => {
    expect(detectarSeparador("nome;valor;telefone")).toBe(";");
  });

  it("reconhece vírgula", () => {
    expect(detectarSeparador("nome,valor,telefone")).toBe(",");
  });
});

describe("importarCsv", () => {
  it("reconhece cabeçalhos com nomes diferentes entre sistemas", () => {
    const csv = [
      "Aluno;Mensalidade;Celular;CPF;Forma de Pagamento",
      "Marcelo Souza;R$ 250,00;(11) 98888-7777;123.456.789-09;Cartão de Crédito",
    ].join("\n");

    const r = importarCsv(csv);

    expect(r.problemas).toHaveLength(0);
    expect(r.aceitas).toHaveLength(1);
    expect(r.aceitas[0]).toMatchObject({
      nome: "Marcelo Souza",
      valorCentavos: 25000,
      telefoneE164: "+5511988887777",
      cpf: "12345678909",
      metodo: "card",
    });
    expect(r.colunasReconhecidas.nome).toBe("Aluno");
  });

  it("respeita aspas com separador dentro do campo", () => {
    const csv = [
      "nome,valor",
      '"Souza, Marcelo",250',
    ].join("\n");

    expect(importarCsv(csv).aceitas[0].nome).toBe("Souza, Marcelo");
  });

  it("agrupa duplicados em vez de escolher um vencedor", () => {
    // RF-23: nunca resolver silenciosamente. Duas linhas com o mesmo CPF são
    // uma decisão de quem conhece a base, não do sistema.
    const csv = [
      "nome;valor;cpf",
      "Marcelo Souza;250,00;123.456.789-09",
      "Marcelo S. Souza;280,00;12345678909",
      "Simone Dias;300,00;987.654.321-00",
    ].join("\n");

    const r = importarCsv(csv);

    expect(r.aceitas).toHaveLength(1);
    expect(r.aceitas[0].nome).toBe("Simone Dias");
    expect(r.duplicados).toHaveLength(1);
    expect(r.duplicados[0].criterio).toBe("cpf");
    expect(r.duplicados[0].linhas).toHaveLength(2);
  });

  it("agrupa por telefone só quando não há CPF", () => {
    // Telefone identifica aparelho, não pessoa: mãe e filho dividem o número.
    const csv = [
      "nome;valor;telefone",
      "Ana Lima;200,00;(11) 98888-7777",
      "Pedro Lima;200,00;(11) 98888-7777",
    ].join("\n");

    const r = importarCsv(csv);

    expect(r.duplicados).toHaveLength(1);
    expect(r.duplicados[0].criterio).toBe("telefone");
  });

  it("não confunde pessoas diferentes com o mesmo nome", () => {
    const csv = [
      "nome;valor;cpf",
      "Maria Silva;200,00;111.111.111-11",
      "Maria Silva;200,00;222.222.222-22",
    ].join("\n");

    expect(importarCsv(csv).aceitas).toHaveLength(2);
  });

  it("aponta a linha e o motivo quando o valor não dá para ler", () => {
    const csv = ["nome;valor", "Marcelo;a combinar"].join("\n");

    const r = importarCsv(csv);

    expect(r.aceitas).toHaveLength(0);
    expect(r.problemas[0].linha).toBe(2);
    expect(r.problemas[0].motivo).toContain("a combinar");
  });

  it("avisa quem entra no diagnóstico mas não dá para convidar", () => {
    const csv = ["nome;valor", "Marcelo;250,00"].join("\n");

    const r = importarCsv(csv);

    expect(r.aceitas).toHaveLength(1);
    expect(r.problemas[0].motivo).toContain("não dá para convidar");
  });

  it("diz o que fazer quando falta a coluna obrigatória", () => {
    const r = importarCsv("apelido;preco\nMarcelo;250");

    expect(r.aceitas).toHaveLength(0);
    expect(r.problemas.some((p) => p.motivo.includes("nome"))).toBe(true);
  });

  it("engole o BOM do Excel sem estragar o primeiro cabeçalho", () => {
    const r = importarCsv("﻿nome;valor\nMarcelo;250,00");
    expect(r.aceitas).toHaveLength(1);
  });

  it("lida com arquivo vazio sem quebrar", () => {
    const r = importarCsv("");
    expect(r.aceitas).toHaveLength(0);
    expect(r.problemas[0].motivo).toContain("vazio");
  });
});

describe("analisarMetodo", () => {
  it("traduz as formas que os sistemas escrevem", () => {
    expect(analisarMetodo("Cartão de Crédito")).toBe("card");
    expect(analisarMetodo("CREDIT_CARD")).toBe("card");
    expect(analisarMetodo("Boleto Bancário")).toBe("boleto");
    expect(analisarMetodo("Pix")).toBe("pix_manual");
    expect(analisarMetodo("Pix Automático")).toBe("pix_automatico");
    expect(analisarMetodo("qualquer outra coisa")).toBe("other");
  });
});
