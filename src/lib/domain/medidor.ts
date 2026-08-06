/**
 * Dados reais do Medidor de Migração (brand book §5.4).
 *
 * O Medidor precisa de três números:
 *
 * 1. contratosTotais — contratos ativos, independente do método.
 * 2. contratosMigrados — destes, quantos já estão em Pix Automático.
 * 3. economiaMensalCentavos — o quanto esses contratos migrados economizam
 *    por mês comparado ao que custavam antes.
 *
 * Para (3), só calculamos onde temos `original_method`. Contratos migrados
 * antes desta feature ficam com economia declarada como R$ 0 — é uma
 * subestimação honesta, não uma estimativa inventada (valor PRECISÃO, §4.2).
 *
 * A função é carregada no layout de `(app)`, renderizado em cada rota. Por
 * isso usa `unstable_cache` com revalidação de 5 minutos: o Medidor não
 * precisa ser ao vivo, mas também não pode ficar um dia desatualizado.
 */

import { unstable_cache } from "next/cache";
import { supabaseServidor } from "@/lib/supabase/server";
import type { MetodoPagamento, Periodicidade } from "@/lib/gateways/types";

import "server-only";

export interface DadosDoMedidor {
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

export async function carregarMedidor(orgId: string): Promise<DadosDoMedidor> {
  return carregarMedidorCacheado(orgId);
}

// Revalida a cada 5 min. A tag "medidor" pode ser invalidada manualmente
// quando um mandato é autorizado (futuro).
const carregarMedidorCacheado = unstable_cache(
  async (orgId: string): Promise<DadosDoMedidor> => {
    const supa = supabaseServidor();

    const [{ data: contratos }, { data: tarifas }] = await Promise.all([
      supa
        .from("contracts")
        .select("current_method, original_method, amount_cents, frequency")
        .eq("status", "active"),
      supa
        .from("fee_profiles")
        .select("method, percent_bps, fixed_cents, org_id"),
    ]);

    if (!contratos || contratos.length === 0) {
      return { contratosMigrados: 0, contratosTotais: 0, economiaMensalCentavos: 0 };
    }

    const contratosTotais = contratos.length;
    const migrados = contratos.filter((c) => c.current_method === "pix_automatico");
    const contratosMigrados = migrados.length;

    // Monta mapa de tarifas: org_id não-nulo vence o padrão do sistema.
    const porMetodo = new Map<string, { percentBps: number; fixedCents: number }>();
    const ordenadas = [...(tarifas ?? [])].sort((a, b) =>
      a.org_id === null ? -1 : b.org_id === null ? 1 : 0,
    );
    for (const t of ordenadas) {
      porMetodo.set(t.method, {
        percentBps: t.percent_bps,
        fixedCents: t.fixed_cents,
      });
    }
    const tarifaPix = porMetodo.get("pix_automatico") ?? { percentBps: 0, fixedCents: 10 };

    // Economia mensal: somatório sobre contratos migrados com original_method.
    // Os sem original_method contribuem R$ 0 — declarado, não inventado.
    let economiaMensalCentavos = 0;
    for (const c of migrados) {
      if (!c.original_method) continue;

      const tarifaAntes = porMetodo.get(c.original_method);
      if (!tarifaAntes) continue;

      const cobrancasPorAno =
        COBRANCAS_POR_ANO[c.frequency as Periodicidade] ?? 12;

      const custoAntesPorCobranca =
        Math.round((c.amount_cents * tarifaAntes.percentBps) / 10_000) +
        tarifaAntes.fixedCents;
      const custoPixPorCobranca =
        Math.round((c.amount_cents * tarifaPix.percentBps) / 10_000) +
        tarifaPix.fixedCents;

      const economiaDoContrato = Math.max(
        0,
        mensalizar(custoAntesPorCobranca - custoPixPorCobranca, cobrancasPorAno),
      );
      economiaMensalCentavos += economiaDoContrato;
    }

    return { contratosMigrados, contratosTotais, economiaMensalCentavos };
  },
  ["medidor"],
  { revalidate: 300 },
);

function mensalizar(valorPorCobranca: number, cobrancasPorAno: number): number {
  if (cobrancasPorAno <= 0) return 0;
  return Math.round((valorPorCobranca * cobrancasPorAno) / 12);
}
