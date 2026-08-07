import { supabaseAdmin } from "@/lib/supabase/admin";
import type { CanalDeMensagem } from "./types";
import {
  montarMensagemDeNicho,
  type ChaveDeTemplateDeNicho,
  type DadosDoNicho,
  type DadosDoAvisoPreNicho,
  type DadosDoPixAvulsoNicho,
} from "./nichos";

import "server-only";

/**
 * Variáveis disponíveis nos templates editáveis pelo operador.
 *
 * Usar chaves simples em vez de Mustache ou Handlebars: o editor é uma
 * textarea, não um IDE, e a curva de aprendizado de {{{triple}}} vs {{double}}
 * vs {simple} é desnecessária para um formulário de cobrança.
 *
 * Convenção: sempre minúsculas, sem espaço. Se mudar, mudar o helper de
 * substituição e o texto de ajuda na tela de configurações.
 */
export interface VariaveisDoTemplate {
  /** Primeiro nome do pagador — mesma regra das mensagens padrão. */
  pagador?: string;
  /** Nome da organização — assina todas as mensagens. */
  organizacao?: string;
  /** Valor formatado em reais, ex: "R$ 150,00". */
  valor?: string;
  /** Link de autorização ou pagamento. */
  link?: string;
  /** Data do débito por extenso, ex: "15 de setembro". */
  dataDebito?: string;
  /** Mês de referência por extenso, ex: "setembro". */
  mesRef?: string;
}

/** Primeiro nome: a régua usa sempre o primeiro nome (§4.3 HUMANO). */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/**
 * Substitui as variáveis {chave} no corpo do template.
 *
 * Variáveis não encontradas nas vars ficam intactas — assim o operador
 * percebe o erro na tela de configurações antes de o pagador perceber.
 */
export function aplicarVariaveis(
  corpo: string,
  vars: VariaveisDoTemplate,
): string {
  return corpo
    .replace(/{pagador}/g, vars.pagador ?? "{pagador}")
    .replace(/{organizacao}/g, vars.organizacao ?? "{organizacao}")
    .replace(/{valor}/g, vars.valor ?? "{valor}")
    .replace(/{link}/g, vars.link ?? "{link}")
    .replace(/{dataDebito}/g, vars.dataDebito ?? "{dataDebito}")
    .replace(/{mesRef}/g, vars.mesRef ?? "{mesRef}");
}

/**
 * Busca o template personalizado da organização no banco.
 *
 * Retorna `null` se a org não customizou esse template — o caller deve
 * cair no texto padrão hard-coded.
 */
export async function buscarTemplateCustom(
  orgId: string,
  key: string,
  canal: CanalDeMensagem = "whatsapp",
): Promise<string | null> {
  const { data } = await supabaseAdmin()
    .from("message_templates")
    .select("body")
    .eq("org_id", orgId)
    .eq("key", key)
    .eq("channel", canal)
    .maybeSingle();

  return data?.body ?? null;
}

/**
 * Resolve o corpo final da mensagem seguindo a hierarquia de prioridade:
 *   1. Template customizado pela org no banco  (message_templates)
 *   2. Pack do nicho  (nichos.ts — texto por segmento)
 *   3. Fallback: retorna null → caller usa template genérico de templates.ts
 *
 * Centraliza aqui para que send-cadence-step, send-message e qualquer handler
 * futuro não precisem replicar a lógica de resolução.
 */
export async function resolverCorpoDoTemplate(opts: {
  orgId: string;
  nicho: string | null;
  chave: ChaveDeTemplateDeNicho;
  canal?: CanalDeMensagem;
  dadosDeNicho: DadosDoNicho | DadosDoAvisoPreNicho | DadosDoPixAvulsoNicho;
  variaveisCustom: VariaveisDoTemplate;
}): Promise<string | null> {
  const { orgId, nicho, chave, canal = "whatsapp", dadosDeNicho, variaveisCustom } = opts;

  // 1. Custom da org
  const custom = await buscarTemplateCustom(orgId, chave, canal);
  if (custom) return aplicarVariaveis(custom, variaveisCustom);

  // 2. Nicho
  if (nicho) {
    const texto = montarMensagemDeNicho(nicho, chave, dadosDeNicho);
    if (texto) return texto;
  }

  // 3. Caller usa template genérico
  return null;
}
