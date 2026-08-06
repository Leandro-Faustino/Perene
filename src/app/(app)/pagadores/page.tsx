import Link from "next/link";

import { supabaseServidor } from "@/lib/supabase/server";
import { SeloDeEstado } from "@/components/ui/selo-de-estado";
import { formatarReais } from "@/lib/utils";

export const metadata = { title: "Base" };

export default async function PaginaDaPagadores() {
  const supa = supabaseServidor();

  const { data: pagadores } = await supa
    .from("payers")
    .select(
      `id, name, email, phone_e164,
       contracts ( id, amount_cents, status, current_method, migrated_at )`,
    )
    .order("name");

  const lista = (pagadores ?? []) as unknown as {
    id: string;
    name: string;
    email: string | null;
    phone_e164: string | null;
    contracts: {
      id: string;
      amount_cents: number;
      status: string;
      current_method: string;
      migrated_at: string | null;
    }[];
  }[];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Cabecalho total={lista.length} />

      {lista.length === 0 ? (
        <div className="rounded-lg border bg-background px-6 py-12 text-center">
          <p className="font-titulo text-[18px] font-medium text-foreground">
            Base vazia
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[14px] text-texto-medio">
            Importe sua base de pagadores pelo onboarding para começar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-[14px]">
            <thead className="bg-[var(--pl-superficie)]">
              <tr>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Pagador
                </th>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Contato
                </th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Contratos
                </th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Valor total
                </th>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Método
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((pagador) => {
                const ativos = pagador.contracts.filter(
                  (c) => c.status === "active",
                );
                const totalCentavos = ativos.reduce(
                  (s, c) => s + c.amount_cents,
                  0,
                );
                const migrado = ativos.some((c) => c.migrated_at);
                const temPix = ativos.some(
                  (c) => c.current_method === "pix_automatico",
                );

                return (
                  <tr
                    key={pagador.id}
                    className="border-t hover:bg-[var(--pl-superficie)]/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/pagadores/${pagador.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {pagador.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-texto-medio">
                      {pagador.phone_e164 ?? pagador.email ?? "—"}
                    </td>
                    <td className="pl-numero px-4 py-3 text-right text-texto-medio">
                      {ativos.length}
                    </td>
                    <td className="pl-numero px-4 py-3 text-right font-medium text-foreground">
                      {totalCentavos > 0 ? formatarReais(totalCentavos) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {temPix ? (
                        <SeloDeEstado estado="ativo">Pix automático</SeloDeEstado>
                      ) : migrado ? (
                        <SeloDeEstado estado="ativo">Migrado</SeloDeEstado>
                      ) : (
                        <SeloDeEstado estado="neutro">Outro</SeloDeEstado>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Cabecalho({ total }: { total: number }) {
  return (
    <div>
      <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Base
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        Pagadores e contratos da sua organização.
        {total > 0 && (
          <span className="text-texto-medio">
            {" "}
            {total} {total === 1 ? "pagador" : "pagadores"} cadastrados.
          </span>
        )}
      </p>
    </div>
  );
}
