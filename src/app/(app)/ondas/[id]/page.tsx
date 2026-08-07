import { notFound } from "next/navigation";

import { supabaseServidor } from "@/lib/supabase/server";
import { SeloDeEstado, type Estado } from "@/components/ui/selo-de-estado";
import { formatarPercentual } from "@/lib/utils";

export const metadata = { title: "Onda" };

const ESTADO_DO_CONVITE: Record<string, { estado: Estado; rotulo: string }> = {
  pending: { estado: "pendente", rotulo: "Convite enviado" },
  opened: { estado: "pendente", rotulo: "Abriu, não autorizou" },
  authorized: { estado: "ativo", rotulo: "Autorizou" },
  declined: { estado: "risco", rotulo: "Recusou" },
  expired: { estado: "neutro", rotulo: "Expirou" },
};

export default async function PaginaDaOnda({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supa = supabaseServidor();

  const { data: onda } = await supa
    .from("waves")
    .select(
      `id, name, status, daily_limit, started_at,
       invitations ( id, status, opened_at,
                     contracts ( amount_cents, payers ( name ) ) )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!onda) notFound();

  const convites = (onda.invitations ?? []) as unknown as {
    id: string;
    status: string;
    opened_at: string | null;
    contracts: { amount_cents: number; payers: { name: string } };
  }[];

  const autorizados = convites.filter((c) => c.status === "authorized").length;
  const adesao = convites.length > 0 ? autorizados / convites.length : 0;

  const porEstado = new Map<string, number>();
  for (const c of convites) {
    porEstado.set(c.status, (porEstado.get(c.status) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
          {onda.name}
        </h1>
        <p className="mt-1 text-[15px] text-texto">
          {convites.length} convidados · limite de {onda.daily_limit} por dia
        </p>
      </div>

      {/* A adesão da onda. É o número que o operador vai levar para o sócio, e
          o que mata a objeção nº 1 — o medo de perder cliente na migração. */}
      <section className="rounded-lg border bg-background p-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
          Adesão
        </p>
        <p className="pl-numero mt-2 text-left font-titulo text-[48px] font-bold leading-none text-foreground">
          {formatarPercentual(adesao)}
        </p>
        <p className="mt-2 text-[15px] text-texto">
          <span className="pl-numero">{autorizados}</span> de{" "}
          <span className="pl-numero">{convites.length}</span> autorizaram até
          agora.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[...porEstado.entries()].map(([estado, quantidade]) => {
            const visual = ESTADO_DO_CONVITE[estado] ?? ESTADO_DO_CONVITE.pending;
            return (
              <SeloDeEstado key={estado} estado={visual.estado}>
                {quantidade} {visual.rotulo}
              </SeloDeEstado>
            );
          })}
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border">
        <table className="w-full text-[14px]">
          <thead className="bg-superficie">
            <tr>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Pagador
              </th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Situação
              </th>
            </tr>
          </thead>
          <tbody>
            {convites.map((c) => {
              const visual = ESTADO_DO_CONVITE[c.status] ?? ESTADO_DO_CONVITE.pending;
              return (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 text-foreground">
                    {c.contracts?.payers?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <SeloDeEstado estado={visual.estado}>
                      {visual.rotulo}
                    </SeloDeEstado>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
