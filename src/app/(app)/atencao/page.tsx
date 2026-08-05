import Link from "next/link";

import { supabaseServidor } from "@/lib/supabase/server";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Botao } from "@/components/ui/botao";
import { SeloDeEstado } from "@/components/ui/selo-de-estado";
import { formatarReais } from "@/lib/utils";

export const metadata = { title: "Precisa de atenção" };

/**
 * A fila "Precisa de atenção" (RF-70, RF-71).
 *
 * O nome importa: nunca "Pendências" nem "Alertas críticos" (§4.3). E cada
 * item precisa de uma AÇÃO clara — uma fila que só informa é relatório, e o
 * brand book é explícito que reportar a falha sem resolver é o que separa
 * relatório de operação.
 *
 * A fila vazia é um dos rituais da marca (§4.4): ela diz com todas as letras
 * que está vazia, em vez de deixar a tela em branco. "Não está acontecendo
 * nada" é a informação mais valiosa que este painel dá num mês bom.
 */
const DESCRICAO: Record<string, { titulo: string; acao: string }> = {
  mandate_cancelled: {
    titulo: "Autorização cancelada",
    acao: "Reenviar autorização",
  },
  mandate_expired: {
    titulo: "Autorização expirou",
    acao: "Reenviar autorização",
  },
  charge_failed_repeated: {
    titulo: "Cobrança não passou",
    acao: "Ver contrato",
  },
  ceiling_exceeded: {
    titulo: "Valor passou do teto autorizado",
    acao: "Pedir nova autorização",
  },
  integration_error: {
    titulo: "Problema na integração",
    acao: "Ver conexões",
  },
};

export default async function PaginaDeAtencao() {
  const supa = supabaseServidor();

  const { data: eventos } = await supa
    .from("risk_events")
    .select(
      `id, kind, severity, detail, created_at,
       contracts ( amount_cents, payers ( name ) )`,
    )
    .is("resolved_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!eventos || eventos.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Cabecalho />
        <EstadoVazio
          titulo="Nada precisa de atenção agora"
          descricao="Nenhuma autorização caiu, nenhuma cobrança falhou. Quando alguma coisa quebrar, ela aparece aqui no mesmo dia — e você recebe um aviso, sem precisar entrar."
          acao={
            <Botao asChild variante="secundario">
              <Link href="/dashboard">Ver o diagnóstico</Link>
            </Botao>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Cabecalho />

      <ul className="space-y-3">
        {eventos.map((evento) => {
          const contrato = evento.contracts as unknown as {
            amount_cents: number;
            payers: { name: string } | null;
          } | null;
          const descricao = DESCRICAO[evento.kind] ?? {
            titulo: "Precisa de atenção",
            acao: "Ver contrato",
          };

          return (
            <li
              key={evento.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-background p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <SeloDeEstado
                    estado={evento.severity === "critical" ? "risco" : "pendente"}
                  >
                    {descricao.titulo}
                  </SeloDeEstado>
                  {contrato?.payers?.name && (
                    <span className="text-[15px] font-medium text-foreground">
                      {contrato.payers.name}
                    </span>
                  )}
                  {contrato?.amount_cents != null && (
                    <span className="pl-numero text-[14px] text-texto">
                      {formatarReais(contrato.amount_cents)}
                    </span>
                  )}
                </div>
                {evento.detail && (
                  <p className="mt-1.5 text-[14px] text-texto">{evento.detail}</p>
                )}
                <p className="mt-1 text-[13px] text-texto-medio">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(evento.created_at))}
                </p>
              </div>

              <Botao variante="secundario" tamanho="pequeno">
                {descricao.acao}
              </Botao>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Cabecalho() {
  return (
    <div>
      <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Precisa de atenção
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        Autorização não é troféu, é estado. Quando uma quebra, ela aparece aqui
        no mesmo dia.
      </p>
    </div>
  );
}
