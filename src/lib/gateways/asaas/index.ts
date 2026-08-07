import { timingSafeEqual } from "node:crypto";

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
import { ClienteAsaas, type ConfigAsaas } from "./client";
import {
  mapearAssinatura,
  mapearAutorizacao,
  mapearCliente,
  mapearCobranca,
  mapearCobrancaCriada,
  mapearEstadoDaCobranca,
  mapearEventoDeWebhook,
} from "./mappers";

const TAMANHO_PAGINA = 100;

interface ListaAsaas<T> {
  data: T[];
  hasMore: boolean;
  totalCount?: number;
}

export class AdapterAsaas implements GatewayAdapter {
  readonly provider: Provider = "asaas";
  private readonly http: ClienteAsaas;

  constructor(private readonly config: ConfigAsaas) {
    this.http = new ClienteAsaas(config);
  }

  async testConnection(): Promise<ResultadoConexao> {
    try {
      const conta = await this.http.requisitar<{ name?: string; email?: string }>(
        "/myAccount",
      );
      return {
        ok: true,
        mensagem: "Conexão estabelecida.",
        nomeDaConta: conta.name ?? conta.email,
      };
    } catch (erro) {
      return {
        ok: false,
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Não conseguimos validar a chave agora.",
      };
    }
  }

  async listCustomers(cursor?: string): Promise<Pagina<ClienteExterno>> {
    const offset = Number(cursor ?? 0);
    const resposta = await this.http.requisitar<ListaAsaas<Parameters<typeof mapearCliente>[0]>>(
      "/customers",
      { query: { limit: TAMANHO_PAGINA, offset } },
    );

    return {
      itens: resposta.data.map(mapearCliente),
      proximoCursor: resposta.hasMore ? String(offset + TAMANHO_PAGINA) : null,
    };
  }

  async listSubscriptions(cursor?: string): Promise<Pagina<AssinaturaExterna>> {
    const offset = Number(cursor ?? 0);
    const resposta = await this.http.requisitar<ListaAsaas<Parameters<typeof mapearAssinatura>[0]>>(
      "/subscriptions",
      { query: { limit: TAMANHO_PAGINA, offset } },
    );

    return {
      itens: resposta.data.map(mapearAssinatura),
      proximoCursor: resposta.hasMore ? String(offset + TAMANHO_PAGINA) : null,
    };
  }

  async listPaymentHistory({
    desde,
    cursor,
  }: {
    desde: string;
    cursor?: string;
  }): Promise<Pagina<CobrancaHistorica>> {
    const offset = Number(cursor ?? 0);
    const resposta = await this.http.requisitar<ListaAsaas<Parameters<typeof mapearCobranca>[0]>>(
      "/payments",
      {
        query: {
          limit: TAMANHO_PAGINA,
          offset,
          "dueDate[ge]": desde,
        },
      },
    );

    return {
      itens: resposta.data.map(mapearCobranca),
      proximoCursor: resposta.hasMore ? String(offset + TAMANHO_PAGINA) : null,
    };
  }

  /**
   * Cria a autorização de Pix Automático.
   *
   * O retorno inclui o QR Code do PRIMEIRO pagamento: no Pix Automático o
   * consentimento é registrado pelo pagamento inicial, e a autorização só fica
   * ativa quando ele liquida. Quem consome isto precisa comunicar o pagamento
   * ao pagador, não só pedir "autorize".
   */
  async createMandate(entrada: CriarAutorizacao): Promise<AutorizacaoCriada> {
    const customerId = await this.garantirCliente(entrada.pagador);

    const resposta = await this.http.requisitar<{
      id: string;
      expirationDate?: string | null;
      pix?: { payload?: string; encodedImage?: string; expirationDate?: string };
      invoiceUrl?: string | null;
    }>("/pix/automatic/authorizations", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        value: entrada.valorCentavos / 100,
        maximumValue: entrada.tetoCentavos / 100,
        frequency: paraFrequenciaAsaas(entrada.periodicidade),
        description: entrada.descricao,
      }),
    });

    return {
      externalMandateId: resposta.id,
      qrCodePayload: resposta.pix?.payload ?? null,
      qrCodeImagem: resposta.pix?.encodedImage ?? null,
      linkPagamento: resposta.invoiceUrl ?? null,
      expiraEm: resposta.pix?.expirationDate ?? resposta.expirationDate ?? null,
    };
  }

  async getMandate(externalMandateId: string): Promise<EstadoDaAutorizacao> {
    const resposta = await this.http.requisitar<
      Parameters<typeof mapearAutorizacao>[0]
    >(`/pix/automatic/authorizations/${externalMandateId}`);
    return mapearAutorizacao(resposta);
  }

  async cancelMandate(externalMandateId: string): Promise<void> {
    await this.http.requisitar<void>(
      `/pix/automatic/authorizations/${externalMandateId}`,
      { method: "DELETE" },
    );
  }

  /**
   * Cria uma instrução de cobrança para um mandato Pix Automático ativo.
   *
   * O gateway não debita sozinho — a aplicação é responsável por criar cada
   * cobrança. A chamada inclui `externalReference` para idempotência: reenviar
   * o mesmo payload retorna a cobrança existente sem duplicar.
   */
  async scheduleCharge(entrada: CriarCobranca): Promise<CobrancaCriada> {
    const resposta = await this.http.requisitar<
      Parameters<typeof mapearCobrancaCriada>[0]
    >("/pix/automatic/paymentInstructions", {
      method: "POST",
      body: JSON.stringify({
        authorization: entrada.externalMandateId,
        value: entrada.valorCentavos / 100,
        dueDate: entrada.vencimento,
        description: entrada.descricao,
        externalReference: entrada.referenciaExterna,
      }),
    });
    return mapearCobrancaCriada(resposta);
  }

  async getCharge(externalChargeId: string): Promise<EstadoDaCobranca> {
    const resposta = await this.http.requisitar<
      Parameters<typeof mapearEstadoDaCobranca>[0]
    >(`/pix/automatic/paymentInstructions/${externalChargeId}`);
    return mapearEstadoDaCobranca(resposta);
  }

  /**
   * Gera um Pix avulso (cobrança única) para pagamento imediato.
   *
   * Usado como fallback quando uma cobrança recorrente falha: em vez de
   * cancelar o mandato, enviamos um Pix manual para o pagador cobrir o ciclo
   * sem quebrar a autorização automática.
   */
  async createOneOffPix(entrada: CriarPixAvulso): Promise<PixAvulsoCriado> {
    const customerId = await this.garantirCliente(entrada.pagador);

    const resposta = await this.http.requisitar<{
      id: string;
      pix?: { payload?: string; encodedImage?: string; expirationDate?: string } | null;
      invoiceUrl?: string | null;
    }>("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: entrada.valorCentavos / 100,
        dueDate: entrada.vencimento,
        description: entrada.descricao,
        externalReference: entrada.referenciaExterna,
      }),
    });

    return {
      externalChargeId: resposta.id,
      qrCodePayload: resposta.pix?.payload ?? null,
      qrCodeImagem: resposta.pix?.encodedImage ?? null,
      linkPagamento: resposta.invoiceUrl ?? null,
      expiraEm: resposta.pix?.expirationDate ?? null,
    };
  }

  /**
   * O Asaas envia o segredo configurado no header `asaas-access-token`.
   *
   * Comparação em tempo constante: comparar segredo com `===` vaza informação
   * pelo tempo de resposta. É barato fazer certo e caro descobrir depois.
   *
   * Sem segredo configurado, RECUSA. Webhook aberto é endpoint que qualquer um
   * posta, e o handler grava no banco.
   */
  verifyWebhook(_raw: string, headers: Headers): boolean {
    const esperado = this.config.webhookSecret;
    if (!esperado) return false;

    const recebido = headers.get("asaas-access-token");
    if (!recebido) return false;

    const a = Buffer.from(recebido);
    const b = Buffer.from(esperado);
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

    const evento = mapearEventoDeWebhook(
      bruto as Parameters<typeof mapearEventoDeWebhook>[0],
    );
    return evento ? [evento] : [];
  }

  /**
   * O pagador pode já existir no Asaas (base veio de sync) ou não (base veio de
   * CSV). Reaproveitar o cliente existente evita duplicar cadastro do lado do
   * gateway — o operador olha o painel do Asaas e não encontra a bagunça que a
   * gente criou.
   */
  private async garantirCliente(pagador: CriarAutorizacao["pagador"]): Promise<string> {
    if (pagador.externalId) return pagador.externalId;

    const busca = await this.http.requisitar<ListaAsaas<{ id: string }>>(
      "/customers",
      { query: { cpfCnpj: pagador.cpfCnpj, limit: 1 } },
    );
    if (busca.data.length > 0) return busca.data[0].id;

    const criado = await this.http.requisitar<{ id: string }>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: pagador.nome,
        cpfCnpj: pagador.cpfCnpj,
        email: pagador.email ?? undefined,
        mobilePhone: pagador.telefoneE164?.replace("+55", "") ?? undefined,
      }),
    });
    return criado.id;
  }
}

function paraFrequenciaAsaas(periodicidade: CriarAutorizacao["periodicidade"]) {
  switch (periodicidade) {
    case "weekly":
      return "WEEKLY";
    case "quarterly":
      return "QUARTERLY";
    case "semiannual":
      return "SEMIANNUALLY";
    case "annual":
      return "YEARLY";
    case "monthly":
    default:
      return "MONTHLY";
  }
}
