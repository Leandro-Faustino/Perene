import { supabaseServidor } from "@/lib/supabase/server";
import type { MetodoPagamento, Periodicidade } from "@/lib/gateways/types";

import "server-only";

/**
 * Os números do medidor de migração (§5.4).
 *
 * O medidor é o elemento de assinatura da marca e fica persistente no topo do
 * painel, inclusive — e principalmente — nos meses em que não muda. Por isso
 * ele não pode mentir nem estimar: é o número pelo qual o operador julga o
 * produto.
 *
 * A economia é uma DIFERENÇA real, contrato a contrato: o que cada um custaria
 * no método anterior menos o que custa em Pix Automático. Contrato migrado sem
 * `previous_method` registrado entra na contagem mas não na economia —
 * subestimar declaradamente é melhor do que inventar (§4.2).
 */

export interface NumerosDoMedidor {
  contratosMigrados: number;
  contratosTotais: number;
  economiaMensalCentavos: number;
}

const COBRANCAS_POR_ANO: Record<Periodicidade, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
};

const VAZIO: NumerosDoMedidor = {
  contratosMigrados: 0,
  contratosTotais: 0,
  economiaMensalCentavos: 0,
};

export async function carregarMedidor(): Promise<NumerosDoMedidor> {
  const supa = supabaseServidor();

  const [{ data: contratos }, { data: tarifas }] = await Promise.all([
    supa
      .from("contracts")
      .select("amount_cents, frequency, migrated_at, previous_method")
      .eq("status", "active"),
    supa.from("fee_profiles").select("method, percent_bps, fixed_cents, org_id"),
  ]);

  if (!contratos) return VAZIO;

  const tabela = montarTarifas(tarifas ?? []);
  const pix = tabela.get("pix_automatico") ?? { percentBps: 0, fixedCents: 10 };

  let migrados = 0;
  let economia = 0;

  for (const c of contratos) {
    if (!c.migrated_at) continue;
    migrados++;

    const anterior = c.previous_method
      ? tabela.get(c.previous_method)
      : undefined;
    if (!anterior) continue;

    const porAno = COBRANCAS_POR_ANO[c.frequency as Periodicidade] ?? 12;
    const antes = mensalizar(custo(c.amount_cents, anterior), porAno);
    const depois = mensalizar(custo(c.amount_cents, pix), porAno);
    economia += Math.max(0, antes - depois);
  }

  return {
    contratosMigrados: migrados,
    contratosTotais: contratos.length,
    economiaMensalCentavos: economia,
  };
}

interface Tarifa {
  percentBps: number;
  fixedCents: number;
}

function custo(valorCentavos: number, tarifa: Tarifa): number {
  return (
    Math.round((valorCentavos * tarifa.percentBps) / 10_000) + tarifa.fixedCents
  );
}

function mensalizar(valorPorCobranca: number, cobrancasPorAno: number): number {
  if (cobrancasPorAno <= 0) return 0;
  return Math.round((valorPorCobranca * cobrancasPorAno) / 12);
}

/** A tarifa da organização vence a de referência do sistema. */
function montarTarifas(
  linhas: { method: string; percent_bps: number; fixed_cents: number; org_id: string | null }[],
): Map<MetodoPagamento, Tarifa> {
  const mapa = new Map<MetodoPagamento, Tarifa>();
  const ordenadas = [...linhas].sort((a, b) =>
    a.org_id === null ? -1 : b.org_id === null ? 1 : 0,
  );

  for (const l of ordenadas) {
    mapa.set(l.method as MetodoPagamento, {
      percentBps: l.percent_bps,
      fixedCents: l.fixed_cents,
    });
  }
  return mapa;
}
