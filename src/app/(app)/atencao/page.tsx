import { supabaseServidor } from "@/lib/supabase/server";
import { SeloDeEstado } from "@/components/ui/selo-de-estado";
import { Botao } from "@/components/ui/botao";
import { resolverEvento } from "./acoes";

export const metadata = { title: "Precisa de atenção" };

const ROTULO_DO_EVENTO: Record<string, string> = {
  mandate_cancelled: "Autorização cancelada",
  mandate_expired: "Autorização expirada",
  charge_failed_repeated: "Cobrança não passou",
  ceiling_exceeded: "Valor acima do teto",
  integration_error: "Erro de integração",
};

export default async function PaginaDeAtencao() {
  const supa = supabaseServidor();

  const { data: eventos } = await supa
    .from("risk_events")
    .select(
      `id, kind, severity, detail, created_at,
       contracts ( payers ( name ) )`,
    )
    .is("resolved_at", null)
    .order("severity", { ascending: false }) // critical antes de attention
    .order("created_at", { ascending: false })
    .limit(100);

  const lista = (eventos ?? []) as unknown as {
    id: string;
    kind: string;
    severity: "attention" | "critical";
    detail: string | null;
    created_at: string;
    contracts: { payers: { name: string } } | null;
  }[];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Cabecalho total={lista.length} />

      {lista.length === 0 ? (
        <TudoEmOrdem />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-[14px]">
            <thead className="bg-[var(--pl-superficie)]">
              <tr>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Evento
                </th>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Pagador
                </th>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Detalhe
                </th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Quando
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {lista.map((ev) => (
                <tr key={ev.id} className="border-t hover:bg-[var(--pl-superficie)]/50">
                  <td className="px-4 py-3">
                    <SeloDeEstado
                      estado={ev.severity === "critical" ? "risco" : "pendente"}
                    >
                      {ROTULO_DO_EVENTO[ev.kind] ?? ev.kind}
                    </SeloDeEstado>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {ev.contracts?.payers?.name ?? "—"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-texto-medio">
                    <span className="line-clamp-2">{ev.detail ?? "—"}</span>
                  </td>
                  <td className="pl-numero px-4 py-3 text-right text-texto-medio">
                    {formatarData(ev.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await resolverEvento(ev.id);
                      }}
                    >
                      <Botao tamanho="pequeno" variante="secundario" type="submit">
                        Resolver
                      </Botao>
                    </form>
                  </td>
                </tr>
              ))}
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
        Precisa de atenção
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        {total === 0
          ? "Nenhum item pendente agora."
          : `${total} ${total === 1 ? "item que precisa" : "itens que precisam"} de atenção.`}
      </p>
    </div>
  );
}

/**
 * O estado vazio aqui é tão importante quanto o estado cheio — é o Momento da
 * Verdade nº 5 (brand book §3.6): quando a base está saudável e nada acontece,
 * o operador precisa VER que nada acontece, não ficar em dúvida.
 */
function TudoEmOrdem() {
  return (
    <div className="rounded-lg border bg-background px-6 py-16 text-center">
      <p className="font-titulo text-[18px] font-medium text-foreground">
        Tudo em ordem
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[14px] text-texto-medio">
        Nenhum mandato cancelado, nenhuma cobrança com problema, nenhum erro de
        integração. A base está funcionando normalmente.
      </p>
    </div>
  );
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}
