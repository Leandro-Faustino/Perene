"use server";

import { supabaseServidor } from "@/lib/supabase/server";
import { exigirOrgAtual } from "@/lib/clerk/user-service";
import {
  importarCsv,
  type LinhaImportada,
  type ResultadoDaImportacao,
} from "@/lib/domain/importacao";

/**
 * A importação tem duas etapas de propósito: PRÉ-VISUALIZAR e só depois GRAVAR.
 *
 * Uma base importada errado não é um erro que se desfaz com um botão — vira
 * contrato duplicado, convite mandado para a pessoa errada, número de
 * diagnóstico que não bate. O operador precisa ver o que vai entrar antes de
 * entrar, e precisa decidir os duplicados ele mesmo (RF-23).
 */

export interface EstadoDaAnalise {
  ok: boolean;
  mensagem?: string;
  resultado?: ResultadoDaImportacao;
}

export async function analisarArquivo(
  _anterior: EstadoDaAnalise | null,
  formulario: FormData,
): Promise<EstadoDaAnalise> {
  await exigirOrgAtual();

  const arquivo = formulario.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, mensagem: "Escolha um arquivo CSV para continuar." };
  }

  // 10 MB cobre com folga uma base de dezenas de milhares de contratos e evita
  // que um arquivo errado (um vídeo, um zip) consuma memória do servidor.
  if (arquivo.size > 10 * 1024 * 1024) {
    return {
      ok: false,
      mensagem: "O arquivo passou de 10 MB. Exporte só as colunas de cadastro e cobrança.",
    };
  }

  const texto = await arquivo.text();
  return { ok: true, resultado: importarCsv(texto) };
}

export interface EstadoDaGravacao {
  ok: boolean;
  mensagem: string;
  importados?: number;
}

/**
 * Grava pagadores e contratos.
 *
 * Sem cliente service-role: `payers` e `contracts` têm policy por organização,
 * então a própria sessão do operador escreve — e só na base dele. O `org_id`
 * vem de uma consulta sob RLS, nunca do formulário: aceitar `org_id` vindo do
 * cliente seria abrir a porta para escrever na organização de outra pessoa.
 */
export async function gravarImportacao(
  linhas: LinhaImportada[],
): Promise<EstadoDaGravacao> {
  await exigirOrgAtual();

  if (linhas.length === 0) {
    return { ok: false, mensagem: "Nenhuma linha selecionada para importar." };
  }

  const supa = supabaseServidor();

  const { data: organizacao, error: erroOrg } = await supa
    .from("organizations")
    .select("id")
    .maybeSingle();

  if (erroOrg || !organizacao) {
    return {
      ok: false,
      mensagem: "Não encontramos sua organização. Volte ao passo 1.",
    };
  }

  const { data: pagadores, error: erroPagadores } = await supa
    .from("payers")
    .insert(
      linhas.map((l) => ({
        org_id: organizacao.id,
        name: l.nome,
        email: l.email,
        phone_e164: l.telefoneE164,
        tax_id: l.cpf,
      })),
    )
    .select("id");

  if (erroPagadores || !pagadores) {
    return {
      ok: false,
      mensagem: `Não conseguimos gravar os cadastros: ${erroPagadores?.message ?? "erro desconhecido"}`,
    };
  }

  const { error: erroContratos } = await supa.from("contracts").insert(
    linhas.map((l, i) => ({
      org_id: organizacao.id,
      payer_id: pagadores[i].id,
      amount_cents: l.valorCentavos,
      frequency: l.periodicidade,
      due_day: l.diaVencimento,
      current_method: l.metodo,
      status: "active",
    })),
  );

  if (erroContratos) {
    // Os pagadores já entraram. Dizemos o que aconteceu em vez de fingir que
    // não houve nada — o operador precisa saber que a base está pela metade.
    return {
      ok: false,
      mensagem: `Os cadastros entraram, mas os contratos não: ${erroContratos.message}. Fale com a gente antes de importar de novo, para não duplicar.`,
    };
  }

  return {
    ok: true,
    mensagem: "Base importada.",
    importados: linhas.length,
  };
}
