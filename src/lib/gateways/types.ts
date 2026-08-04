/**
 * A fronteira do sistema.
 *
 * Nenhum código fora de `src/lib/gateways/*` conhece o nome de um provedor.
 * Esta é também a fronteira do VOCABULÁRIO (brand book §4.3): daqui para
 * dentro, jargão técnico normalizado (`mandate.authorized`); daqui para fora,
 * português para quem opera ("autorização confirmada"). A tradução acontece na
 * camada de interface, nunca no adapter.
 */

export type Provider = "asaas";

export type MetodoPagamento =
  | "card"
  | "boleto"
  | "pix_manual"
  | "debito_automatico"
  | "pix_automatico"
  | "other";

export type Periodicidade =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual";

/** Dinheiro sempre em centavos, inteiro. Nunca float. */
export type Centavos = number;

// -----------------------------------------------------------------------------
// Importação da base
// -----------------------------------------------------------------------------

export interface Pagina<T> {
  itens: T[];
  /** `null` quando acabou. O chamador pagina até esvaziar. */
  proximoCursor: string | null;
}

export interface ClienteExterno {
  externalId: string;
  nome: string;
  email: string | null;
  telefoneE164: string | null;
  cpfCnpj: string | null;
}

export interface AssinaturaExterna {
  externalId: string;
  clienteExternoId: string;
  descricao: string | null;
  valorCentavos: Centavos;
  periodicidade: Periodicidade;
  diaVencimento: number | null;
  metodo: MetodoPagamento;
  ativa: boolean;
}

export interface CobrancaHistorica {
  externalId: string;
  clienteExternoId: string;
  assinaturaExternaId: string | null;
  valorCentavos: Centavos;
  vencimento: string; // ISO date
  metodo: MetodoPagamento;
  /** Normalizado. O histórico de falha alimenta o RF-32 e a ordem da onda. */
  status: "succeeded" | "failed" | "pending" | "cancelled";
  pagoEm: string | null;
  motivoFalha: string | null;
}

// -----------------------------------------------------------------------------
// Autorização (mandato)
// -----------------------------------------------------------------------------

export interface DadosDoPagador {
  nome: string;
  email: string | null;
  telefoneE164: string | null;
  cpfCnpj: string;
  /** Id do cliente no gateway, quando a base veio de sync. */
  externalId?: string | null;
}

export interface CriarAutorizacao {
  pagador: DadosDoPagador;
  valorCentavos: Centavos;
  /**
   * Valor-teto: o máximo que o pagador está autorizando. Reajuste acima do teto
   * exige reautorização (RF-66). É informação de consentimento e aparece na
   * página do pagador em corpo legível, nunca em texto fraco (§5.3).
   */
  tetoCentavos: Centavos;
  periodicidade: Periodicidade;
  diaVencimento: number;
  descricao: string;
}

export interface AutorizacaoCriada {
  externalMandateId: string;
  /**
   * ATENÇÃO — o fluxo do Pix Automático não é "clicar em autorizar e pronto".
   *
   * O gateway devolve um QR Code imediato: o pagador paga a PRIMEIRA cobrança
   * por Pix e é esse pagamento que registra o consentimento. A autorização só
   * fica ativa depois que esse primeiro pagamento liquida.
   *
   * Consequência para a página do pagador: ela precisa dizer com clareza que
   * há um pagamento agora, e o valor precisa estar visível antes do QR — o
   * pagador está prestes a mover dinheiro, e a marca não esconde isso.
   */
  qrCodePayload: string | null;
  qrCodeImagem: string | null; // base64, sem prefixo data:
  /** Deep link para o app do banco. No celular substitui o QR. */
  linkPagamento: string | null;
  expiraEm: string | null; // ISO
}

export type StatusAutorizacao =
  | "pending" // criada; aguardando o primeiro pagamento liquidar
  | "authorized" // ativa
  | "rejected"
  | "cancelled"
  | "expired";

export interface EstadoDaAutorizacao {
  externalMandateId: string;
  status: StatusAutorizacao;
  tetoCentavos: Centavos | null;
  autorizadoEm: string | null;
  canceladoEm: string | null;
  expiraEm: string | null;
}

// -----------------------------------------------------------------------------
// Eventos normalizados
// -----------------------------------------------------------------------------

export type EventoNormalizado =
  | {
      tipo: "mandate.authorized" | "mandate.rejected" | "mandate.cancelled" | "mandate.expired";
      externalEventId: string;
      externalMandateId: string;
      ocorridoEm: string;
    }
  | {
      tipo: "charge.succeeded" | "charge.failed" | "charge.scheduled" | "charge.retrying";
      externalEventId: string;
      externalChargeId: string;
      externalMandateId: string | null;
      valorCentavos: Centavos | null;
      motivo: string | null;
      ocorridoEm: string;
    };

// -----------------------------------------------------------------------------
// O adapter
// -----------------------------------------------------------------------------

export interface ResultadoConexao {
  ok: boolean;
  /**
   * Mensagem já em português e já acionável. O operador não é técnico: erro que
   * diz o que houve e o que fazer é regra de código, não de copy (§4.2).
   */
  mensagem: string;
  nomeDaConta?: string;
}

export interface GatewayAdapter {
  readonly provider: Provider;

  testConnection(): Promise<ResultadoConexao>;

  listCustomers(cursor?: string): Promise<Pagina<ClienteExterno>>;
  listSubscriptions(cursor?: string): Promise<Pagina<AssinaturaExterna>>;
  listPaymentHistory(opts: {
    desde: string; // ISO date — 12 meses para trás, no diagnóstico
    cursor?: string;
  }): Promise<Pagina<CobrancaHistorica>>;

  createMandate(entrada: CriarAutorizacao): Promise<AutorizacaoCriada>;
  getMandate(externalMandateId: string): Promise<EstadoDaAutorizacao>;

  verifyWebhook(raw: string, headers: Headers): boolean;
  parseWebhook(raw: string): EventoNormalizado[];
}

export class ErroDeGateway extends Error {
  constructor(
    /** Mensagem em português, pronta para a interface. */
    message: string,
    readonly detalhe: { provider: Provider; status?: number; corpo?: unknown },
  ) {
    super(message);
    this.name = "ErroDeGateway";
  }
}
