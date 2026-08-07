import type {
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
 * Efí Bank → domínio. Funções puras, testadas em mappers.test.ts.
 *
 * A Efí usa o padrão BACEN para Pix Automático (Resolução 384/2024), então
 * vários campos seguem a nomenclatura do BACEN em vez do vocabulário próprio
 * do gateway. Comentamos o campo original quando o mapeamento é surpreendente.
 *
 * Diferenças críticas em relação ao Asaas:
 * - Dinheiro em string decimal ("150.00"), não em float.
 * - IDs de mandato são UUIDs gerados pelo INICIADOR (nós), não pelo gateway.
 * - Status em português estilo BACEN ("ATIVA", "PENDENTE_AUTORIZACAO").
 * - Periodicidade como "MENSAL", "QUINZENAL", etc.
 * - Sem conceito de "customer" ou "subscription" — é charge-centric.
 */

// -----------------------------------------------------------------------------
// Dinheiro
// -----------------------------------------------------------------------------

/**
 * A Efí retorna valores monetários como string decimal ("150.00").
 * Mesma lógica do Asaas, só a entrada muda.
 */
export function paraCentavos(valor: string | number | null | undefined): number {
  if (valor === null || valor === undefined || valor === "") return 0;
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  if (!Number.isFinite(numero)) return 0;
  return Math.round(numero * 100);
}

export function paraDecimal(centavos: number): string {
  return (centavos / 100).toFixed(2);
}

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export function mapearPeriodicidade(periodicidade: string | null | undefined): Periodicidade {
  switch (periodicidade) {
    case "SEMANAL":
      return "weekly";
    case "QUINZENAL": // quinzenal → mapeamos como weekly (mais próximo)
      return "weekly";
    case "TRIMESTRAL":
      return "quarterly";
    case "SEMESTRAL":
      return "semiannual";
    case "ANUAL":
      return "annual";
    case "MENSAL":
    default:
      return "monthly";
  }
}

/** Domínio → string da Efí (padrão BACEN). */
export function paraPeriodicidadeEfi(periodicidade: Periodicidade): string {
  switch (periodicidade) {
    case "weekly":
      return "SEMANAL";
    case "quarterly":
      return "TRIMESTRAL";
    case "semiannual":
      return "SEMESTRAL";
    case "annual":
      return "ANUAL";
    case "monthly":
    default:
      return "MENSAL";
  }
}

/**
 * Status do consentimento Pix Automático.
 *
 * Padrão BACEN (Resolução 384/2024):
 * - PENDENTE_AUTORIZACAO: criado, aguardando o pagador autorizar no banco
 * - ATIVA:               autorizado e pronto para cobranças
 * - REJEITADA:           pagador ou banco negou a solicitação
 * - CANCELADA:           cancelado após ativo
 * - CONCLUIDA:           data de encerramento atingida
 */
export function mapearStatusDeAutorizacao(status: string | null | undefined): StatusAutorizacao {
  switch (status) {
    case "PENDENTE_AUTORIZACAO":
    case "CRIADA":
      return "pending";
    case "ATIVA":
    case "AUTORIZADA":
      return "authorized";
    case "REJEITADA":
    case "NEGADA":
      return "rejected";
    case "CANCELADA":
      return "cancelled";
    case "CONCLUIDA":
    case "EXPIRADA":
      return "expired";
    default:
      return "pending";
  }
}

/**
 * Status de cobrança recorrente da Efí.
 *
 * A Efí usa o padrão BACEN para cobranças vinculadas ao Pix Automático.
 * Status prováveis (confirmar com sandbox):
 */
export function mapearStatusDeCobrancaAtiva(
  status: string | null | undefined,
): StatusCobrancaAtiva {
  switch (status) {
    case "ATIVA":
    case "PENDENTE":
    case "CRIADA":
      return "scheduled";
    case "CONCLUIDA":
    case "PAGA":
    case "RECEBIDA":
      return "succeeded";
    case "NEGADA":
    case "CANCELADA":
    case "ERRO_DEBITO":
      return "failed";
    case "EM_PROCESSAMENTO":
      return "retrying";
    default:
      return "scheduled";
  }
}

/**
 * Status de cobrança para o histórico de diagnóstico.
 *
 * A Efí usa status BACEN nas cobranças Pix (cob/cobsv).
 */
export function mapearStatusDeCobrancaHistorica(
  status: string | null | undefined,
): CobrancaHistorica["status"] {
  switch (status) {
    case "CONCLUIDA":
    case "PAGA":
      return "succeeded";
    case "ATIVA":
    case "PENDENTE":
      return "pending";
    case "NEGADA":
    case "CANCELADA":
      return "failed";
    default:
      return "cancelled";
  }
}

export function mapearMetodoEfi(tipo: string | null | undefined): MetodoPagamento {
  switch (tipo) {
    case "PIX_AUTOMATICO":
    case "pix_automatico":
      return "pix_automatico";
    case "PIX":
    case "pix":
      return "pix_manual";
    case "BOLETO":
      return "boleto";
    case "CARTAO":
    case "CREDITO":
      return "card";
    default:
      return "other";
  }
}

// -----------------------------------------------------------------------------
// Entidades de cobrança
// -----------------------------------------------------------------------------

/** Cobrança Pix da Efí (endpoint /v2/cob ou /v2/cobsv). */
export interface CobEfiBruta {
  txid: string;
  status: string;
  valor: { original: string };
  calendario: { criacao?: string; dataDeVencimento?: string; expiracao?: number };
  pix?: Array<{ endToEndId?: string; horario?: string; valor?: string }>;
  devedor?: { cpf?: string; nome?: string };
}

export function mapearCobHistorica(
  bruta: CobEfiBruta,
  clienteId: string,
): CobrancaHistorica {
  const pago = bruta.pix?.[0];
  return {
    externalId: bruta.txid,
    clienteExternoId: clienteId,
    assinaturaExternaId: null,
    valorCentavos: paraCentavos(bruta.valor.original),
    vencimento:
      bruta.calendario.dataDeVencimento ??
      bruta.calendario.criacao?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
    metodo: "pix_manual",
    status: mapearStatusDeCobrancaHistorica(bruta.status),
    pagoEm: pago?.horario ?? null,
    motivoFalha: null,
  };
}

// -----------------------------------------------------------------------------
// Mandato (Pix Automático — consentimento)
// -----------------------------------------------------------------------------

/**
 * Consentimento Pix Automático da Efí (padrão BACEN).
 *
 * A Efí retorna o `idRecorrencia` (UUID que o iniciador gera) e um
 * `linkAprovacao` para o pagador abrir no app do banco. O fluxo é diferente
 * do Asaas: não há QR Code de primeiro pagamento — o pagador autoriza no
 * próprio app e a primeira cobrança é criada separadamente.
 *
 * TODO: Validar nomes de campo exatos com a API em sandbox da Efí.
 * Referência: https://developers.efipay.com.br/apis/pix-automatico
 */
export interface ConsentimentoEfiBruto {
  idRecorrencia: string;
  status: string;
  valor?: { original?: string; limite?: string };
  linkAprovacao?: string | null;
  calendario?: {
    dataInicialRecorrencia?: string;
    dataFinalRecorrencia?: string | null;
  };
  autorizacaoEm?: string | null;
  cancelamentoEm?: string | null;
}

export function mapearAutorizacao(
  bruto: ConsentimentoEfiBruto,
): EstadoDaAutorizacao {
  return {
    externalMandateId: bruto.idRecorrencia,
    status: mapearStatusDeAutorizacao(bruto.status),
    tetoCentavos:
      bruto.valor?.limite != null ? paraCentavos(bruto.valor.limite) : null,
    autorizadoEm: bruto.autorizacaoEm ?? null,
    canceladoEm: bruto.cancelamentoEm ?? null,
    expiraEm: bruto.calendario?.dataFinalRecorrencia ?? null,
  };
}

// -----------------------------------------------------------------------------
// Cobrança recorrente (Pix Automático — débito por ciclo)
// -----------------------------------------------------------------------------

/** Débito recorrente da Efí vinculado a um consentimento ativo. */
export interface DebitoRecorrenteEfiBruto {
  idPagamento?: string;
  txid?: string;
  status: string;
  valor?: { original?: string };
  calendario?: { dataDeVencimento?: string };
  pix?: Array<{ horario?: string; valor?: string }>;
  motivoRejeicao?: string | null;
}

export function mapearCobrancaCriada(
  bruto: DebitoRecorrenteEfiBruto,
  txid: string,
): CobrancaCriada {
  return {
    externalChargeId: bruto.idPagamento ?? bruto.txid ?? txid,
    vencimento:
      bruto.calendario?.dataDeVencimento ??
      new Date().toISOString().slice(0, 10),
    status: mapearStatusDeCobrancaAtiva(bruto.status),
    // Pix Automático da Efí não gera QR Code por ciclo — o consentimento já
    // autoriza débitos futuros. QR Code existe só na autorização inicial.
    qrCodePayload: null,
    qrCodeImagem: null,
  };
}

export function mapearEstadoDaCobranca(
  bruto: DebitoRecorrenteEfiBruto,
  txidFallback: string,
): EstadoDaCobranca {
  const pago = bruto.pix?.[0];
  return {
    externalChargeId: bruto.idPagamento ?? bruto.txid ?? txidFallback,
    status: mapearStatusDeCobrancaAtiva(bruto.status),
    valorCentavos: paraCentavos(bruto.valor?.original),
    vencimento:
      bruto.calendario?.dataDeVencimento ??
      new Date().toISOString().slice(0, 10),
    pagoEm: pago?.horario ?? null,
    motivo: bruto.motivoRejeicao ?? null,
  };
}

// -----------------------------------------------------------------------------
// Webhook
// -----------------------------------------------------------------------------

/**
 * Eventos de webhook da Efí para Pix Automático.
 *
 * A Efí não padronizou publicamente os nomes de evento para Pix Automático
 * no momento desta implementação — os nomes abaixo seguem o padrão BACEN e
 * o vocabulário já documentado para outras operações Pix na Efí.
 *
 * TODO: Validar nomes exatos em sandbox antes de ir para produção.
 * Referência: https://developers.efipay.com.br/apis/pix-automatico/webhook
 */
export interface WebhookEfiBruto {
  /** Identificador único do evento (gerado pela Efí). */
  id?: string;
  /** Tipo do evento — nomenclatura BACEN/Efí. */
  evento?: string;
  /**
   * Consentimento afetado (para eventos de mandato).
   * Campo `recorrencia` ou `consentimento` dependendo da versão da API.
   */
  recorrencia?: { idRecorrencia?: string; status?: string };
  /**
   * Débito recorrente afetado (para eventos de cobrança).
   * Pode ser um objeto ou array.
   */
  debito?: {
    idPagamento?: string;
    txid?: string;
    valor?: string;
    motivo?: string;
  };
  /** Horário do evento. */
  horario?: string;
  /**
   * Evento de cobrança Pix avulso (cob) — array de transações liquidadas.
   * Formato idêntico ao webhook Pix standard da Efí.
   */
  pix?: Array<{
    endToEndId: string;
    txid?: string;
    valor?: string;
    horario?: string;
    infoPagador?: string;
  }>;
}

export function mapearEventoDeWebhook(
  bruto: WebhookEfiBruto,
): EventoNormalizado | null {
  const externalEventId = bruto.id ?? `${bruto.evento ?? ""}:${bruto.horario ?? ""}`;
  const ocorridoEm = bruto.horario ?? new Date().toISOString();

  // ── Eventos de mandato (consentimento Pix Automático) ──────────────────────
  if (bruto.recorrencia?.idRecorrencia) {
    const externalMandateId = bruto.recorrencia.idRecorrencia;

    switch (bruto.evento) {
      case "PIX_AUTOMATICO_RECORRENCIA_AUTORIZADO":
      case "AUTORIZACAO_PIX_AUTOMATICO_ATIVADA":
        return { tipo: "mandate.authorized", externalEventId, externalMandateId, ocorridoEm };

      case "PIX_AUTOMATICO_RECORRENCIA_NEGADO":
      case "AUTORIZACAO_PIX_AUTOMATICO_REJEITADA":
        return { tipo: "mandate.rejected", externalEventId, externalMandateId, ocorridoEm };

      case "PIX_AUTOMATICO_RECORRENCIA_CANCELADO":
      case "AUTORIZACAO_PIX_AUTOMATICO_CANCELADA":
        return { tipo: "mandate.cancelled", externalEventId, externalMandateId, ocorridoEm };

      case "PIX_AUTOMATICO_RECORRENCIA_CONCLUIDA":
      case "AUTORIZACAO_PIX_AUTOMATICO_EXPIRADA":
        return { tipo: "mandate.expired", externalEventId, externalMandateId, ocorridoEm };
    }
  }

  // ── Eventos de cobrança recorrente ────────────────────────────────────────
  if (bruto.debito?.idPagamento ?? bruto.debito?.txid) {
    const externalChargeId =
      (bruto.debito?.idPagamento ?? bruto.debito?.txid)!;

    switch (bruto.evento) {
      case "PIX_AUTOMATICO_DEBITO_CONCLUIDO":
        return {
          tipo: "charge.succeeded",
          externalEventId,
          externalChargeId,
          externalMandateId: null,
          valorCentavos: bruto.debito?.valor
            ? paraCentavos(bruto.debito.valor)
            : null,
          motivo: null,
          ocorridoEm,
        };

      case "PIX_AUTOMATICO_DEBITO_NEGADO":
      case "PIX_AUTOMATICO_DEBITO_CANCELADO":
        return {
          tipo: "charge.failed",
          externalEventId,
          externalChargeId,
          externalMandateId: null,
          valorCentavos: bruto.debito?.valor
            ? paraCentavos(bruto.debito.valor)
            : null,
          motivo: bruto.debito?.motivo ?? null,
          ocorridoEm,
        };

      case "PIX_AUTOMATICO_DEBITO_CRIADO":
        return {
          tipo: "charge.scheduled",
          externalEventId,
          externalChargeId,
          externalMandateId: null,
          valorCentavos: null,
          motivo: null,
          ocorridoEm,
        };
    }
  }

  // ── Cobrança Pix avulso liquidada (webhook Pix standard da Efí) ───────────
  if (bruto.pix?.length) {
    const tx = bruto.pix[0];
    if (tx.txid) {
      return {
        tipo: "charge.succeeded",
        externalEventId,
        externalChargeId: tx.txid,
        externalMandateId: null,
        valorCentavos: tx.valor ? paraCentavos(tx.valor) : null,
        motivo: null,
        ocorridoEm: tx.horario ?? ocorridoEm,
      };
    }
  }

  return null;
}

// -----------------------------------------------------------------------------
// Auxiliares
// -----------------------------------------------------------------------------

/** Telefone brasileiro para E.164. Sem DDI, assume +55. */
export function normalizarTelefone(bruto: string | null | undefined): string | null {
  if (!bruto) return null;
  const digitos = bruto.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  if (digitos.startsWith("55") && digitos.length >= 12) return `+${digitos}`;
  return `+55${digitos}`;
}

/**
 * Gera um txid válido para Pix (padrão BACEN: 26-35 chars, [a-zA-Z0-9]).
 * Usamos no scheduleCharge e createOneOffPix para identificar a cobrança.
 */
export function gerarTxid(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 35);
}
