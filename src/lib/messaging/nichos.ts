import { formatarReais } from "@/lib/utils";

/**
 * Packs de template por segmento de mercado (Fase 3B).
 *
 * Cada nicho tem:
 * - `rotuloDoPagador`: como a organização chama o pagador ("aluno", "paciente"…)
 * - `rotuloServico`:  o que está sendo cobrado ("mensalidade", "taxa condominial"…)
 * - Templates completos para os 6 momentos da régua
 *
 * A diferença entre os nichos não é apenas trocar "aluno" por "paciente" —
 * o tom, o argumento e o contexto mudam para respeitar o vínculo que já existe
 * entre a organização e quem paga (§4.2 HUMANO, §4.3 VOCABULÁRIO).
 *
 * Hierarquia de uso:
 *   1. Template custom da org no banco (message_templates)  ← tem prioridade
 *   2. Pack deste arquivo                                    ← este arquivo
 *   3. Template genérico em templates.ts                    ← fallback universal
 */

export type Nicho =
  | "academia"
  | "clinica"
  | "condominio"
  | "escola"
  | "clube"
  | "outro";

export interface DadosDoNicho {
  pagador: string;
  organizacao: string;
  valorCentavos: number;
  link: string;
}

export interface DadosDoAvisoPreNicho {
  pagador: string;
  organizacao: string;
  valorCentavos: number;
  dataDebito: string;
}

export interface DadosDoPixAvulsoNicho {
  pagador: string;
  organizacao: string;
  valorCentavos: number;
  cycleRef: string;
  link: string;
}

export interface PackDeNicho {
  rotuloDoPagador: string;
  rotuloServico: string;
  /** Rótulo legível para mostrar na UI de seleção. */
  rotulo: string;
  /** Exemplo: "Academia Body & Arte". */
  exemploDaOrg: string;
  convite_d0: (d: DadosDoNicho) => string;
  convite_d2: (d: DadosDoNicho) => string;
  convite_d5: (d: DadosDoNicho) => string;
  convite_d10: (d: DadosDoNicho) => string;
  aviso_pre_cobranca: (d: DadosDoAvisoPreNicho) => string;
  pix_avulso: (d: DadosDoPixAvulsoNicho) => string;
}

const PRIMEIRO_NOME = (nome: string) => nome.trim().split(/\s+/)[0];

const mesExtenso = (cycleRef: string) => {
  const [ano, mes] = cycleRef.split("-");
  return new Date(`${ano}-${mes}-01`).toLocaleString("pt-BR", { month: "long" });
};

// -----------------------------------------------------------------------------
// Academia
// -----------------------------------------------------------------------------

const academia: PackDeNicho = {
  rotuloDoPagador: "aluno",
  rotuloServico: "mensalidade",
  rotulo: "Academia / Studio",
  exemploDaOrg: "Academia Body & Arte",

  convite_d0: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `Vamos facilitar o pagamento da sua mensalidade de ${formatarReais(d.valorCentavos)}: ` +
    `com o Pix Automático, você autoriza uma vez e o débito entra sozinho todo mês — ` +
    `sem precisar lembrar, sem boleto vencido.\n\n` +
    `É rápido (menos de 1 minuto no app do banco): ${d.link}\n\n` +
    `Qualquer dúvida, é só responder aqui.`,

  convite_d2: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Passando pelo lembrete da mensalidade da ${d.organizacao}.\n\n` +
    `Autorize o Pix Automático e não pense mais nisso todo mês: ${d.link}`,

  convite_d5: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}. Sobre o Pix Automático da ${d.organizacao}:\n\n` +
    `Funciona como débito em conta, mas pelo Pix — você define um valor máximo no app do seu banco, ` +
    `e nada acima disso pode ser debitado sem nova autorização. Pode cancelar quando quiser, pelo próprio banco.\n\n` +
    `Valor da mensalidade: ${formatarReais(d.valorCentavos)}\n` +
    `${d.link}`,

  convite_d10: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Última mensagem sobre o Pix Automático da ${d.organizacao}.\n\n` +
    `Se quiser autorizar e deixar a mensalidade no automático: ${d.link}\n\n` +
    `Se preferir continuar pagando como está, tudo bem — não vamos insistir mais.`,

  aviso_pre_cobranca: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `Aviso rápido: a mensalidade de ${formatarReais(d.valorCentavos)} será debitada automaticamente ` +
    `no dia ${d.dataDebito}. Você não precisa fazer nada — é só manter o saldo disponível.\n\n` +
    `Qualquer dúvida, estamos aqui.`,

  pix_avulso: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `O débito automático da mensalidade de ${formatarReais(d.valorCentavos)} referente a ${mesExtenso(d.cycleRef)} ` +
    `não passou desta vez. Sem problema — segue um Pix para quitar este mês:\n\n` +
    `${d.link}\n\n` +
    `Nos próximos meses o débito vai continuar normalmente. Qualquer dúvida, é só chamar aqui.`,
};

// -----------------------------------------------------------------------------
// Clínica / Consultório
// -----------------------------------------------------------------------------

const clinica: PackDeNicho = {
  rotuloDoPagador: "paciente",
  rotuloServico: "plano",
  rotulo: "Clínica / Consultório",
  exemploDaOrg: "Clínica Saúde Plena",

  convite_d0: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `Estamos migrando os pagamentos do plano para Pix Automático — ` +
    `você autoriza uma vez e a cobrança de ${formatarReais(d.valorCentavos)} é feita automaticamente, ` +
    `sem precisar se preocupar antes de cada atendimento.\n\n` +
    `Clique para autorizar no app do seu banco (menos de 1 minuto): ${d.link}\n\n` +
    `Dúvidas? É só responder aqui.`,

  convite_d2: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Passando para lembrar da autorização do Pix Automático da ${d.organizacao}.\n\n` +
    `Você autoriza uma vez e não pensa mais em pagamento antes dos atendimentos: ${d.link}`,

  convite_d5: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}. Uma dúvida comum sobre o Pix Automático da ${d.organizacao}:\n\n` +
    `"Posso cancelar se precisar?" — Sim. O cancelamento é feito pelo próprio app do seu banco, ` +
    `a qualquer momento, sem precisar falar com a clínica.\n\n` +
    `Valor mensal: ${formatarReais(d.valorCentavos)} · Autorizar: ${d.link}`,

  convite_d10: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Este é o último lembrete sobre o Pix Automático da ${d.organizacao}.\n\n` +
    `Se quiser autorizar: ${d.link}\n\n` +
    `Se preferir manter a forma de pagamento atual, tudo bem. Não vamos enviar mais mensagens sobre isso.`,

  aviso_pre_cobranca: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `Informamos que a cobrança do plano de ${formatarReais(d.valorCentavos)} ` +
    `está programada para o dia ${d.dataDebito}. O débito será automático — nenhuma ação necessária da sua parte.\n\n` +
    `Dúvidas, estamos à disposição.`,

  pix_avulso: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `O débito automático do plano de ${formatarReais(d.valorCentavos)} ` +
    `referente a ${mesExtenso(d.cycleRef)} não foi processado. ` +
    `Enviamos um Pix para regularizar este mês:\n\n` +
    `${d.link}\n\n` +
    `Os próximos meses continuam no automático. Qualquer dúvida, fale conosco.`,
};

// -----------------------------------------------------------------------------
// Condomínio
// -----------------------------------------------------------------------------

const condominio: PackDeNicho = {
  rotuloDoPagador: "morador",
  rotuloServico: "taxa condominial",
  rotulo: "Condomínio / Administradora",
  exemploDaOrg: "Condomínio Vista Verde",

  convite_d0: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é do ${d.organizacao}.\n\n` +
    `Estamos implantando o Pix Automático para pagamento da taxa condominial de ${formatarReais(d.valorCentavos)}. ` +
    `Com ele, o débito entra automaticamente todo mês — sem boleto, sem atraso, sem multa.\n\n` +
    `Para ativar, é só autorizar pelo app do seu banco: ${d.link}\n\n` +
    `Qualquer dúvida, pode responder aqui.`,

  convite_d2: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Lembrando da autorização do Pix Automático do ${d.organizacao}.\n\n` +
    `Autorize uma vez e a taxa condominial de ${formatarReais(d.valorCentavos)} entra sozinha todo mês: ${d.link}`,

  convite_d5: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}. Sobre o Pix Automático do ${d.organizacao}:\n\n` +
    `Você define um valor máximo no app do banco — nada acima disso é debitado sem nova autorização. ` +
    `Cancelamento a qualquer momento, pelo próprio banco, sem burocracia.\n\n` +
    `Taxa: ${formatarReais(d.valorCentavos)} · Autorizar: ${d.link}`,

  convite_d10: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Último aviso sobre o Pix Automático do ${d.organizacao}.\n\n` +
    `Se quiser evitar boleto todo mês: ${d.link}\n\n` +
    `Se preferir continuar pagando como está, tudo bem. Não enviaremos mais mensagens sobre isso.`,

  aviso_pre_cobranca: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é do ${d.organizacao}.\n\n` +
    `A taxa condominial de ${formatarReais(d.valorCentavos)} será debitada automaticamente ` +
    `no dia ${d.dataDebito}. Nenhuma ação necessária da sua parte.\n\n` +
    `Dúvidas, estamos à disposição.`,

  pix_avulso: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é do ${d.organizacao}.\n\n` +
    `O débito automático da taxa condominial de ${formatarReais(d.valorCentavos)} ` +
    `referente a ${mesExtenso(d.cycleRef)} não passou. Para regularizar este mês:\n\n` +
    `${d.link}\n\n` +
    `Nos próximos meses o débito automático vai continuar normalmente.`,
};

// -----------------------------------------------------------------------------
// Escola / Curso
// -----------------------------------------------------------------------------

const escola: PackDeNicho = {
  rotuloDoPagador: "aluno",
  rotuloServico: "mensalidade escolar",
  rotulo: "Escola / Curso",
  exemploDaOrg: "Escola de Idiomas Top",

  convite_d0: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `Para facilitar o pagamento da mensalidade escolar de ${formatarReais(d.valorCentavos)}, ` +
    `estamos adotando o Pix Automático: você autoriza uma vez e o valor é debitado automaticamente ` +
    `todo mês, sem precisar se lembrar.\n\n` +
    `Autorize pelo app do seu banco: ${d.link}\n\n` +
    `Dúvidas? Responda aqui.`,

  convite_d2: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Lembrete da mensalidade da ${d.organizacao}.\n\n` +
    `Autorize o Pix Automático e deixe o pagamento no piloto automático: ${d.link}`,

  convite_d5: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}. Sobre o Pix Automático da ${d.organizacao}:\n\n` +
    `Você autoriza um valor máximo — nada acima disso pode ser cobrado sem nova autorização. ` +
    `E dá para cancelar pelo app do banco quando quiser.\n\n` +
    `Mensalidade: ${formatarReais(d.valorCentavos)} · ${d.link}`,

  convite_d10: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Último lembrete sobre o Pix Automático da ${d.organizacao}.\n\n` +
    `Se quiser autorizar: ${d.link}\n\n` +
    `Se preferir continuar como está, sem problema. Esta é a última mensagem sobre o assunto.`,

  aviso_pre_cobranca: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `A mensalidade escolar de ${formatarReais(d.valorCentavos)} será debitada ` +
    `automaticamente no dia ${d.dataDebito}. Você não precisa fazer nada.\n\n` +
    `Dúvidas, estamos aqui.`,

  pix_avulso: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `O débito automático da mensalidade de ${formatarReais(d.valorCentavos)} ` +
    `de ${mesExtenso(d.cycleRef)} não passou. Enviamos um Pix para quitar este mês:\n\n` +
    `${d.link}\n\n` +
    `Os próximos meses continuam no automático normalmente.`,
};

// -----------------------------------------------------------------------------
// Clube / Associação
// -----------------------------------------------------------------------------

const clube: PackDeNicho = {
  rotuloDoPagador: "associado",
  rotuloServico: "mensalidade",
  rotulo: "Clube / Associação",
  exemploDaOrg: "Clube Atlético Minas",

  convite_d0: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é do ${d.organizacao}.\n\n` +
    `Estamos simplificando o pagamento da mensalidade de ${formatarReais(d.valorCentavos)} ` +
    `com o Pix Automático — você autoriza uma vez e o débito entra sozinho todo mês.\n\n` +
    `Autorize pelo app do seu banco (rápido, menos de 1 minuto): ${d.link}\n\n` +
    `Qualquer dúvida, pode chamar aqui.`,

  convite_d2: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Passando para lembrar da autorização do Pix Automático do ${d.organizacao}.\n\n` +
    `Autorize e nunca mais pense em mensalidade todo mês: ${d.link}`,

  convite_d5: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}. Sobre o Pix Automático do ${d.organizacao}:\n\n` +
    `Funciona como um débito automático pelo Pix — você define um valor máximo no banco ` +
    `e só o valor combinado é debitado. Cancelamento pelo próprio app, sem burocracia.\n\n` +
    `Mensalidade: ${formatarReais(d.valorCentavos)} · ${d.link}`,

  convite_d10: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Última mensagem sobre o Pix Automático do ${d.organizacao}.\n\n` +
    `Se quiser deixar a mensalidade no automático: ${d.link}\n\n` +
    `Se preferir continuar como está, tudo bem — não vamos mais incomodar sobre isso.`,

  aviso_pre_cobranca: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é do ${d.organizacao}.\n\n` +
    `A mensalidade de ${formatarReais(d.valorCentavos)} será debitada automaticamente ` +
    `no dia ${d.dataDebito}. Não precisa fazer nada.\n\n` +
    `Dúvidas, estamos à disposição.`,

  pix_avulso: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é do ${d.organizacao}.\n\n` +
    `O débito automático da mensalidade de ${formatarReais(d.valorCentavos)} ` +
    `referente a ${mesExtenso(d.cycleRef)} não passou desta vez. Para quitar este mês:\n\n` +
    `${d.link}\n\n` +
    `Os próximos meses seguem no automático normalmente. Qualquer dúvida, chama aqui.`,
};

// -----------------------------------------------------------------------------
// Outro (genérico + rótulos neutros)
// -----------------------------------------------------------------------------

const outro: PackDeNicho = {
  rotuloDoPagador: "cliente",
  rotuloServico: "serviço",
  rotulo: "Outro",
  exemploDaOrg: "Minha Empresa",

  convite_d0: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `Estamos migrando os pagamentos para Pix Automático — ` +
    `você autoriza uma vez e a cobrança de ${formatarReais(d.valorCentavos)} é feita automaticamente todo mês.\n\n` +
    `Autorize pelo app do seu banco: ${d.link}\n\n` +
    `Qualquer dúvida, é só responder aqui.`,

  convite_d2: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Lembrando da autorização do Pix Automático da ${d.organizacao}.\n\n` +
    `Você autoriza uma vez e não precisa lembrar de pagar todo mês: ${d.link}`,

  convite_d5: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}. Sobre o Pix Automático da ${d.organizacao}:\n\n` +
    `Você define um valor máximo no app do banco — nada acima pode ser debitado sem nova autorização. ` +
    `Cancelamento a qualquer momento, pelo próprio banco.\n\n` +
    `Valor: ${formatarReais(d.valorCentavos)} · ${d.link}`,

  convite_d10: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Este é o último lembrete sobre o Pix Automático da ${d.organizacao}.\n\n` +
    `Se quiser autorizar: ${d.link}\n\n` +
    `Se preferir continuar como está, sem problema. Não vamos mais enviar mensagens sobre isso.`,

  aviso_pre_cobranca: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `Aviso: a cobrança de ${formatarReais(d.valorCentavos)} será debitada automaticamente ` +
    `no dia ${d.dataDebito}. Nenhuma ação necessária.\n\n` +
    `Dúvidas, estamos aqui.`,

  pix_avulso: (d) =>
    `Oi, ${PRIMEIRO_NOME(d.pagador)}! Aqui é da ${d.organizacao}.\n\n` +
    `O débito automático de ${formatarReais(d.valorCentavos)} ` +
    `referente a ${mesExtenso(d.cycleRef)} não passou. Para quitar este mês:\n\n` +
    `${d.link}\n\n` +
    `Os próximos meses continuam no automático normalmente.`,
};

// -----------------------------------------------------------------------------
// Registry
// -----------------------------------------------------------------------------

export const NICHOS: Record<Nicho, PackDeNicho> = {
  academia,
  clinica,
  condominio,
  escola,
  clube,
  outro,
};

export type ChaveDeTemplateDeNicho =
  | "convite_d0"
  | "convite_d2"
  | "convite_d5"
  | "convite_d10"
  | "aviso_pre_cobranca"
  | "pix_avulso";

/**
 * Monta a mensagem do nicho para uma chave de régua.
 * Retorna `null` se o nicho não reconhecido (não deve acontecer com TypeScript
 * estrito, mas defensivo para chamadas via dado do banco).
 */
export function montarMensagemDeNicho(
  nicho: string,
  chave: ChaveDeTemplateDeNicho,
  dados: DadosDoNicho | DadosDoAvisoPreNicho | DadosDoPixAvulsoNicho,
): string | null {
  const pack = NICHOS[nicho as Nicho];
  if (!pack) return null;

  switch (chave) {
    case "convite_d0":
    case "convite_d2":
    case "convite_d5":
    case "convite_d10":
      return pack[chave](dados as DadosDoNicho);
    case "aviso_pre_cobranca":
      return pack.aviso_pre_cobranca(dados as DadosDoAvisoPreNicho);
    case "pix_avulso":
      return pack.pix_avulso(dados as DadosDoPixAvulsoNicho);
  }
}
