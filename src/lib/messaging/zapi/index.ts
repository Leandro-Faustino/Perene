import type {
  MensagemParaEnviar,
  MessagingProvider,
  ResultadoDoEnvio,
} from "../types";

import "server-only";

/**
 * Z-API — primeira implementação de `MessagingProvider`.
 *
 * ATENÇÃO, e isto não é ressalva de rodapé: Z-API é uma ponte NÃO-OFICIAL para
 * o WhatsApp. O número não tem a proteção da categoria Utility da Meta, e o
 * brand book (§3.1) classifica bloqueio de número por denúncia como risco
 * existencial da operação, irreversível na prática.
 *
 * Ela existe aqui para o MVP andar enquanto a aprovação de template Meta corre
 * em paralelo — prazo externo, não controlável. A interface é o que torna essa
 * troca barata depois.
 *
 * Enquanto for esta implementação, duas coisas não são opcionais: o limite
 * diário da onda e o registro de opt-in. São elas que separam operação de
 * roleta.
 */
export class ProvedorZApi implements MessagingProvider {
  readonly nome = "zapi";
  readonly canal = "whatsapp" as const;

  constructor(
    private readonly config: {
      instanceId: string;
      token: string;
      clientToken?: string;
    },
  ) {}

  async enviar(mensagem: MensagemParaEnviar): Promise<ResultadoDoEnvio> {
    const url = `https://api.z-api.io/instances/${this.config.instanceId}/token/${this.config.token}/send-text`;

    let resposta: Response;
    try {
      resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.clientToken
            ? { "Client-Token": this.config.clientToken }
            : {}),
        },
        body: JSON.stringify({
          phone: mensagem.para.replace(/\D/g, ""),
          message: mensagem.corpo,
        }),
        cache: "no-store",
      });
    } catch {
      return {
        ok: false,
        erro: "Não conseguimos falar com o provedor de WhatsApp.",
        recuperavel: true,
      };
    }

    if (!resposta.ok) {
      const corpo = await resposta.text().catch(() => "");

      // 4xx é problema do dado (número inválido, instância desconectada) e
      // repetir não conserta. 5xx é instabilidade e vale retentar. Retentar
      // para número inválido queima a fila e não entrega nada.
      const recuperavel = resposta.status >= 500 || resposta.status === 429;

      return {
        ok: false,
        erro:
          resposta.status === 400
            ? "Número de WhatsApp inválido ou sem conta."
            : `Provedor recusou o envio (${resposta.status}). ${corpo.slice(0, 120)}`,
        recuperavel,
      };
    }

    const dados = (await resposta.json().catch(() => ({}))) as {
      messageId?: string;
      id?: string;
    };

    return { ok: true, idExterno: dados.messageId ?? dados.id };
  }
}

export function criarProvedorDeMensagem(): MessagingProvider {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;

  if (!instanceId || !token) {
    throw new Error(
      "ZAPI_INSTANCE_ID e ZAPI_TOKEN são obrigatórias para enviar WhatsApp.",
    );
  }

  return new ProvedorZApi({
    instanceId,
    token,
    clientToken: process.env.ZAPI_CLIENT_TOKEN,
  });
}
