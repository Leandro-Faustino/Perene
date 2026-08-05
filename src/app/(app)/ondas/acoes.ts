"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { supabaseServidor } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirOrgAtual } from "@/lib/clerk/user-service";
import { gerarToken, calcularExpiracao } from "@/lib/domain/tokens";
import { agendarRegua, dividirEmLotesDiarios, REGUA_PADRAO } from "@/lib/domain/cadence";
import {
  ordenarParaConvite,
  resumirOnda,
  selecionarParaOnda,
  type ContratoCandidato,
  type Segmento,
} from "@/lib/domain/waves";
import { enfileirarVarios } from "@/lib/jobs/enqueue";
import { chaveDeIdempotencia } from "@/lib/jobs/types";
import type { MetodoPagamento } from "@/lib/gateways/types";

const Entrada = z.object({
  nome: z.string().trim().min(2, "Dê um nome para a onda."),
  metodos: z.array(z.string()).optional(),
  valorMinimo: z.coerce.number().optional(),
  falhasMinimas: z.coerce.number().optional(),
  limiteDiario: z.coerce.number().min(1).max(1000).default(100),
});

/**
 * Carrega os candidatos da organização, já no formato do domínio.
 *
 * Feito sob RLS: a lista é do operador logado e de mais ninguém.
 */
export async function carregarCandidatos(): Promise<ContratoCandidato[]> {
  await exigirOrgAtual();
  const supa = supabaseServidor();

  const { data } = await supa
    .from("contracts")
    .select(
      `id, amount_cents, current_method, failure_count_12m, tags, migrated_at,
       payers ( phone_e164, email ),
       invitations ( status )`,
    )
    .eq("status", "active");

  return (data ?? []).map((c) => {
    const pagador = c.payers as unknown as {
      phone_e164: string | null;
      email: string | null;
    } | null;
    const convites = (c.invitations ?? []) as unknown as { status: string }[];

    return {
      id: c.id,
      valorCentavos: c.amount_cents,
      metodo: c.current_method as MetodoPagamento,
      falhas12m: c.failure_count_12m,
      tags: c.tags ?? [],
      temTelefone: Boolean(pagador?.phone_e164),
      temEmail: Boolean(pagador?.email),
      jaMigrado: Boolean(c.migrated_at),
      temConviteAberto: convites.some((i) =>
        ["pending", "opened"].includes(i.status),
      ),
    };
  });
}

export interface PreviaDaOnda {
  elegiveis: number;
  excluidos: number;
  motivos: { motivo: string; quantidade: number }[];
  valorMensalEmJogoCentavos: number;
  diasDeDisparo: number;
}

export async function preverOnda(segmento: Segmento, limiteDiario: number) {
  const candidatos = await carregarCandidatos();
  const selecao = selecionarParaOnda(candidatos, segmento);
  const resumo = resumirOnda(selecao);

  return {
    ...resumo,
    diasDeDisparo: Math.max(1, Math.ceil(resumo.elegiveis / limiteDiario)),
  } satisfies PreviaDaOnda;
}

export interface EstadoDaOnda {
  ok: boolean;
  mensagem: string;
  waveId?: string;
  convites?: number;
}

/**
 * Cria a onda e agenda a régua inteira.
 *
 * Duas decisões que valem explicação:
 *
 * 1. Os jobs de TODOS os passos são agendados de uma vez, no momento da
 *    criação — não um a um conforme o anterior sai. Se a régua dependesse de
 *    um job agendar o próximo, um job perdido interromperia a sequência em
 *    silêncio, e ninguém perceberia até o operador perguntar por que a adesão
 *    caiu. Agendados todos, o cancelamento é que é explícito.
 *
 * 2. A ordem dos convites vem de `ordenarParaConvite`: quem mais FALHA
 *    primeiro. E o limite diário distribui em lotes, porque disparar 400
 *    mensagens de uma vez é o caminho mais curto para o bloqueio do número.
 */
export async function criarOnda(
  _anterior: EstadoDaOnda | null,
  formulario: FormData,
): Promise<EstadoDaOnda> {
  const clerkOrgId = await exigirOrgAtual();

  const analise = Entrada.safeParse({
    nome: formulario.get("nome"),
    metodos: formulario.getAll("metodos").map(String),
    valorMinimo: formulario.get("valorMinimo") || undefined,
    falhasMinimas: formulario.get("falhasMinimas") || undefined,
    limiteDiario: formulario.get("limiteDiario") || 100,
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem: analise.error.issues[0]?.message ?? "Confira os campos.",
    };
  }

  const { nome, metodos, valorMinimo, falhasMinimas, limiteDiario } = analise.data;

  const segmento: Segmento = {
    metodos: metodos?.length ? (metodos as MetodoPagamento[]) : undefined,
    valorMinimoCentavos: valorMinimo ? Math.round(valorMinimo * 100) : undefined,
    falhasMinimas: falhasMinimas || undefined,
  };

  const selecao = selecionarParaOnda(await carregarCandidatos(), segmento);
  if (selecao.elegiveis.length === 0) {
    return {
      ok: false,
      mensagem:
        "Nenhum contrato passou no filtro. Afrouxe os critérios ou confira se a base tem telefone cadastrado.",
    };
  }

  const supa = supabaseServidor();
  const { data: organizacao } = await supa
    .from("organizations")
    .select("id")
    .eq("clerk_org_id", clerkOrgId)
    .maybeSingle();

  if (!organizacao) {
    return { ok: false, mensagem: "Organização não encontrada." };
  }

  const { data: onda, error: erroOnda } = await supa
    .from("waves")
    .insert({
      org_id: organizacao.id,
      name: nome,
      status: "running",
      segment: segmento as unknown as Record<string, unknown>,
      cadence: REGUA_PADRAO as unknown as Record<string, unknown>,
      daily_limit: limiteDiario,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (erroOnda || !onda) {
    return {
      ok: false,
      mensagem: `Não conseguimos criar a onda: ${erroOnda?.message ?? "erro desconhecido"}`,
    };
  }

  const ordenados = ordenarParaConvite(selecao.elegiveis);
  const agora = new Date();
  const lotes = dividirEmLotesDiarios(ordenados, limiteDiario, agora);

  const convitesParaGravar = lotes.flatMap((lote) =>
    lote.itens.map((contrato) => ({
      org_id: organizacao.id,
      wave_id: onda.id,
      contract_id: contrato.id,
      token: gerarToken(),
      status: "pending" as const,
      expires_at: calcularExpiracao(lote.dia).toISOString(),
      _inicio: lote.dia,
    })),
  );

  const { data: gravados, error: erroConvites } = await supa
    .from("invitations")
    .insert(
      convitesParaGravar.map(({ _inicio, ...resto }) => {
        void _inicio;
        return resto;
      }),
    )
    .select("id");

  if (erroConvites || !gravados) {
    return {
      ok: false,
      mensagem: `A onda foi criada, mas os convites não: ${erroConvites?.message ?? "erro"}`,
      waveId: onda.id,
    };
  }

  // A régua inteira, de uma vez. `enfileirarVarios` ignora chave repetida, então
  // reexecutar isto não duplica mensagem para ninguém.
  const jobs = gravados.flatMap((convite, i) => {
    const inicio = convitesParaGravar[i]._inicio;
    return agendarRegua(inicio).map((passo) => ({
      payload: {
        kind: "send_cadence_step" as const,
        invitationId: convite.id,
        passo: passo.passo,
      },
      orgId: organizacao.id,
      quando: passo.quando,
      idempotencyKey: chaveDeIdempotencia.reguaPasso(convite.id, passo.passo),
    }));
  });

  const expiracoes = gravados.map((convite, i) => ({
    payload: { kind: "expire_invitation" as const, invitationId: convite.id },
    orgId: organizacao.id,
    quando: calcularExpiracao(convitesParaGravar[i]._inicio),
    idempotencyKey: chaveDeIdempotencia.expirarConvite(convite.id),
  }));

  try {
    // Fila é tabela sem policy: só service-role escreve.
    void supabaseAdmin();
    await enfileirarVarios([...jobs, ...expiracoes]);
  } catch (causa) {
    return {
      ok: false,
      mensagem: `Convites criados, mas a régua não foi agendada: ${
        causa instanceof Error ? causa.message : String(causa)
      }`,
      waveId: onda.id,
      convites: gravados.length,
    };
  }

  revalidatePath("/ondas");

  return {
    ok: true,
    mensagem: "Onda criada.",
    waveId: onda.id,
    convites: gravados.length,
  };
}
