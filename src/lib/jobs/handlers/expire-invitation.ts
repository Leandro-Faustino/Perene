import { supabaseAdmin } from "@/lib/supabase/admin";

import type { PayloadDeJob, ResultadoDoJob } from "../types";

import "server-only";

/**
 * Expira o convite.
 *
 * Fecha o ciclo: um link de autorização que continua vivo indefinidamente é um
 * link que abre uma tela de cobrança meses depois, com um valor que já mudou.
 *
 * Contratos cujo convite expirou voltam ao pool e ficam elegíveis para a
 * próxima onda (RF-45) — não são desistência, são "ainda não".
 */
export async function expirarConvite(
  payload: Extract<PayloadDeJob, { kind: "expire_invitation" }>,
): Promise<ResultadoDoJob> {
  const supa = supabaseAdmin();

  const { error } = await supa
    .from("invitations")
    .update({ status: "expired" })
    .eq("id", payload.invitationId)
    .in("status", ["pending", "opened"]);

  if (error) {
    return { estado: "falhou", erro: error.message, recuperavel: true };
  }

  return { estado: "feito" };
}
