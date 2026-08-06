"use server";

import { revalidatePath } from "next/cache";

import { supabaseServidor } from "@/lib/supabase/server";
import { exigirOrgAtual } from "@/lib/clerk/user-service";

/**
 * Marca um evento de risco como resolvido.
 *
 * A resolução é do operador — ele leu, tomou alguma providência, e decide que
 * o item saiu da fila. O sistema não resolve automaticamente: um mandato
 * cancelado continua cancelado; "resolver" aqui significa "estou ciente e já
 * tratei".
 *
 * RLS garante que o operador só enxerga eventos da sua org. A query com
 * `supabaseServidor` (que carrega o token do Clerk) reforça isso.
 */
export async function resolverEvento(id: string): Promise<void> {
  await exigirOrgAtual();
  const supa = supabaseServidor();

  await supa
    .from("risk_events")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/atencao");
}
