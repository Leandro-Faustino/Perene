import Link from "next/link";

import { supabaseServidor } from "@/lib/supabase/server";
import { Botao } from "@/components/ui/botao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { SeloDeEstado, type Estado } from "@/components/ui/selo-de-estado";

export const metadata = { title: "Ondas" };

const ESTADO_DA_ONDA: Record<string, { estado: Estado; rotulo: string }> = {
  draft: { estado: "neutro", rotulo: "Rascunho" },
  running: { estado: "pendente", rotulo: "Em andamento" },
  paused: { estado: "neutro", rotulo: "Pausada" },
  done: { estado: "ativo", rotulo: "Encerrada" },
};

export default async function PaginaDeOndas() {
  const supa = supabaseServidor();

  const { data: ondas } = await supa
    .from("waves")
    .select("id, name, status, started_at, daily_limit, invitations ( status )")
    .order("created_at", { ascending: false });

  if (!ondas || ondas.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Cabecalho />
        <EstadoVazio
          titulo="Nenhuma onda ainda"
          descricao="Uma onda é um lote de contratos convidados a migrar, com régua e limite diário. Você escolhe quem entra, e a gente convida, lembra e acompanha."
          acao={
            <Botao asChild>
              <Link href="/ondas/nova">Criar a primeira onda</Link>
            </Botao>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Cabecalho />
        <Botao asChild>
          <Link href="/ondas/nova">Nova onda</Link>
        </Botao>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-[14px]">
          <thead className="bg-superficie">
            <tr>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Onda
              </th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Situação
              </th>
              <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Convidados
              </th>
              <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Autorizaram
              </th>
            </tr>
          </thead>
          <tbody>
            {ondas.map((onda) => {
              const convites = (onda.invitations ?? []) as unknown as {
                status: string;
              }[];
              const autorizados = convites.filter(
                (c) => c.status === "authorized",
              ).length;
              const visual = ESTADO_DA_ONDA[onda.status] ?? ESTADO_DA_ONDA.draft;

              return (
                <tr key={onda.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link
                      href={`/ondas/${onda.id}`}
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {onda.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <SeloDeEstado estado={visual.estado}>
                      {visual.rotulo}
                    </SeloDeEstado>
                  </td>
                  <td className="pl-numero px-4 py-3">{convites.length}</td>
                  <td className="pl-numero px-4 py-3 font-medium text-foreground">
                    {autorizados}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cabecalho() {
  return (
    <div>
      <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Ondas
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        Ninguém migra 400 pessoas sozinho. A onda convida, lembra e acompanha.
      </p>
    </div>
  );
}
