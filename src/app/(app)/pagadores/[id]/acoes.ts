"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { supabaseServidor } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirOrgAtual } from "@/lib/clerk/user-service";
import { gerarToken, calcularExpiracao } from "@/lib/domain/tokens";
import { agendarRegua } from "@/lib/domain/cadence";
import { enfileirarVarios } from "@/lib/jobs/enqueue";
import { chaveDeIdempotencia } from "@/lib/jobs/types";
import { precisaReautorizar } from "@/lib/domain/reajuste";

export interface ResultadoDoReajuste {
  ok: boolean;
  mensagem: string;
  reautorizacaoNecessaria?: boolean;
}

const Entrada = z.object({
  contractId: z.string().uuid(),
  // O formulário envia o valor em reais (ex: "150.50"); convertemos para
  // centavos aqui, na borda de entrada, antes de qualquer lógica de domínio.
  novoValorReais: z.coerce.number().min(0.01, "Valor mínimo: R$ 0,01"),
});

/**
 * Aplica um reajuste de valor ao contrato.
 *
 * Dois caminhos:
 * - Novo valor ≤ teto do mandato → atualiza e pronto.
 * - Novo valor > teto → atualiza + cria convite de reautorização + agenda
 *   a régua inteira, exatamente como criarOnda, mas para um contrato só.
 *
 * Por que criar todos os jobs de uma vez? Mesmo motivo da onda: um job que
 * agenda o próximo significa que um job perdido interrompe a sequência em
 * silêncio.
 */
export async function reajustarContrato(
  _anterior: ResultadoDoReajuste | null,
  formulario: FormData,
): Promise<ResultadoDoReajuste> {
  const clerkOrgId = await exigirOrgAtual();

  const analise = Entrada.safeParse({
    contractId: formulario.get("contractId"),
    novoValorReais: formulario.get("novoValorReais"),
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem: analise.error.issues[0]?.message ?? "Confira os campos.",
    };
  }

  const { contractId } = analise.data;
  const novoValorCentavos = Math.round(analise.data.novoValorReais * 100);
  const supa = supabaseServidor();

  // RLS garante que o contrato pertence à org do operador.
  const { data: contrato } = await supa
    .from("contracts")
    .select(
      `id, payer_id, amount_cents, status,
       mandates ( id, status, ceiling_cents )`,
    )
    .eq("id", contractId)
    .eq("status", "active")
    .maybeSingle();

  if (!contrato) {
    return { ok: false, mensagem: "Contrato não encontrado ou inativo." };
  }

  const mandatos = (contrato.mandates ?? []) as unknown as {
    id: string;
    status: string;
    ceiling_cents: number | null;
  }[];
  const mandatoAtivo = mandatos.find((m) => m.status === "authorized");

  const reautorizar = mandatoAtivo
    ? precisaReautorizar(novoValorCentavos, mandatoAtivo.ceiling_cents)
    : false;

  // Atualiza o valor independente do caminho.
  await supa
    .from("contracts")
    .update({ amount_cents: novoValorCentavos })
    .eq("id", contractId);

  if (!reautorizar) {
    revalidatePath(`/pagadores/${contrato.payer_id}`);
    return { ok: true, mensagem: "Valor atualizado." };
  }

  // Reautorização: precisa do org_id interno para gravar o convite.
  const { data: orgRow } = await supa
    .from("organizations")
    .select("id")
    .eq("clerk_org_id", clerkOrgId)
    .maybeSingle();

  if (!orgRow) {
    return { ok: false, mensagem: "Organização não encontrada." };
  }

  const agora = new Date();
  const expiraEm = calcularExpiracao(agora);

  const { data: convite, error: erroConvite } = await supa
    .from("invitations")
    .insert({
      org_id: orgRow.id,
      wave_id: null,
      contract_id: contractId,
      token: gerarToken(),
      status: "pending",
      expires_at: expiraEm.toISOString(),
    })
    .select("id")
    .single();

  if (erroConvite || !convite) {
    return {
      ok: false,
      mensagem: `Valor atualizado, mas não foi possível criar o convite: ${
        erroConvite?.message ?? "erro desconhecido"
      }`,
    };
  }

  const passos = agendarRegua(agora).map((passo) => ({
    payload: {
      kind: "send_cadence_step" as const,
      invitationId: convite.id,
      passo: passo.passo,
    },
    orgId: orgRow.id,
    quando: passo.quando,
    idempotencyKey: chaveDeIdempotencia.reguaPasso(convite.id, passo.passo),
  }));

  const expiracao = {
    payload: { kind: "expire_invitation" as const, invitationId: convite.id },
    orgId: orgRow.id,
    quando: expiraEm,
    idempotencyKey: chaveDeIdempotencia.expirarConvite(convite.id),
  };

  try {
    void supabaseAdmin();
    await enfileirarVarios([...passos, expiracao]);
  } catch (causa) {
    return {
      ok: false,
      mensagem: `Valor atualizado e convite criado, mas a régua não foi agendada: ${
        causa instanceof Error ? causa.message : String(causa)
      }`,
      reautorizacaoNecessaria: true,
    };
  }

  revalidatePath(`/pagadores/${contrato.payer_id}`);
  return {
    ok: true,
    mensagem:
      "Valor atualizado. Nova autorização sendo solicitada ao pagador.",
    reautorizacaoNecessaria: true,
  };
}
