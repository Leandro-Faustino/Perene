import { ErroDeGateway } from "../types";

/**
 * URLs da API Pix da Efí Bank (ex-Gerencianet).
 *
 * A Efí tem dois módulos com bases distintas:
 *   - Pix:  o módulo que usamos (Pix Automático, cob, cobsv)
 *   - GN:   cobranças legacy (boleto, cartão) — não usamos
 *
 * Homologação (sandbox): pix-h.api.efipay.com.br
 * Produção:             pix.api.efipay.com.br
 *
 * Auth: OAuth2 client_credentials — POST /oauth/token com Basic Auth.
 * O access_token expira em 3600 s; renovamos 60 s antes para segurança.
 *
 * NOTA SOBRE mTLS:
 * Em produção, a Efí exige certificado de client (.p12) para endpoints Pix.
 * O Node.js suporta mTLS via `https.Agent` com pfx/passphrase — mas isto
 * exigiria armazenar o certificado criptografado por org (escopo de Fase 4).
 * Em sandbox, mTLS é dispensado; é suficiente para desenvolver e testar.
 * TODO: ao habilitar produção, injetar `agent` com certificado via ConfigEfi.
 *
 * FORMATO DA CREDENCIAL (campo api_key_encrypted no banco):
 * "client_id:client_secret" — o separador é o primeiro ":".
 * Exemplo: "Client_Id_xxx:Client_Secret_yyy"
 * O Pix key da organização vem de GET /v2/gn/infoconta e é cacheado.
 */

const BASES: Record<"sandbox" | "production", string> = {
  sandbox: "https://pix-h.api.efipay.com.br",
  production: "https://pix.api.efipay.com.br",
};

export interface ConfigEfi {
  /** "client_id:client_secret" — concatenado com ":" como separador. */
  apiKey: string;
  environment: "sandbox" | "production";
  /**
   * Segredo compartilhado configurado no dashboard da Efí para validar
   * webhooks via header `x-hmac-sha256`. Opcional mas fortemente recomendado.
   */
  webhookSecret?: string | null;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

/**
 * Cliente HTTP da Efí Bank.
 *
 * Responsabilidades:
 * 1. Gerenciar o ciclo de vida do access_token (OAuth2 client_credentials).
 * 2. Traduzir erros HTTP em mensagens que o operador entende.
 * 3. Nada mais — mapeamento de domínio vive em mappers.ts.
 */
export class ClienteEfi {
  private tokenCache: TokenCache | null = null;

  constructor(readonly config: ConfigEfi) {}

  private get base() {
    return BASES[this.config.environment];
  }

  /** Divide "client_id:client_secret" preservando ":" no secret, se houver. */
  parsearCredenciais(): { clientId: string; clientSecret: string } {
    const idx = this.config.apiKey.indexOf(":");
    if (idx === -1) {
      throw new ErroDeGateway(
        "Credencial Efí inválida. O formato esperado é 'Client_Id:Client_Secret'.",
        { provider: "efi" },
      );
    }
    return {
      clientId: this.config.apiKey.slice(0, idx),
      clientSecret: this.config.apiKey.slice(idx + 1),
    };
  }

  /**
   * Retorna um access_token válido, renovando se expirado.
   * Token é mantido em memória; instâncias novas buscam um novo token —
   * aceitável porque `ClienteEfi` é criado uma vez por job/request.
   */
  async obterToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.accessToken;
    }

    const { clientId, clientSecret } = this.parsearCredenciais();
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    let resposta: Response;
    try {
      resposta = await fetch(`${this.base}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grant_type: "client_credentials" }),
        cache: "no-store",
      });
    } catch (causa) {
      throw new ErroDeGateway(
        "Não conseguimos falar com a Efí Bank agora. Verifique sua conexão e tente de novo.",
        { provider: "efi", corpo: String(causa) },
      );
    }

    if (!resposta.ok) {
      throw new ErroDeGateway(mensagemDeErro(resposta.status, "autenticação"), {
        provider: "efi",
        status: resposta.status,
        corpo: await resposta.text().catch(() => null),
      });
    }

    const dados = (await resposta.json()) as {
      access_token: string;
      expires_in: number;
    };

    // Renova 60 s antes do prazo para não arriscar expirar no meio de uma chamada.
    this.tokenCache = {
      accessToken: dados.access_token,
      expiresAt: Date.now() + (dados.expires_in - 60) * 1000,
    };

    return dados.access_token;
  }

  async requisitar<T>(
    caminho: string,
    init: RequestInit & { query?: Record<string, string | number | undefined> } = {},
  ): Promise<T> {
    const token = await this.obterToken();
    const { query, ...resto } = init;

    const url = new URL(`${this.base}${caminho}`);
    for (const [chave, valor] of Object.entries(query ?? {})) {
      if (valor !== undefined) url.searchParams.set(chave, String(valor));
    }

    let resposta: Response;
    try {
      resposta = await fetch(url, {
        ...resto,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...resto.headers,
        },
        cache: "no-store",
      });
    } catch (causa) {
      throw new ErroDeGateway(
        "Não conseguimos falar com a Efí Bank agora. Verifique sua conexão e tente de novo.",
        { provider: "efi", corpo: String(causa) },
      );
    }

    if (!resposta.ok) {
      throw new ErroDeGateway(mensagemDeErro(resposta.status, caminho), {
        provider: "efi",
        status: resposta.status,
        corpo: await resposta.text().catch(() => null),
      });
    }

    if (resposta.status === 204) return undefined as T;
    return (await resposta.json()) as T;
  }
}

function mensagemDeErro(status: number, contexto: string): string {
  switch (status) {
    case 401:
    case 403:
      return "A credencial Efí não foi aceita. Confira o Client_Id e o Client_Secret — copie exatamente como aparecem no portal de desenvolvedor da Efí.";
    case 404:
      return `A Efí não encontrou o registro solicitado (${contexto}). Ele pode ter sido removido ou o id está incorreto.`;
    case 422:
      return "A Efí recusou os dados enviados. Confira CPF, valor e data de vencimento.";
    case 429:
      return "A Efí está limitando as requisições no momento. Vamos tentar de novo em instantes.";
    default:
      if (status >= 500) {
        return "A Efí está fora do ar no momento. Nada foi perdido — vamos tentar de novo automaticamente.";
      }
      return "A Efí recusou a requisição. Se continuar, fale com a gente.";
  }
}
