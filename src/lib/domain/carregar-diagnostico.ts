import { supabaseServidor } from "@/lib/supabase/server";
import type { MetodoPagamento, Periodicidade } from "@/lib/gateways/types";

import {
  calcularDiagnostico,
  type Diagnostico,
  type Tarifa,
} from "./diagnostico";

import "server-only";

/**
 * Busca os dados e delega o cálculo.
 *
 * A separação é deliberada: `calcularDiagnostico` é pura e testada; este
 * arquivo só sabe ler o banco. Assim o número que o operador vê é produzido
 * por código que qualquer pessoa consegue rodar e conferir sem subir um
 * Postgres.
 */

const COBRANCAS_POR_ANO: Record<Periodicidade, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
};

export async function carregarDiagnostico(): Promise<Diagnostico | null> {
  const supa = supabaseServidor();

  // RLS já limita à organização da sessão. Não filtramos por org aqui de
  // propósito: se algum dia a policy quebrar, o teste de RLS acusa — um filtro
  // manual mascararia a falha.
  const [{ data: contratos }, { data: tarifas }, { data: falhas }] =
    await Promise.all([
      supa
        .from("contracts")
        .select("current_method, amount_cents, frequency")
        .eq("status", "active"),
      supa
        .from("fee_profiles")
        .select("method, percent_bps, fixed_cents, source, org_id"),
      supa
        .from("charges")
        .select("amount_cents, provider")
        .eq("status", "failed")
        .gte("due_date", dozeMesesAtras()),
    ]);

  if (!contratos || contratos.length === 0) return null;

  const tabela = montarTarifas(tarifas ?? []);

  return calcularDiagnostico({
    contratos: contratos.map((c) => ({
      metodo: c.current_method as MetodoPagamento,
      valorCentavos: c.amount_cents,
      cobrancasPorAno: COBRANCAS_POR_ANO[c.frequency as Periodicidade] ?? 12,
    })),
    tarifas: tabela.todas,
    falhas12m: (falhas ?? []).map((f) => ({
      metodo: "other" as MetodoPagamento,
      valorCentavos: f.amount_cents,
    })),
    tarifaPixAutomatico: tabela.pixAutomatico,
  });
}

interface LinhaDeTarifa {
  method: string;
  percent_bps: number;
  fixed_cents: number;
  source: string | null;
  org_id: string | null;
}

/**
 * A tarifa da organização vence a tarifa padrão do sistema.
 *
 * É o que sustenta a promessa de que o número é reproduzível: o operador
 * corrige a tarifa dele e o diagnóstico inteiro se recalcula com a conta dele,
 * não com a nossa estimativa.
 */
function montarTarifas(linhas: LinhaDeTarifa[]) {
  const porMetodo = new Map<string, Tarifa>();

  // Padrões do sistema primeiro; os da organização sobrescrevem depois.
  const ordenadas = [...linhas].sort((a, b) =>
    a.org_id === null ? -1 : b.org_id === null ? 1 : 0,
  );

  for (const linha of ordenadas) {
    porMetodo.set(linha.method, {
      metodo: linha.method as MetodoPagamento,
      percentBps: linha.percent_bps,
      fixedCents: linha.fixed_cents,
      origem:
        linha.org_id === null
          ? (linha.source ?? "valor de referência do sistema")
          : "tarifa informada por você",
    });
  }

  const pixAutomatico = porMetodo.get("pix_automatico") ?? {
    metodo: "pix_automatico" as MetodoPagamento,
    percentBps: 0,
    fixedCents: 10,
    origem: "tarifa de referência — confirme a sua",
  };

  return { todas: [...porMetodo.values()], pixAutomatico };
}

function dozeMesesAtras(): string {
  const data = new Date();
  data.setFullYear(data.getFullYear() - 1);
  return data.toISOString().slice(0, 10);
}
