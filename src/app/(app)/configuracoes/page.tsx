import { supabaseServidor } from "@/lib/supabase/server";
import {
  FormularioDeTarifas,
  type TarifaAtual,
} from "@/components/configuracoes/formulario-de-tarifas";
import type { MetodoPagamento } from "@/lib/gateways/types";

export const metadata = { title: "Configurações" };

const METODOS: MetodoPagamento[] = [
  "card",
  "boleto",
  "pix_manual",
  "debito_automatico",
  "pix_automatico",
];

/**
 * Configurações — hoje, as tarifas.
 *
 * É a tela que torna o diagnóstico honesto. Enquanto o operador não informa a
 * tarifa dele, o cálculo roda sobre faixa de mercado, e a memória de cálculo
 * diz isso com todas as letras. Aqui ele corrige, e o número passa a ser o
 * dele — que é a condição para ele confiar (§4.2, valor PRECISÃO).
 */
export default async function PaginaDeConfiguracoes() {
  const supa = supabaseServidor();

  const { data: linhas } = await supa
    .from("fee_profiles")
    .select("method, percent_bps, fixed_cents, source, org_id");

  const porMetodo = new Map<string, TarifaAtual>();

  // Referências do sistema primeiro; as da organização sobrescrevem.
  for (const l of [...(linhas ?? [])].sort((a) =>
    a.org_id === null ? -1 : 1,
  )) {
    porMetodo.set(l.method, {
      metodo: l.method as MetodoPagamento,
      percentual: l.percent_bps / 100,
      fixoEmReais: l.fixed_cents / 100,
      origem:
        l.org_id === null
          ? (l.source ?? "valor de referência do sistema")
          : "tarifa informada por você",
      daOrganizacao: l.org_id !== null,
    });
  }

  const tarifas = METODOS.map(
    (metodo) =>
      porMetodo.get(metodo) ?? {
        metodo,
        percentual: 0,
        fixoEmReais: 0,
        origem: "sem tarifa informada",
        daOrganizacao: false,
      },
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Configurações
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        As tarifas que o diagnóstico usa. Enquanto você não informar as suas, a
        conta roda sobre faixas de mercado — e diz isso.
      </p>

      <FormularioDeTarifas tarifas={tarifas} />
    </div>
  );
}
