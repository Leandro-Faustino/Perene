/**
 * Canal de mensagem.
 *
 * A interface existe para que a troca de provedor seja uma adição, não uma
 * reforma — e essa troca É esperada. O `PLAN.md` começa com Z-API, que é ponte
 * não-oficial, enquanto o brand book (§3.1) classifica bloqueio de número como
 * risco existencial e manda a aprovação de template Meta na categoria Utility
 * começar cedo. Quando a Cloud API oficial estiver aprovada, o que muda é uma
 * linha na fábrica.
 */

export type CanalDeMensagem = "whatsapp" | "email" | "sms";

export interface MensagemParaEnviar {
  para: string;
  corpo: string;
  /** Nome do template aprovado na Meta, quando o provedor exigir. */
  templateName?: string;
  variaveis?: Record<string, string>;
}

export interface ResultadoDoEnvio {
  ok: boolean;
  idExterno?: string;
  /** Mensagem em português, já pronta para a linha do tempo do contrato. */
  erro?: string;
  /** Vale tentar de novo? Número inválido, não. Instabilidade, sim. */
  recuperavel?: boolean;
}

export interface MessagingProvider {
  readonly nome: string;
  readonly canal: CanalDeMensagem;
  enviar(mensagem: MensagemParaEnviar): Promise<ResultadoDoEnvio>;
}
