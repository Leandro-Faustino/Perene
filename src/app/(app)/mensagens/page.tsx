import { supabaseServidor } from "@/lib/supabase/server";
import { SeloDeEstado, type Estado } from "@/components/ui/selo-de-estado";

export const metadata = { title: "Mensagens" };

const ROTULO_DO_TEMPLATE: Record<string, string> = {
  convite_d0: "Convite — D0",
  convite_d2: "Convite — D+2",
  convite_d5: "Convite — D+5",
  convite_d10: "Convite — D+10",
  pix_avulso: "Pix avulso",
  aviso_pre_cobranca: "Aviso pré-débito",
};

const ESTADO_DA_MENSAGEM: Record<string, { estado: Estado; rotulo: string }> = {
  queued: { estado: "neutro", rotulo: "Na fila" },
  sent: { estado: "pendente", rotulo: "Enviada" },
  delivered: { estado: "ativo", rotulo: "Entregue" },
  read: { estado: "ativo", rotulo: "Lida" },
  failed: { estado: "risco", rotulo: "Falhou" },
};

export default async function PaginaDeMensagens() {
  const supa = supabaseServidor();

  const { data: mensagens } = await supa
    .from("messages")
    .select(
      `id, template_key, channel, to_address, status, sent_at, created_at, error,
       payers ( name )`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const lista = (mensagens ?? []) as unknown as {
    id: string;
    template_key: string | null;
    channel: string;
    to_address: string;
    status: string;
    sent_at: string | null;
    created_at: string;
    error: string | null;
    payers: { name: string } | null;
  }[];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Cabecalho total={lista.length} />

      {lista.length === 0 ? (
        <div className="rounded-lg border bg-background px-6 py-12 text-center">
          <p className="font-titulo text-[18px] font-medium text-foreground">
            Nenhuma mensagem ainda
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[14px] text-texto-medio">
            As mensagens enviadas pela régua e pelo cron de cobrança aparecem
            aqui com o status em tempo real.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-[14px]">
            <thead className="bg-[var(--pl-superficie)]">
              <tr>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Template
                </th>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Pagador
                </th>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Para
                </th>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Situação
                </th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Enviada em
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((msg) => {
                const visual =
                  ESTADO_DA_MENSAGEM[msg.status] ?? ESTADO_DA_MENSAGEM.queued;
                return (
                  <tr key={msg.id} className="border-t hover:bg-[var(--pl-superficie)]/50">
                    <td className="px-4 py-3">
                      <span className="text-foreground">
                        {ROTULO_DO_TEMPLATE[msg.template_key ?? ""] ??
                          msg.template_key ?? "—"}
                      </span>
                      <span className="mt-0.5 block text-[12px] capitalize text-texto-medio">
                        {msg.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {msg.payers?.name ?? "—"}
                    </td>
                    <td className="pl-codigo px-4 py-3 text-texto-medio">
                      {mascararEndereco(msg.to_address)}
                    </td>
                    <td className="px-4 py-3">
                      <SeloDeEstado estado={visual.estado}>
                        {visual.rotulo}
                      </SeloDeEstado>
                      {msg.status === "failed" && msg.error && (
                        <span
                          className="mt-0.5 block max-w-[200px] truncate text-[11px] text-[var(--pl-risco-texto)]"
                          title={msg.error}
                        >
                          {msg.error}
                        </span>
                      )}
                    </td>
                    <td className="pl-numero px-4 py-3 text-right text-texto-medio">
                      {msg.sent_at
                        ? formatarData(msg.sent_at)
                        : formatarData(msg.created_at)}
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
        Mensagens
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        Histórico de mensagens enviadas pela régua e pelo ciclo de cobrança.
        {total > 0 && (
          <span className="text-texto-medio">
            {" "}
            Mostrando as {total} mais recentes.
          </span>
        )}
      </p>
    </div>
  );
}

/** Oculta parte do número/e-mail: +5511●●●●●7777. */
function mascararEndereco(endereco: string): string {
  if (endereco.startsWith("+")) {
    const visivel = 4;
    return (
      endereco.slice(0, visivel + 3) +
      "●●●●●" +
      endereco.slice(-visivel)
    );
  }
  const [local, dominio] = endereco.split("@");
  if (dominio) {
    return `${local.slice(0, 2)}●●●@${dominio}`;
  }
  return endereco;
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
