import { supabaseAdmin } from "@/lib/supabase/admin";

import type { PayloadDeJob } from "./types";

import "server-only";

/**
 * Enfileira um job.
 *
 * `idempotencyKey` é opcional no tipo mas obrigatório na prática para tudo que
 * pode ser disparado duas vezes. O índice único no banco é quem garante — se a
 * chave repetir, a inserção é ignorada e o job não duplica. Confiar na
 * aplicação para não chamar duas vezes é confiar em algo que a rede não
 * garante.
 */
export async function enfileirar(
  payload: PayloadDeJob,
  opcoes: {
    orgId: string;
    quando?: Date;
    idempotencyKey?: string;
    maxTentativas?: number;
  },
): Promise<void> {
  const supa = supabaseAdmin();

  const { error } = await supa.from("jobs").insert(
    {
      org_id: opcoes.orgId,
      kind: payload.kind,
      payload,
      run_at: (opcoes.quando ?? new Date()).toISOString(),
      status: "pending",
      max_attempts: opcoes.maxTentativas ?? 5,
      idempotency_key: opcoes.idempotencyKey ?? null,
    },
    // Chave repetida significa "esse trabalho já está agendado". Não é erro.
    { count: "exact" },
  );

  if (error && error.code !== "23505") {
    throw new Error(`Não conseguimos agendar o trabalho: ${error.message}`);
  }
}

export async function enfileirarVarios(
  jobs: {
    payload: PayloadDeJob;
    orgId: string;
    quando?: Date;
    idempotencyKey?: string;
  }[],
): Promise<void> {
  if (jobs.length === 0) return;

  const supa = supabaseAdmin();

  // Em lote, `upsert` com `ignoreDuplicates` faz o mesmo papel do `on conflict
  // do nothing`: 400 convites entram numa ida ao banco, e reexecutar não
  // duplica nenhum.
  const { error } = await supa.from("jobs").upsert(
    jobs.map((j) => ({
      org_id: j.orgId,
      kind: j.payload.kind,
      payload: j.payload,
      run_at: (j.quando ?? new Date()).toISOString(),
      status: "pending",
      idempotency_key: j.idempotencyKey ?? null,
    })),
    { onConflict: "idempotency_key", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(`Não conseguimos agendar os trabalhos: ${error.message}`);
  }
}

/**
 * Encerra a régua de um convite.
 *
 * Chamado quando a autorização entra. A operação inteira acontece no banco
 * (`pulse.cancelar_regua`), numa transação só: se ficasse na aplicação, um
 * webhook chegando no meio de um tick deixaria passar exatamente o lembrete
 * que não deveria sair.
 */
export async function encerrarRegua(invitationId: string): Promise<number> {
  const { data } = await supabaseAdmin().rpc("cancelar_regua", {
    p_invitation_id: invitationId,
  });
  return typeof data === "number" ? data : 0;
}
