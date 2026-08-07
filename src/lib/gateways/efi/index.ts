import { createHmac, timingSafeEqual } from "node:crypto";

import type {
  AssinaturaExterna,
  AutorizacaoCriada,
  ClienteExterno,
  CobrancaCriada,
  CobrancaHistorica,
  CriarAutorizacao,
  CriarCobranca,
  CriarPixAvulso,
  EstadoDaAutorizacao,
  EstadoDaCobranca,
  EventoNormalizado,
  GatewayAdapter,
  Pagina,
  PixAvulsoCriado,
  Provider,
  ResultadoConexao,
} from "../types";
import { ClienteEfi, type ConfigEfi } from "./client";
import {
  ConsentimentoEfiBruto,
  CobEfiBruta,
  DebitoRecorrenteEfiBruto,
  gerarTxid,
  mapearAutorizacao,
  mapearCobHistorica,
  mapearCobrancaCriada,
  mapearEstadoDaCobranca,
  mapearEventoDeWebhook,
  paraDecimal,
  paraPeriodicidadeEfi,
  WebhookEfiBruto,
} from "./mappers";

/**
 * Adapter para a Efí Bank (ex-Gerencianet).
 *
 * Diferenças de modelo em relação ao Asaas:
 *
 * 1. SEM listCustomers / listSubscriptions — a Efí é charge-centric: não tem
 *    cadastro de clientes nem assinaturas; o consentimento Pix é o vínculo.
 *    Os métodos retornam página vazia para satisfazer o contrato.
 *
 * 2. O id do consentimento (idRecorrencia) é gerado POR NÓS, não pelo gateway.
 *    É um UUID v4 sem traços, 35 chars — padrão BACEN (Resolução 384/2024).
 *
 * 3. Não há QR Code por ciclo — o pagador autoriza uma vez no app do banco e
 *    os débitos seguintes são automáticos. createMandate devolve linkPagamento
 *    (deep link) em vez de qrCodePayload.
 *
 * 4. createOneOffPix usa PUT /v2/cob/{txid} (idempotente por txid).
 *
 * 5. Webhook validado via HMAC-SHA256 no header `x-hmac-sha256`.
 *    Sem segredo configurado, RECUSA (mesmo critério do Asaas).
 */
export class AdapterEfi implements GatewayAdapter {
  readonly provider: Provider = "efi";
  private readonly http: ClienteEfi;

  constructor(private readonly config: ConfigEfi) {
    this.http = new ClienteEfi(config);
  }

  // ---------------------------------------------------------------------------
  // Diagnóstico de conexão
  // ---------------------------------------------------------------------------

  async testConnection(): Promise<ResultadoConexao> {
    try {
      const conta = await this.http.requisitar<{ nomeEmpresarial?: string; chavesPix?: string[] }>(
        "/v2/gn/infoconta",
      );
      return {
        ok: true,
        mensagem: "Conexão com a Efí Bank estabelecida.",
        nomeDaConta: conta.nomeEmpresarial,
      };
    } catch (erro) {
      return {
        ok: false,
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Não conseguimos validar a credencial Efí agora.",
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Importação de base — a Efí não tem cadastro de clientes nem assinaturas
  // ---------------------------------------------------------------------------

  async listCustomers(_cursor?: string): Promise<Pagina<ClienteExterno>> {
    // A Efí é charge-centric — não há endpoint de listagem de clientes.
    // Retornamos página vazia para que o importador finalize sem erro.
    return { itens: [], proximoCursor: null };
  }

  async listSubscriptions(_cursor?: string): Promise<Pagina<AssinaturaExterna>> {
    // Idem: sem conceito de assinatura na Efí.
    return { itens: [], proximoCursor: null };
  }

  /**
   * Lista cobranças Pix avulsas (endpoint /v2/cob).
   *
   * A Efí usa paginação por cursor de offset via `paginacao.inicio`.
   * Mapeamos cada cob para CobrancaHistorica usando o txid como clienteExternoId,
   * pois a Efí não retorna id de cliente junto com a cobrança.
   */
  async listPaymentHistory({
    desde,
    cursor,
  }: {
    desde: string;
    cursor?: string;
  }): Promise<Pagina<CobrancaHistorica>> {
    const inicio = Number(cursor ?? 0);
    const TAMANHO = 100;

    const resposta = await this.http.requisitar<{
      cobs?: CobEfiBruta[];
      parametros?: { paginacao?: { paginaAtual: number; itensPorPagina: number; quantidadeDePaginas: number } };
    }>("/v2/cob", {
      query: {
        inicio: desde,
        fim: new Date().toISOString().slice(0, 10),
        "paginacao.paginaAtual": inicio,
        "paginacao.itensPorPagina": TAMANHO,
      },
    });

    const cobs = resposta.cobs ?? [];
    const paginacao = resposta.parametros?.paginacao;
    const temMais =
      paginacao != null &&
      paginacao.paginaAtual < paginacao.quantidadeDePaginas - 1;

    return {
      itens: cobs.map((c) => mapearCobHistorica(c, c.txid)),
      proximoCursor: temMais ? String(inicio + 1) : null,
    };
  }

  // ---------------------------------------------------------------------------
  // Mandato (consentimento Pix Automático)
  // ---------------------------------------------------------------------------

  /**
   * Cria o consentimento de Pix Automático na Efí.
   *
   * Diferença crítica do Asaas: o id do consentimento é gerado por nós
   * (iniciador) e enviado no PATH (PUT /v2/pix-automatico/{idRecorrencia}).
   * A Efí não gera QR Code — o pagador é redirecionado pelo linkAprovacao.
   */
  async createMandate(entrada: CriarAutorizacao): Promise<AutorizacaoCriada> {
    const idRecorrencia = gerarTxid();

    const hoje = new Date().toISOString().slice(0, 10);

    const resposta = await this.http.requisitar<{
      idRecorrencia: string;
      linkAprovacao?: string | null;
      calendario?: { dataFinalRecorrencia?: string | null };
    }>(`/v2/pix-automatico/${idRecorrencia}`, {
      method: "PUT",
      body: JSON.stringify({
        calendario: {
          dataInicialRecorrencia: hoje,
          periodicidade: paraPeriodicidadeEfi(entrada.periodicidade),
        },
        devedor: {
          cpf: entrada.pagador.cpfCnpj.replace(/\D/g, "").slice(0, 11),
          nome: entrada.pagador.nome,
        },
        valor: {
          original: paraDecimal(entrada.valorCentavos),
          limite: paraDecimal(entrada.tetoCentavos),
        },
        descricao: entrada.descricao,
      }),
    });

    return {
      externalMandateId: resposta.idRecorrencia ?? idRecorrencia,
      qrCodePayload: null, // Pix Automático Efí não usa QR por consentimento
      qrCodeImagem: null,
      linkPagamento: resposta.linkAprovacao ?? null,
      expiraEm: resposta.calendario?.dataFinalRecorrencia ?? null,
    };
  }

  async getMandate(externalMandateId: string): Promise<EstadoDaAutorizacao> {
    const resposta = await this.http.requisitar<ConsentimentoEfiBruto>(
      `/v2/pix-automatico/${externalMandateId}`,
    );
    return mapearAutorizacao(resposta);
  }

  async cancelMandate(externalMandateId: string): Promise<void> {
    await this.http.requisitar<void>(
      `/v2/pix-automatico/${externalMandateId}`,
      { method: "DELETE" },
    );
  }

  // ---------------------------------------------------------------------------
  // Cobrança recorrente (débito por ciclo)
  // ---------------------------------------------------------------------------

  /**
   * Cria um débito recorrente vinculado a um consentimento ativo.
   *
   * A Efí usa PUT /v2/pix-automatico/{idRecorrencia}/cobranças/{idCobranca}
   * ou endpoint equivalente. O txid é gerado por nós (idempotência).
   */
  async scheduleCharge(entrada: CriarCobranca): Promise<CobrancaCriada> {
    const txid = gerarTxid();

    const resposta = await this.http.requisitar<DebitoRecorrenteEfiBruto>(
      `/v2/pix-automatico/${entrada.externalMandateId}/cobranças/${txid}`,
      {
        method: "PUT",
        body: JSON.stringify({
          calendario: { dataDeVencimento: entrada.vencimento },
          valor: { original: paraDecimal(entrada.valorCentavos) },
          descricao: entrada.descricao,
        }),
      },
    );

    return mapearCobrancaCriada(resposta, txid);
  }

  async getCharge(externalChargeId: string): Promise<EstadoDaCobranca> {
    const resposta = await this.http.requisitar<DebitoRecorrenteEfiBruto>(
      `/v2/pix-automatico/cobrancas/${externalChargeId}`,
    );
    return mapearEstadoDaCobranca(resposta, externalChargeId);
  }

  // ---------------------------------------------------------------------------
  // Pix avulso
  // ---------------------------------------------------------------------------

  /**
   * Cria uma cobrança Pix avulsa (cob) — PUT /v2/cob/{txid}.
   *
   * Diferente do Asaas, a Efí usa PUT idempotente com txid no path.
   * O QR Code é retornado no campo `pixCopiaECola` (campo brx padrão BACEN).
   */
  async createOneOffPix(entrada: CriarPixAvulso): Promise<PixAvulsoCriado> {
    const txid = entrada.referenciaExterna
      ? entrada.referenciaExterna.replace(/[^a-zA-Z0-9]/g, "").slice(0, 35)
      : gerarTxid();

    const expiracao = 3600; // 1 hora em segundos

    const resposta = await this.http.requisitar<{
      txid: string;
      pixCopiaECola?: string | null;
      imagemQrcode?: string | null;
      linkVisualizacao?: string | null;
    }>(`/v2/cob/${txid}`, {
      method: "PUT",
      body: JSON.stringify({
        calendario: { expiracao },
        devedor: {
          cpf: entrada.pagador.cpfCnpj.replace(/\D/g, "").slice(0, 11),
          nome: entrada.pagador.nome,
        },
        valor: { original: paraDecimal(entrada.valorCentavos) },
        chave: "", // chave Pix da organização — TODO: buscar de infoconta
        infoAdicionais: [{ nome: "descricao", valor: entrada.descricao }],
      }),
    });

    return {
      externalChargeId: resposta.txid ?? txid,
      qrCodePayload: resposta.pixCopiaECola ?? null,
      qrCodeImagem: resposta.imagemQrcode ?? null,
      linkPagamento: resposta.linkVisualizacao ?? null,
      expiraEm: new Date(Date.now() + expiracao * 1000).toISOString(),
    };
  }

  // ---------------------------------------------------------------------------
  // Webhook
  // ---------------------------------------------------------------------------

  /**
   * A Efí assina webhooks com HMAC-SHA256 no header `x-hmac-sha256`.
   *
   * Comparação em tempo constante — mesmo critério do Asaas.
   * Sem segredo configurado, RECUSA: webhook aberto aceita qualquer POST.
   */
  verifyWebhook(raw: string, headers: Headers): boolean {
    const esperado = this.config.webhookSecret;
    if (!esperado) return false;

    const recebido = headers.get("x-hmac-sha256");
    if (!recebido) return false;

    const assinatura = createHmac("sha256", esperado).update(raw).digest("hex");
    const a = Buffer.from(recebido);
    const b = Buffer.from(assinatura);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  parseWebhook(raw: string): EventoNormalizado[] {
    let bruto: unknown;
    try {
      bruto = JSON.parse(raw);
    } catch {
      return [];
    }

    const evento = mapearEventoDeWebhook(bruto as WebhookEfiBruto);
    return evento ? [evento] : [];
  }
}
