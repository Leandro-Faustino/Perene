import { ErroDeGateway } from "../types";

const BASES = {
  sandbox: "https://api-sandbox.asaas.com/v3",
  production: "https://api.asaas.com/v3",
} as const;

export type Ambiente = keyof typeof BASES;

export interface ConfigAsaas {
  apiKey: string;
  environment: Ambiente;
  webhookSecret?: string | null;
}

/**
 * Cliente HTTP do Asaas.
 *
 * Duas responsabilidades e nenhuma outra: falar HTTP e traduzir falha em
 * mensagem que o operador entende. Mapeamento de domínio é problema do
 * `mappers.ts`.
 */
export class ClienteAsaas {
  constructor(private readonly config: ConfigAsaas) {}

  private get base() {
    return BASES[this.config.environment];
  }

  async requisitar<T>(
    caminho: string,
    init: RequestInit & { query?: Record<string, string | number | undefined> } = {},
  ): Promise<T> {
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
          access_token: this.config.apiKey,
          "Content-Type": "application/json",
          ...resto.headers,
        },
        // O adapter roda em job e em Server Action; nunca queremos cache aqui.
        cache: "no-store",
      });
    } catch (causa) {
      throw new ErroDeGateway(
        "Não conseguimos falar com o Asaas agora. Verifique sua conexão e tente de novo.",
        { provider: "asaas", corpo: String(causa) },
      );
    }

    if (!resposta.ok) {
      throw new ErroDeGateway(mensagemDeErro(resposta.status), {
        provider: "asaas",
        status: resposta.status,
        corpo: await resposta.text().catch(() => null),
      });
    }

    // 204 e afins.
    if (resposta.status === 204) return undefined as T;
    return (await resposta.json()) as T;
  }
}

/**
 * Erro traduzido. O operador que colou a chave errada precisa saber que colou
 * a chave errada — não receber "401 Unauthorized".
 */
function mensagemDeErro(status: number): string {
  switch (status) {
    case 401:
    case 403:
      return "A chave de API não foi aceita pelo Asaas. Confira se copiou a chave inteira e se ela é do ambiente certo (sandbox ou produção).";
    case 404:
      return "O Asaas não encontrou esse registro. Ele pode ter sido removido de lá.";
    case 429:
      return "O Asaas está limitando as requisições no momento. Vamos tentar de novo em instantes.";
    default:
      if (status >= 500) {
        return "O Asaas está fora do ar no momento. Nada foi perdido — vamos tentar de novo automaticamente.";
      }
      return "O Asaas recusou a requisição. Se continuar, fale com a gente.";
  }
}
