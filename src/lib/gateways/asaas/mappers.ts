import type {
  AssinaturaExterna,
  ClienteExterno,
  CobrancaHistorica,
  CobrancaCriada,
  EstadoDaAutorizacao,
  EstadoDaCobranca,
  EventoNormalizado,
  MetodoPagamento,
  Periodicidade,
  StatusAutorizacao,
  StatusCobrancaAtiva,
} from "../types";

/**
 * Asaas → domínio. Funções puras, testadas em `mappers.test.ts`.
 *
 * Regra que justifica o arquivo existir: se um dia entrar um segundo gateway,
 * é este arquivo que se duplica — e nada mais. O resto do sistema não sabe que
 * "BOLETO" e "PIX" um dia foram strings de outra empresa.
 */

// -----------------------------------------------------------------------------
// Dinheiro
// -----------------------------------------------------------------------------

/**
 * O Asaas trabalha em reais com decimal. O domínio trabalha em centavos
 * inteiros. A conversão é aqui e em nenhum outro lugar.
 *
 * `Math.round` e não `Math.trunc`: 19.99 * 100 dá 1998.9999... em ponto
 * flutuante, e truncar viraria R$ 19,98. Num produto que existe para dar
 * credibilidade a número, um centavo perdido por arredondamento é o bastante
 * para o operador desconfiar do total.
 */
export function paraCentavos(valorEmReais: number | string | null | undefined): number {
  if (valorEmReais === null || valorEmReais === undefined) return 0;
  const numero =
    typeof valorEmReais === "string" ? Number(valorEmReais) : valorEmReais;
  if (!Number.isFinite(numero)) return 0;
  return Math.round(numero * 100);
}

// -----------------------------------------------------------------------------
// Método e periodicidade
// -----------------------------------------------------------------------------

export function mapearMetodo(billingType: string | null | undefined): MetodoPagamento {
  switch (billingType) {
    case "CREDIT_CARD":
    case "DEBIT_CARD":
      return "card";
    case "BOLETO":
      return "boleto";
    case "PIX":
      return "pix_manual";
    case "PIX_AUTOMATIC":
    case "PIX_RECURRING":
      return "pix_automatico";
    default:
      return "other";
  }
}

export function mapearPeriodicidade(cycle: string | null | undefined): Periodicidade {
  switch (cycle) {
    case "WEEKLY":
    case "BIWEEKLY":
      return "weekly";
    case "QUARTERLY":
      return "quarterly";
    case "SEMIANNUALLY":
      return "semiannual";
    case "YEARLY":
    case "ANNUALLY":
      return "annual";
    case "MONTHLY":
    default:
      return "monthly";
  }
}

// -----------------------------------------------------------------------------
// Entidades
// -----------------------------------------------------------------------------

interface ClienteAsaasBruto {
  id: string;
  name: string;
  email?: string | null;
  mobilePhone?: string | null;
  phone?: string | null;
  cpfCnpj?: string | null;
}

export function mapearCliente(bruto: ClienteAsaasBruto): ClienteExterno {
  return {
    externalId: bruto.id,
    nome: bruto.name,
    email: bruto.email ?? null,
    telefoneE164: normalizarTelefone(bruto.mobilePhone ?? bruto.phone ?? null),
    cpfCnpj: bruto.cpfCnpj ? bruto.cpfCnpj.replace(/\D/g, "") : null,
  };
}

interface AssinaturaAsaasBruta {
  id: string;
  customer: string;
  description?: string | null;
  value: number;
  cycle?: string | null;
  nextDueDate?: string | null;
  billingType?: string | null;
  status?: string | null;
}

export function mapearAssinatura(bruta: AssinaturaAsaasBruta): AssinaturaExterna {
  return {
    externalId: bruta.id,
    clienteExternoId: bruta.customer,
    descricao: bruta.description ?? null,
    valorCentavos: paraCentavos(bruta.value),
    periodicidade: mapearPeriodicidade(bruta.cycle),
    diaVencimento: bruta.nextDueDate ? diaDoMes(bruta.nextDueDate) : null,
    metodo: mapearMetodo(bruta.billingType),
    ativa: bruta.status === "ACTIVE",
  };
}

interface CobrancaAsaasBruta {
  id: string;
  customer: string;
  subscription?: string | null;
  value: number;
  dueDate: string;
  billingType?: string | null;
  status: string;
  paymentDate?: string | null;
  confirmedDate?: string | null;
}

export function mapearCobranca(bruta: CobrancaAsaasBruta): CobrancaHistorica {
  return {
    externalId: bruta.id,
    clienteExternoId: bruta.customer,
    assinaturaExternaId: bruta.subscription ?? null,
    valorCentavos: paraCentavos(bruta.value),
    vencimento: bruta.dueDate,
    metodo: mapearMetodo(bruta.billingType),
    status: mapearStatusDeCobranca(bruta.status),
    pagoEm: bruta.paymentDate ?? bruta.confirmedDate ?? null,
    motivoFalha: null,
  };
}

/**
 * O que conta como falha para o diagnóstico (RF-32).
 *
 * `OVERDUE` entra como falha de propósito: para o operador, boleto vencido e
 * não pago É dinheiro que não entrou. Tratá-lo como "pendente" subestimaria a
 * perda, e subestimar a perda é o oposto do que o produto existe para fazer.
 */
export function mapearStatusDeCobranca(
  status: string,
): CobrancaHistorica["status"] {
  switch (status) {
    case "RECEIVED":
    case "CONFIRMED":
    case "RECEIVED_IN_CASH":
      return "succeeded";
    case "OVERDUE":
    case "REFUNDED":
    case "CHARGEBACK_REQUESTED":
    case "CHARGEBACK_DISPUTE":
    case "AWAITING_CHARGEBACK_REVERSAL":
      return "failed";
    case "PENDING":
    case "AWAITING_RISK_ANALYSIS":
      return "pending";
    default:
      return "cancelled";
  }
}

export function mapearStatusDeAutorizacao(status: string): StatusAutorizacao {
  switch (status) {
    // Criada, mas ainda não ativa: o Asaas só ativa depois que o primeiro
    // pagamento liquida.
    case "CREATED":
    case "PENDING":
    case "AWAITING_PAYMENT":
      return "pending";
    case "ACTIVE":
    case "ACTIVATED":
      return "authorized";
    case "REJECTED":
    case "DENIED":
      return "rejected";
    case "CANCELED":
    case "CANCELLED":
    case "REVOKED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    default:
      return "pending";
  }
}

interface AutorizacaoAsaasBruta {
  id: string;
  status: string;
  maximumValue?: number | null;
  activatedDate?: string | null;
  canceledDate?: string | null;
  expirationDate?: string | null;
}

export function mapearAutorizacao(
  bruta: AutorizacaoAsaasBruta,
): EstadoDaAutorizacao {
  return {
    externalMandateId: bruta.id,
    status: mapearStatusDeAutorizacao(bruta.status),
    tetoCentavos:
      bruta.maximumValue != null ? paraCentavos(bruta.maximumValue) : null,
    autorizadoEm: bruta.activatedDate ?? null,
    canceladoEm: bruta.canceledDate ?? null,
    expiraEm: bruta.expirationDate ?? null,
  };
}

// -----------------------------------------------------------------------------
// Cobrança recorrente (Fase 2)
// -----------------------------------------------------------------------------

/**
 * Status de cobrança recorrente do Asaas para o domínio.
 *
 * Diferente de `mapearStatusDeCobranca` (usado no histórico de diagnóstico),
 * aqui interessa o estado operacional em tempo real para o ciclo mensal.
 */
export function mapearStatusDeCobrancaAtiva(
  status: string | null | undefined,
): StatusCobrancaAtiva {
  switch (status) {
    case "PENDING":
    case "AWAITING_RISK_ANALYSIS":
      return "scheduled";
    case "RECEIVED":
    case "CONFIRMED":
    case "RECEIVED_IN_CASH":
      return "succeeded";
    case "OVERDUE":
    case "REFUNDED":
    case "CHARGEBACK_REQUESTED":
    case "CHARGEBACK_DISPUTE":
    case "AWAITING_CHARGEBACK_REVERSAL":
      return "failed";
    case "REFUND_IN_PROGRESS":
    case "CHARGEBACK_IN_PROGRESS":
      return "retrying";
    case "CANCELLED":
    case "CANCELED":
      return "cancelled";
    default:
      return "scheduled";
  }
}

interface CobrancaAsaasRecorrenteBruta {
  id: string;
  status: string;
  dueDate: string;
  value: number;
  pix?: { payload?: string; encodedImage?: string } | null;
}

export function mapearCobrancaCriada(
  bruta: CobrancaAsaasRecorrenteBruta,
): CobrancaCriada {
  return {
    externalChargeId: bruta.id,
    vencimento: bruta.dueDate,
    status: mapearStatusDeCobrancaAtiva(bruta.status),
    qrCodePayload: bruta.pix?.payload ?? null,
    qrCodeImagem: bruta.pix?.encodedImage ?? null,
  };
}

interface EstadoCobrancaAsaasBruto {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  paymentDate?: string | null;
  confirmedDate?: string | null;
  failReason?: string | null;
  chargebackReason?: string | null;
}

export function mapearEstadoDaCobranca(
  bruto: EstadoCobrancaAsaasBruto,
): EstadoDaCobranca {
  return {
    externalChargeId: bruto.id,
    status: mapearStatusDeCobrancaAtiva(bruto.status),
    valorCentavos: paraCentavos(bruto.value),
    vencimento: bruto.dueDate,
    pagoEm: bruto.paymentDate ?? bruto.confirmedDate ?? null,
    motivo: bruto.failReason ?? bruto.chargebackReason ?? null,
  };
}

// -----------------------------------------------------------------------------
// Webhook
// -----------------------------------------------------------------------------

interface WebhookAsaasBruto {
  id?: string;
  event: string;
  dateCreated?: string;
  payment?: {
    id: string;
    value?: number;
    pixAutomaticRecurringAuthorization?: string | null;
    status?: string;
  };
  pixAutomaticRecurringAuthorization?: {
    id: string;
    status?: string;
  };
}

/**
 * Um webhook do Asaas vira zero ou um evento normalizado. Zero quando o evento
 * não interessa ao produto — e a maioria não interessa: o filtro de escopo vale
 * também aqui (valor RECUSA, §4.2). Reagir a evento que não ajuda a migrar nem
 * a manter a autorização viva é como construir funcionalidade que não ajuda.
 */
export function mapearEventoDeWebhook(
  bruto: WebhookAsaasBruto,
): EventoNormalizado | null {
  const externalEventId = bruto.id ?? `${bruto.event}:${bruto.dateCreated ?? ""}`;
  const ocorridoEm = bruto.dateCreated ?? new Date().toISOString();

  switch (bruto.event) {
    case "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED":
      return autorizacao("mandate.authorized");
    case "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REJECTED":
      return autorizacao("mandate.rejected");
    case "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELED":
    case "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED":
      return autorizacao("mandate.cancelled");
    case "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_EXPIRED":
      return autorizacao("mandate.expired");

    case "PAYMENT_RECEIVED":
    case "PAYMENT_CONFIRMED":
      return cobranca("charge.succeeded");
    case "PAYMENT_OVERDUE":
      return cobranca("charge.failed");
    case "PAYMENT_CREATED":
      return cobranca("charge.scheduled");

    default:
      return null;
  }

  function autorizacao(
    tipo: "mandate.authorized" | "mandate.rejected" | "mandate.cancelled" | "mandate.expired",
  ): EventoNormalizado | null {
    const id = bruto.pixAutomaticRecurringAuthorization?.id;
    if (!id) return null;
    return { tipo, externalEventId, externalMandateId: id, ocorridoEm };
  }

  function cobranca(
    tipo: "charge.succeeded" | "charge.failed" | "charge.scheduled",
  ): EventoNormalizado | null {
    const pagamento = bruto.payment;
    if (!pagamento?.id) return null;
    return {
      tipo,
      externalEventId,
      externalChargeId: pagamento.id,
      externalMandateId: pagamento.pixAutomaticRecurringAuthorization ?? null,
      valorCentavos: pagamento.value != null ? paraCentavos(pagamento.value) : null,
      motivo: null,
      ocorridoEm,
    };
  }
}

// -----------------------------------------------------------------------------
// Auxiliares
// -----------------------------------------------------------------------------

/** Telefone brasileiro para E.164. Sem DDI, assume +55. */
export function normalizarTelefone(bruto: string | null): string | null {
  if (!bruto) return null;
  const digitos = bruto.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  if (digitos.startsWith("55") && digitos.length >= 12) return `+${digitos}`;
  return `+55${digitos}`;
}

function diaDoMes(dataIso: string): number | null {
  const dia = Number(dataIso.slice(8, 10));
  return Number.isFinite(dia) && dia >= 1 && dia <= 31 ? dia : null;
}
