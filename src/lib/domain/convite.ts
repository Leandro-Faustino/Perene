import { supabasePublico } from "@/lib/supabase/server";
import { pareceToken } from "@/lib/domain/tokens";
import type { ConviteParaPagador } from "@/lib/domain/convite-tipos";

import "server-only";

/**
 * Carrega o convite da página do pagador.
 *
 * Só isto: uma função, uma consulta, um convite. O caminho público do sistema
 * é o mais exposto que existe, e quanto menos ele consegue fazer, melhor.
 */

interface LinhaDoBanco {
  invitation_id: string;
  status: string;
  expires_at: string;
  mandate_id: string | null;
  mandate_status: string | null;
  payer_name: string;
  contract_amount_cents: number;
  contract_frequency: string;
  contract_due_day: number | null;
  contract_description: string | null;
  ceiling_cents: number | null;
  org_name: string;
  org_logo_url: string | null;
  org_brand_color: string | null;
  org_payer_label: string;
}

export async function carregarConvite(
  token: string,
): Promise<ConviteParaPagador | null> {
  // Descarta lixo antes de tocar o banco. Um scanner que varre a rota não
  // merece uma ida ao Postgres por tentativa.
  if (!pareceToken(token)) return null;

  const supa = supabasePublico();
  const { data, error } = await supa.rpc("convite_por_token", { p_token: token });

  // A função devolve `setof`, então o retorno é uma lista de zero ou um item.
  const linhas = (data ?? []) as LinhaDoBanco[];
  if (error || linhas.length === 0) return null;

  const l = linhas[0];

  return {
    invitationId: l.invitation_id,
    status: l.status,
    expiraEm: l.expires_at,
    mandateId: l.mandate_id,
    mandateStatus: l.mandate_status,
    pagador: l.payer_name,
    valorCentavos: l.contract_amount_cents,
    periodicidade: l.contract_frequency,
    diaVencimento: l.contract_due_day,
    descricao: l.contract_description,
    tetoCentavos: l.ceiling_cents,
    organizacao: {
      nome: l.org_name,
      logoUrl: l.org_logo_url,
      corDeMarca: l.org_brand_color,
      rotuloDoPagador: l.org_payer_label,
    },
  };
}

export async function marcarConviteAberto(token: string): Promise<void> {
  if (!pareceToken(token)) return;
  await supabasePublico().rpc("marcar_convite_aberto", { p_token: token });
}

export type { ConviteParaPagador };
