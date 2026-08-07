import { describe, expect, it } from "vitest";

import {
  mapearAutorizacao,
  mapearCobrancaCriada,
  mapearEstadoDaCobranca,
  mapearEventoDeWebhook,
  mapearPeriodicidade,
  mapearStatusDeAutorizacao,
  mapearStatusDeCobrancaAtiva,
  normalizarTelefone,
  paraCentavos,
  paraDecimal,
  paraPeriodicidadeEfi,
} from "./mappers";

describe("paraCentavos", () => {
  it("arredonda em vez de truncar", () => {
    expect(paraCentavos("19.99")).toBe(1999);
    expect(paraCentavos("0.07")).toBe(7);
    expect(paraCentavos("250.00")).toBe(25_000);
  });

  it("aceita number e trata ausência como zero", () => {
    expect(paraCentavos(150)).toBe(15_000);
    expect(paraCentavos(null)).toBe(0);
    expect(paraCentavos(undefined)).toBe(0);
    expect(paraCentavos("nao é número")).toBe(0);
    expect(paraCentavos("")).toBe(0);
  });
});

describe("paraDecimal", () => {
  it("converte centavos de volta para string decimal", () => {
    expect(paraDecimal(25_000)).toBe("250.00");
    expect(paraDecimal(7)).toBe("0.07");
    expect(paraDecimal(1999)).toBe("19.99");
  });
});

describe("mapearPeriodicidade", () => {
  it("mapeia os casos diretos", () => {
    expect(mapearPeriodicidade("MENSAL")).toBe("monthly");
    expect(mapearPeriodicidade("TRIMESTRAL")).toBe("quarterly");
    expect(mapearPeriodicidade("SEMESTRAL")).toBe("semiannual");
    expect(mapearPeriodicidade("ANUAL")).toBe("annual");
  });

  it("trata SEMANAL e QUINZENAL como weekly (mais próximo do domínio)", () => {
    expect(mapearPeriodicidade("SEMANAL")).toBe("weekly");
    expect(mapearPeriodicidade("QUINZENAL")).toBe("weekly");
  });

  it("cai em monthly diante de valor desconhecido", () => {
    expect(mapearPeriodicidade(null)).toBe("monthly");
    expect(mapearPeriodicidade("BIMESTRAL")).toBe("monthly");
  });
});

describe("paraPeriodicidadeEfi (round-trip)", () => {
  it("converte periodicidade de domínio para string BACEN", () => {
    expect(paraPeriodicidadeEfi("monthly")).toBe("MENSAL");
    expect(paraPeriodicidadeEfi("weekly")).toBe("SEMANAL");
    expect(paraPeriodicidadeEfi("quarterly")).toBe("TRIMESTRAL");
    expect(paraPeriodicidadeEfi("semiannual")).toBe("SEMESTRAL");
    expect(paraPeriodicidadeEfi("annual")).toBe("ANUAL");
  });
});

describe("mapearStatusDeAutorizacao", () => {
  it("mantém consentimento recém-criado como pendente até autorização", () => {
    // PENDENTE_AUTORIZACAO é o estado BACEN enquanto o pagador ainda não abriu
    // o app do banco. Marcar como autorizado anteciparia a migração.
    expect(mapearStatusDeAutorizacao("PENDENTE_AUTORIZACAO")).toBe("pending");
    expect(mapearStatusDeAutorizacao("CRIADA")).toBe("pending");
  });

  it("ATIVA e AUTORIZADA → authorized", () => {
    expect(mapearStatusDeAutorizacao("ATIVA")).toBe("authorized");
    expect(mapearStatusDeAutorizacao("AUTORIZADA")).toBe("authorized");
  });

  it("REJEITADA e NEGADA → rejected", () => {
    expect(mapearStatusDeAutorizacao("REJEITADA")).toBe("rejected");
    expect(mapearStatusDeAutorizacao("NEGADA")).toBe("rejected");
  });

  it("CANCELADA → cancelled", () => {
    expect(mapearStatusDeAutorizacao("CANCELADA")).toBe("cancelled");
  });

  it("CONCLUIDA e EXPIRADA → expired (encerramento natural)", () => {
    expect(mapearStatusDeAutorizacao("CONCLUIDA")).toBe("expired");
    expect(mapearStatusDeAutorizacao("EXPIRADA")).toBe("expired");
  });

  it("cai em pending diante de status desconhecido, nunca em authorized", () => {
    // Errar para "ainda não autorizado" é seguro; o contrário marcaria como
    // migrado quem não está.
    expect(mapearStatusDeAutorizacao("ALGO_NOVO")).toBe("pending");
    expect(mapearStatusDeAutorizacao(null)).toBe("pending");
  });
});

describe("mapearStatusDeCobrancaAtiva", () => {
  it("ATIVA, PENDENTE e CRIADA → scheduled (gerada, ainda não processada)", () => {
    expect(mapearStatusDeCobrancaAtiva("ATIVA")).toBe("scheduled");
    expect(mapearStatusDeCobrancaAtiva("PENDENTE")).toBe("scheduled");
    expect(mapearStatusDeCobrancaAtiva("CRIADA")).toBe("scheduled");
  });

  it("CONCLUIDA, PAGA e RECEBIDA → succeeded", () => {
    expect(mapearStatusDeCobrancaAtiva("CONCLUIDA")).toBe("succeeded");
    expect(mapearStatusDeCobrancaAtiva("PAGA")).toBe("succeeded");
    expect(mapearStatusDeCobrancaAtiva("RECEBIDA")).toBe("succeeded");
  });

  it("NEGADA, CANCELADA e ERRO_DEBITO → failed", () => {
    expect(mapearStatusDeCobrancaAtiva("NEGADA")).toBe("failed");
    expect(mapearStatusDeCobrancaAtiva("CANCELADA")).toBe("failed");
    expect(mapearStatusDeCobrancaAtiva("ERRO_DEBITO")).toBe("failed");
  });

  it("EM_PROCESSAMENTO → retrying", () => {
    expect(mapearStatusDeCobrancaAtiva("EM_PROCESSAMENTO")).toBe("retrying");
  });

  it("cai em scheduled diante de status desconhecido, nunca em succeeded", () => {
    // Errar para "ainda não pago" é seguro; o contrário contaria o ciclo como
    // encerrado sem o dinheiro ter entrado.
    expect(mapearStatusDeCobrancaAtiva("ALGO_NOVO")).toBe("scheduled");
  });
});

describe("mapearAutorizacao", () => {
  it("mapeia consentimento pendente sem teto nem datas", () => {
    const resultado = mapearAutorizacao({
      idRecorrencia: "rec-uuid-123",
      status: "PENDENTE_AUTORIZACAO",
    });

    expect(resultado).toEqual({
      externalMandateId: "rec-uuid-123",
      status: "pending",
      tetoCentavos: null,
      autorizadoEm: null,
      canceladoEm: null,
      expiraEm: null,
    });
  });

  it("mapeia consentimento ativo com teto e data de autorização", () => {
    const resultado = mapearAutorizacao({
      idRecorrencia: "rec-uuid-456",
      status: "ATIVA",
      valor: { original: "150.00", limite: "500.00" },
      autorizacaoEm: "2026-08-01T10:00:00Z",
    });

    expect(resultado.status).toBe("authorized");
    expect(resultado.tetoCentavos).toBe(50_000);
    expect(resultado.autorizadoEm).toBe("2026-08-01T10:00:00Z");
  });

  it("preserva data de cancelamento", () => {
    const resultado = mapearAutorizacao({
      idRecorrencia: "rec-uuid-789",
      status: "CANCELADA",
      cancelamentoEm: "2026-09-01T12:00:00Z",
    });

    expect(resultado.status).toBe("cancelled");
    expect(resultado.canceladoEm).toBe("2026-09-01T12:00:00Z");
  });
});

describe("mapearCobrancaCriada", () => {
  it("mapeia débito recorrente criado — sem QR Code (Pix Automático não usa QR por ciclo)", () => {
    const resultado = mapearCobrancaCriada(
      {
        idPagamento: "pag-001",
        status: "CRIADA",
        valor: { original: "250.00" },
        calendario: { dataDeVencimento: "2026-09-15" },
      },
      "txid-fallback",
    );

    expect(resultado).toEqual({
      externalChargeId: "pag-001",
      vencimento: "2026-09-15",
      status: "scheduled",
      qrCodePayload: null,
      qrCodeImagem: null,
    });
  });

  it("usa txid como fallback quando idPagamento está ausente", () => {
    const resultado = mapearCobrancaCriada(
      { status: "CRIADA" },
      "txid-gerado",
    );

    expect(resultado.externalChargeId).toBe("txid-gerado");
  });
});

describe("mapearEstadoDaCobranca", () => {
  it("mapeia cobrança concluída com data de pagamento", () => {
    const resultado = mapearEstadoDaCobranca(
      {
        idPagamento: "pag-002",
        status: "CONCLUIDA",
        valor: { original: "200.00" },
        calendario: { dataDeVencimento: "2026-09-15" },
        pix: [{ horario: "2026-09-14T11:00:00Z" }],
      },
      "txid-fallback",
    );

    expect(resultado).toEqual({
      externalChargeId: "pag-002",
      status: "succeeded",
      valorCentavos: 20_000,
      vencimento: "2026-09-15",
      pagoEm: "2026-09-14T11:00:00Z",
      motivo: null,
    });
  });

  it("preserva motivo de rejeição", () => {
    const resultado = mapearEstadoDaCobranca(
      {
        idPagamento: "pag-003",
        status: "NEGADA",
        valor: { original: "200.00" },
        motivoRejeicao: "Saldo insuficiente",
      },
      "txid-fallback",
    );

    expect(resultado.status).toBe("failed");
    expect(resultado.motivo).toBe("Saldo insuficiente");
  });
});

describe("mapearEventoDeWebhook", () => {
  it("normaliza autorização do consentimento Pix Automático", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-001",
      evento: "PIX_AUTOMATICO_RECORRENCIA_AUTORIZADO",
      horario: "2026-08-04T10:00:00Z",
      recorrencia: { idRecorrencia: "rec-uuid-001" },
    });

    expect(evento).toEqual({
      tipo: "mandate.authorized",
      externalEventId: "evt-001",
      externalMandateId: "rec-uuid-001",
      ocorridoEm: "2026-08-04T10:00:00Z",
    });
  });

  it("aceita grafia alternativa BACEN para autorização", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-001b",
      evento: "AUTORIZACAO_PIX_AUTOMATICO_ATIVADA",
      horario: "2026-08-04T10:00:00Z",
      recorrencia: { idRecorrencia: "rec-uuid-001b" },
    });

    expect(evento?.tipo).toBe("mandate.authorized");
  });

  it("normaliza rejeição do consentimento", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-002",
      evento: "PIX_AUTOMATICO_RECORRENCIA_NEGADO",
      horario: "2026-08-04T10:00:00Z",
      recorrencia: { idRecorrencia: "rec-uuid-002" },
    });

    expect(evento?.tipo).toBe("mandate.rejected");
    expect(evento?.externalMandateId).toBe("rec-uuid-002");
  });

  it("normaliza cancelamento do consentimento", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-003",
      evento: "PIX_AUTOMATICO_RECORRENCIA_CANCELADO",
      horario: "2026-08-05T09:00:00Z",
      recorrencia: { idRecorrencia: "rec-uuid-003" },
    });

    expect(evento?.tipo).toBe("mandate.cancelled");
  });

  it("normaliza expiração do consentimento", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-004",
      evento: "PIX_AUTOMATICO_RECORRENCIA_CONCLUIDA",
      horario: "2026-12-31T23:59:00Z",
      recorrencia: { idRecorrencia: "rec-uuid-004" },
    });

    expect(evento?.tipo).toBe("mandate.expired");
  });

  it("normaliza débito recorrente concluído com valor", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-005",
      evento: "PIX_AUTOMATICO_DEBITO_CONCLUIDO",
      horario: "2026-09-15T14:00:00Z",
      debito: { idPagamento: "pag-001", valor: "250.00" },
    });

    expect(evento).toMatchObject({
      tipo: "charge.succeeded",
      externalEventId: "evt-005",
      externalChargeId: "pag-001",
      valorCentavos: 25_000,
    });
  });

  it("normaliza débito recorrente negado com motivo", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-006",
      evento: "PIX_AUTOMATICO_DEBITO_NEGADO",
      horario: "2026-09-15T14:00:00Z",
      debito: { idPagamento: "pag-002", valor: "150.00", motivo: "Saldo insuficiente" },
    });

    expect(evento).toMatchObject({ tipo: "charge.failed", motivo: "Saldo insuficiente" });
  });

  it("normaliza débito agendado (apenas registro, sem valor ainda)", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-007",
      evento: "PIX_AUTOMATICO_DEBITO_CRIADO",
      horario: "2026-09-10T00:00:00Z",
      debito: { idPagamento: "pag-003" },
    });

    expect(evento).toMatchObject({ tipo: "charge.scheduled", valorCentavos: null });
  });

  it("normaliza Pix avulso liquidado via array pix[]", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-008",
      horario: "2026-09-15T15:00:00Z",
      pix: [{ endToEndId: "E123", txid: "txid-avulso", valor: "99.90", horario: "2026-09-15T15:00:01Z" }],
    });

    expect(evento).toMatchObject({
      tipo: "charge.succeeded",
      externalChargeId: "txid-avulso",
      valorCentavos: 9_990,
      ocorridoEm: "2026-09-15T15:00:01Z",
    });
  });

  it("ignora Pix avulso sem txid", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-009",
      pix: [{ endToEndId: "E456" }],
    });

    expect(evento).toBeNull();
  });

  it("ignora evento sem recorrencia nem debito nem pix", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-010",
      evento: "OUTRO_EVENTO_NAO_MAPEADO",
      horario: "2026-08-04T10:00:00Z",
    });

    expect(evento).toBeNull();
  });

  it("ignora evento de mandato sem idRecorrencia, em vez de gravar lixo", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt-011",
      evento: "PIX_AUTOMATICO_RECORRENCIA_AUTORIZADO",
      horario: "2026-08-04T10:00:00Z",
      recorrencia: {},
    });

    // recorrencia existe mas sem idRecorrencia — cai nos próximos blocos e retorna null
    expect(evento).toBeNull();
  });
});

describe("normalizarTelefone", () => {
  it("põe DDI brasileiro quando falta", () => {
    expect(normalizarTelefone("(11) 98888-7777")).toBe("+5511988887777");
  });

  it("preserva DDI já presente", () => {
    expect(normalizarTelefone("5511988887777")).toBe("+5511988887777");
  });

  it("descarta número curto demais para ser telefone", () => {
    expect(normalizarTelefone("123")).toBeNull();
    expect(normalizarTelefone(null)).toBeNull();
  });
});
