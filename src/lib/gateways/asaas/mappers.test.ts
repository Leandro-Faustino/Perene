import { describe, expect, it } from "vitest";

import {
  mapearCobrancaCriada,
  mapearEstadoDaCobranca,
  mapearEventoDeWebhook,
  mapearStatusDeAutorizacao,
  mapearStatusDeCobranca,
  mapearStatusDeCobrancaAtiva,
  normalizarTelefone,
  paraCentavos,
} from "./mappers";

describe("paraCentavos", () => {
  it("arredonda em vez de truncar", () => {
    // 19.99 * 100 dá 1998.9999... em ponto flutuante. Truncar viraria R$ 19,98,
    // e um centavo errado é o bastante para o operador desconfiar do total.
    expect(paraCentavos(19.99)).toBe(1999);
    expect(paraCentavos(0.07)).toBe(7);
    expect(paraCentavos(250)).toBe(25_000);
  });

  it("aceita string e trata ausência como zero", () => {
    expect(paraCentavos("250.50")).toBe(25_050);
    expect(paraCentavos(null)).toBe(0);
    expect(paraCentavos(undefined)).toBe(0);
    expect(paraCentavos("nao é número")).toBe(0);
  });
});

describe("mapearStatusDeCobranca", () => {
  it("conta boleto vencido como falha, não como pendente", () => {
    // Para o operador, boleto vencido e não pago é dinheiro que não entrou.
    // Classificar como pendente subestimaria a perda.
    expect(mapearStatusDeCobranca("OVERDUE")).toBe("failed");
  });

  it("reconhece as várias formas de sucesso do Asaas", () => {
    expect(mapearStatusDeCobranca("RECEIVED")).toBe("succeeded");
    expect(mapearStatusDeCobranca("CONFIRMED")).toBe("succeeded");
    expect(mapearStatusDeCobranca("RECEIVED_IN_CASH")).toBe("succeeded");
  });

  it("trata estorno e chargeback como falha", () => {
    expect(mapearStatusDeCobranca("REFUNDED")).toBe("failed");
    expect(mapearStatusDeCobranca("CHARGEBACK_REQUESTED")).toBe("failed");
  });
});

describe("mapearStatusDeAutorizacao", () => {
  it("mantém autorização recém-criada como pendente até o primeiro pagamento", () => {
    // No Pix Automático a autorização só é ativada quando o primeiro pagamento
    // liquida. Marcar CREATED como autorizada faria o medidor subir antes de
    // existir migração de verdade.
    expect(mapearStatusDeAutorizacao("CREATED")).toBe("pending");
    expect(mapearStatusDeAutorizacao("AWAITING_PAYMENT")).toBe("pending");
  });

  it("aceita as duas grafias de cancelamento e a revogação", () => {
    expect(mapearStatusDeAutorizacao("CANCELED")).toBe("cancelled");
    expect(mapearStatusDeAutorizacao("CANCELLED")).toBe("cancelled");
    expect(mapearStatusDeAutorizacao("REVOKED")).toBe("cancelled");
  });

  it("cai em pendente diante de status desconhecido, nunca em autorizado", () => {
    // Errar para o lado de "ainda não autorizado" é seguro; o contrário
    // marcaria como migrado quem não está.
    expect(mapearStatusDeAutorizacao("ALGO_NOVO")).toBe("pending");
  });
});

describe("mapearEventoDeWebhook", () => {
  it("normaliza ativação da autorização", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt_1",
      event: "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED",
      dateCreated: "2026-08-04T10:00:00Z",
      pixAutomaticRecurringAuthorization: { id: "auth_1" },
    });

    expect(evento).toEqual({
      tipo: "mandate.authorized",
      externalEventId: "evt_1",
      externalMandateId: "auth_1",
      ocorridoEm: "2026-08-04T10:00:00Z",
    });
  });

  it("normaliza cobrança recebida com o vínculo da autorização", () => {
    const evento = mapearEventoDeWebhook({
      id: "evt_2",
      event: "PAYMENT_RECEIVED",
      dateCreated: "2026-08-04T10:00:00Z",
      payment: {
        id: "pay_1",
        value: 250,
        pixAutomaticRecurringAuthorization: "auth_1",
      },
    });

    expect(evento).toMatchObject({
      tipo: "charge.succeeded",
      externalChargeId: "pay_1",
      externalMandateId: "auth_1",
      valorCentavos: 25_000,
    });
  });

  it("ignora evento que não ajuda a migrar nem a manter a autorização viva", () => {
    // O filtro de escopo do produto vale também para webhook.
    expect(
      mapearEventoDeWebhook({ id: "evt_3", event: "TRANSFER_CREATED" }),
    ).toBeNull();
  });

  it("ignora evento de autorização sem id, em vez de gravar lixo", () => {
    expect(
      mapearEventoDeWebhook({
        id: "evt_4",
        event: "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED",
      }),
    ).toBeNull();
  });
});

describe("mapearStatusDeCobrancaAtiva", () => {
  it("PENDING vira scheduled — gerada mas ainda não vencida", () => {
    expect(mapearStatusDeCobrancaAtiva("PENDING")).toBe("scheduled");
    expect(mapearStatusDeCobrancaAtiva("AWAITING_RISK_ANALYSIS")).toBe("scheduled");
  });

  it("RECEIVED e variantes viram succeeded", () => {
    expect(mapearStatusDeCobrancaAtiva("RECEIVED")).toBe("succeeded");
    expect(mapearStatusDeCobrancaAtiva("CONFIRMED")).toBe("succeeded");
    expect(mapearStatusDeCobrancaAtiva("RECEIVED_IN_CASH")).toBe("succeeded");
  });

  it("OVERDUE e chargeback viram failed", () => {
    expect(mapearStatusDeCobrancaAtiva("OVERDUE")).toBe("failed");
    expect(mapearStatusDeCobrancaAtiva("CHARGEBACK_REQUESTED")).toBe("failed");
  });

  it("REFUND_IN_PROGRESS vira retrying", () => {
    expect(mapearStatusDeCobrancaAtiva("REFUND_IN_PROGRESS")).toBe("retrying");
    expect(mapearStatusDeCobrancaAtiva("CHARGEBACK_IN_PROGRESS")).toBe("retrying");
  });

  it("cai em scheduled diante de status desconhecido, nunca em succeeded", () => {
    // Errar para o lado de "ainda não pago" é seguro; o contrário contaria
    // o ciclo como encerrado sem o dinheiro ter entrado.
    expect(mapearStatusDeCobrancaAtiva("ALGO_NOVO")).toBe("scheduled");
  });
});

describe("mapearCobrancaCriada", () => {
  it("mapeia cobrança recorrente criada com QR", () => {
    const resultado = mapearCobrancaCriada({
      id: "chg_1",
      status: "PENDING",
      dueDate: "2026-09-15",
      value: 150,
      pix: { payload: "00020126...", encodedImage: "base64img" },
    });

    expect(resultado).toEqual({
      externalChargeId: "chg_1",
      vencimento: "2026-09-15",
      status: "scheduled",
      qrCodePayload: "00020126...",
      qrCodeImagem: "base64img",
    });
  });

  it("aceita cobrança sem pix (mandato já ativo não retorna QR)", () => {
    const resultado = mapearCobrancaCriada({
      id: "chg_2",
      status: "PENDING",
      dueDate: "2026-09-15",
      value: 150,
    });

    expect(resultado.qrCodePayload).toBeNull();
    expect(resultado.qrCodeImagem).toBeNull();
  });
});

describe("mapearEstadoDaCobranca", () => {
  it("mapeia cobrança recebida com data de pagamento", () => {
    const resultado = mapearEstadoDaCobranca({
      id: "chg_3",
      status: "RECEIVED",
      value: 200,
      dueDate: "2026-09-15",
      paymentDate: "2026-09-14",
    });

    expect(resultado).toEqual({
      externalChargeId: "chg_3",
      status: "succeeded",
      valorCentavos: 20_000,
      vencimento: "2026-09-15",
      pagoEm: "2026-09-14",
      motivo: null,
    });
  });

  it("preserva motivo de falha para log interno", () => {
    const resultado = mapearEstadoDaCobranca({
      id: "chg_4",
      status: "OVERDUE",
      value: 200,
      dueDate: "2026-09-15",
      failReason: "Saldo insuficiente",
    });

    expect(resultado.status).toBe("failed");
    expect(resultado.motivo).toBe("Saldo insuficiente");
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
