import Link from "next/link";

import { supabaseServidor } from "@/lib/supabase/server";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Botao } from "@/components/ui/botao";
import { SeloDeEstado, type Estado } from "@/components/ui/selo-de-estado";

export const metadata = { title: "Mensagens" };

/**
 * Histórico do que foi enviado.
 *
 * Existe por dois motivos, e o segundo é o que justifica a tela: mostrar o que
 * saiu, e provar o que saiu. Quando um pagador diz que não recebeu, ou quando
 * alguém questiona um disparo, a resposta precisa estar aqui com data e texto
 * exatos — é trilha de auditoria, não vaidade.
 */
const ESTADO: Record<string, { estado: Estado; rotulo: string }> = {
  queued: { estado: "pendente", rotulo: "Na fila" },
  sent: { estado: "ativo", rotulo: "Enviada" },
  delivered: { estado: "ativo", rotulo: "Entregue" },
  read: { estado: "ativo", rotulo: "Lida" },
  failed: { estado: "risco", rotulo: "Não saiu" },
};

export default async function PaginaDeMensagens() {
  const supa = supabaseServidor();

  const { data: mensagens } = await supa
    .from("messages")
    .select("id, channel, to_address, body, status, error, created_at, template_key")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!mensagens || mensagens.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Cabecalho />
        <EstadoVazio
          titulo="Nenhuma mensagem enviada ainda"
          descricao="As mensagens da régua aparecem aqui, com o texto exato e o horário. Comece criando uma onda."
          acao={
            <Botao asChild>
              <Link href="/ondas/nova">Criar uma onda</Link>
            </Botao>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Cabecalho />

      <ul className="space-y-3">
        {mensagens.map((m) => {
          const visual = ESTADO[m.status] ?? ESTADO.queued;
          return (
            <li key={m.id} className="rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                <SeloDeEstado estado={visual.estado}>{visual.rotulo}</SeloDeEstado>
                <span className="pl-codigo text-texto-medio">{m.to_address}</span>
                <span className="ml-auto text-[13px] text-texto-medio">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(m.created_at))}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-texto">
                {m.body}
              </p>

              {m.error && (
                <p className="mt-2 text-[13px] text-[var(--pl-risco-texto)]">
                  {m.error}
                </p>
              )}
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
        Mensagens
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        Tudo que saiu, com o texto exato e o horário.
      </p>
    </div>
  );
}
