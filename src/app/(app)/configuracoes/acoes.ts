"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { supabaseServidor } from "@/lib/supabase/server";
import { exigirOrgAtual } from "@/lib/clerk/user-service";

const METODOS = [
  "card",
  "boleto",
  "pix_manual",
  "debito_automatico",
  "pix_automatico",
] as const;

export interface EstadoDasTarifas {
  ok: boolean;
  mensagem: string;
}

/**
 * Salva as tarifas reais da organização.
 *
 * É a tela que torna o diagnóstico honesto. Enquanto o operador não informa a
 * tarifa dele, o cálculo roda sobre faixas de mercado — e o brand book exige
 * que todo número seja reproduzível pelo cliente (§4.2). Quem não consegue
 * refazer a conta com os próprios números não confia nela, e o diagnóstico é o
 * produto de entrada inteiro.
 *
 * As tarifas da organização convivem com as de referência: `carregarDiagnostico`
 * prefere as dela quando existem.
 */
export async function salvarTarifas(
  _anterior: EstadoDasTarifas | null,
  formulario: FormData,
): Promise<EstadoDasTarifas> {
  const clerkOrgId = await exigirOrgAtual();
  const supa = supabaseServidor();

  const { data: organizacao } = await supa
    .from("organizations")
    .select("id")
    .eq("clerk_org_id", clerkOrgId)
    .maybeSingle();

  if (!organizacao) {
    return { ok: false, mensagem: "Organização não encontrada." };
  }

  const Numero = z.coerce.number().min(0);
  const linhas: {
    org_id: string;
    method: string;
    percent_bps: number;
    fixed_cents: number;
    source: string;
  }[] = [];

  for (const metodo of METODOS) {
    const percentual = formulario.get(`${metodo}_percentual`);
    const fixo = formulario.get(`${metodo}_fixo`);

    // Campo em branco significa "não mexi": mantemos a referência do sistema
    // em vez de gravar zero, que faria o método sumir do custo em silêncio.
    if (
      (percentual === null || percentual === "") &&
      (fixo === null || fixo === "")
    ) {
      continue;
    }

    const p = Numero.safeParse(percentual || 0);
    const f = Numero.safeParse(fixo || 0);

    if (!p.success || !f.success) {
      return {
        ok: false,
        mensagem: `Valor inválido na tarifa de ${metodo}. Use números.`,
      };
    }

    linhas.push({
      org_id: organizacao.id,
      method: metodo,
      percent_bps: Math.round(p.data * 100), // 2,9 → 290
      fixed_cents: Math.round(f.data * 100),
      source: "tarifa informada por você",
    });
  }

  if (linhas.length === 0) {
    return { ok: false, mensagem: "Preencha ao menos uma tarifa." };
  }

  // Substitui as anteriores da organização. As de referência (org_id nulo)
  // não são tocadas — ninguém edita o padrão do sistema.
  await supa.from("fee_profiles").delete().eq("org_id", organizacao.id);
  const { error } = await supa.from("fee_profiles").insert(linhas);

  if (error) {
    return { ok: false, mensagem: `Não conseguimos salvar: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/configuracoes");

  return {
    ok: true,
    mensagem: "Tarifas salvas. O diagnóstico já está usando os seus números.",
  };
}
