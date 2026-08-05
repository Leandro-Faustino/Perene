"use server";

import { z } from "zod";

import { supabaseServidor } from "@/lib/supabase/server";
import { exigirOrgAtual } from "@/lib/clerk/user-service";

const Entrada = z.object({
  nome: z.string().trim().min(2, "Informe o nome do negócio."),
  /**
   * O rótulo do pagador é o ÚNICO ponto de adaptação de nicho do sistema
   * (§4.1). Nada de schema por vertical: o domínio diz Pagador, e a interface
   * mostra "aluno", "paciente" ou "morador" conforme esta escolha.
   */
  rotuloDoPagador: z.string().trim().min(2).default("pagador"),
});

export interface EstadoDaOrganizacao {
  ok: boolean;
  mensagem: string;
}

/**
 * Grava a organização no banco depois que ela já existe no Clerk.
 *
 * Repare no que NÃO usa: cliente service-role. A policy de `organizations`
 * é `clerk_org_id = pulse.clerk_org_id()`, então o próprio usuário autenticado
 * consegue inserir a linha da organização dele — e só dela. Menos superfície
 * privilegiada é menos chance de um bug virar vazamento entre clientes.
 *
 * Por isso a ordem no cliente é: criar no Clerk, ativar na sessão, e só então
 * chamar esta ação — sem a organização ativa no token, o `with check` recusa.
 */
export async function registrarOrganizacao(
  _anterior: EstadoDaOrganizacao | null,
  formulario: FormData,
): Promise<EstadoDaOrganizacao> {
  const orgId = await exigirOrgAtual();

  const analise = Entrada.safeParse({
    nome: formulario.get("nome"),
    rotuloDoPagador: formulario.get("rotuloDoPagador") || undefined,
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem: analise.error.issues[0]?.message ?? "Confira os campos.",
    };
  }

  const supa = supabaseServidor();

  const { error } = await supa.from("organizations").upsert(
    {
      clerk_org_id: orgId,
      name: analise.data.nome,
      payer_label: analise.data.rotuloDoPagador,
    },
    { onConflict: "clerk_org_id" },
  );

  if (error) {
    return {
      ok: false,
      mensagem: `Não conseguimos salvar a organização: ${error.message}`,
    };
  }

  return { ok: true, mensagem: "Organização criada." };
}
