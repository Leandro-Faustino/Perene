import Link from "next/link";

import { supabaseServidor } from "@/lib/supabase/server";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Botao } from "@/components/ui/botao";
import { SeloDeEstado } from "@/components/ui/selo-de-estado";
import { rotulo } from "@/lib/domain/diagnostico";
import { formatarReais } from "@/lib/utils";
import type { MetodoPagamento } from "@/lib/gateways/types";

export const metadata = { title: "Base" };

/**
 * A base.
 *
 * Chamada de "Base" na navegação, nunca de "carteira" nem "portfólio" (§4.3).
 * O rótulo de cada pessoa vem da organização — "aluno", "paciente", "morador"
 * — porque é o único ponto de adaptação de nicho do sistema.
 */
export default async function PaginaDePagadores() {
  const supa = supabaseServidor();

  const [{ data: organizacao }, { data: contratos }] = await Promise.all([
    supa.from("organizations").select("payer_label").maybeSingle(),
    supa
      .from("contracts")
      .select(
        `id, amount_cents, current_method, migrated_at, failure_count_12m,
         payers ( name, phone_e164 )`,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const termo = organizacao?.payer_label ?? "pagador";

  if (!contratos || contratos.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Cabecalho termo={termo} />
        <EstadoVazio
          titulo="Sua base ainda não foi importada"
          descricao="Envie um CSV ou conecte o gateway que você já usa. A gente mostra o que entendeu antes de qualquer coisa entrar."
          acao={
            <Botao asChild>
              <Link href="/importar-base">Importar base</Link>
            </Botao>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Cabecalho termo={termo} />

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-[14px]">
          <thead className="bg-[var(--pl-superficie)]">
            <tr>
              {["Nome", "Método", "Situação"].map((c) => (
                <th
                  key={c}
                  className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio"
                >
                  {c}
                </th>
              ))}
              {["Valor", "Falhas 12m"].map((c) => (
                <th
                  key={c}
                  className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contratos.map((c) => {
              const pagador = c.payers as unknown as {
                name: string;
                phone_e164: string | null;
              } | null;

              return (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">
                    <span className="text-foreground">{pagador?.name ?? "—"}</span>
                    {!pagador?.phone_e164 && (
                      <span className="mt-0.5 block text-[13px] text-texto-medio">
                        sem telefone — não dá para convidar
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-texto">
                    {rotulo(c.current_method as MetodoPagamento)}
                  </td>
                  <td className="px-4 py-3">
                    {c.migrated_at ? (
                      <SeloDeEstado estado="ativo">Migrado</SeloDeEstado>
                    ) : (
                      <SeloDeEstado estado="neutro">No método antigo</SeloDeEstado>
                    )}
                  </td>
                  <td className="pl-numero px-4 py-3 font-medium">
                    {formatarReais(c.amount_cents)}
                  </td>
                  <td className="pl-numero px-4 py-3">{c.failure_count_12m}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {contratos.length === 200 && (
        <p className="text-[13px] text-texto-medio">
          Mostrando os 200 mais recentes.
        </p>
      )}
    </div>
  );
}

function Cabecalho({ termo }: { termo: string }) {
  return (
    <div>
      <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Base
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        Cada {termo} que paga mensalidade hoje, e como cada um está sendo
        cobrado.
      </p>
    </div>
  );
}
