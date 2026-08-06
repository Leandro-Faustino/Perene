import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { supabaseServidor } from "@/lib/supabase/server";
import { SeloDeEstado } from "@/components/ui/selo-de-estado";
import { formatarReais } from "@/lib/utils";
import { FormularioDeReajuste } from "./formulario-reajuste";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supa = supabaseServidor();
  const { data } = await supa
    .from("payers")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  return { title: data?.name ?? "Pagador" };
}

const ROTULO_METODO: Record<string, string> = {
  pix_automatico: "Pix automático",
  pix_manual: "Pix manual",
  boleto: "Boleto",
  card: "Cartão",
  debito_automatico: "Débito automático",
  other: "Outro",
};

const ROTULO_STATUS_MANDATO: Record<string, string> = {
  authorized: "Autorizado",
  pending: "Aguardando",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
  expired: "Expirado",
};

export default async function PaginaDoPagador({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supa = supabaseServidor();

  const { data: pagador } = await supa
    .from("payers")
    .select(
      `id, name, email, phone_e164, tax_id, created_at,
       contracts (
         id, description, amount_cents, current_method, status, due_day,
         failure_count_12m,
         mandates ( id, status, ceiling_cents, authorized_at )
       )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!pagador) notFound();

  const contratos = (pagador.contracts ?? []) as unknown as {
    id: string;
    description: string | null;
    amount_cents: number;
    current_method: string;
    status: string;
    due_day: number | null;
    failure_count_12m: number;
    mandates: {
      id: string;
      status: string;
      ceiling_cents: number | null;
      authorized_at: string | null;
    }[];
  }[];

  const ativos = contratos.filter((c) => c.status === "active");
  const inativos = contratos.filter((c) => c.status !== "active");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/pagadores"
          className="inline-flex items-center gap-1 text-[13px] text-texto-medio hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
          Base
        </Link>
      </div>

      {/* Cabeçalho do pagador */}
      <div>
        <h1 className="font-titulo text-[28px] font-semibold leading-tight text-foreground">
          {pagador.name}
        </h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-texto-medio">
          {pagador.phone_e164 && <span>{pagador.phone_e164}</span>}
          {pagador.email && <span>{pagador.email}</span>}
          {pagador.tax_id && <span>CPF: {formatarCpf(pagador.tax_id)}</span>}
        </div>
      </div>

      {/* Contratos ativos */}
      {ativos.length === 0 ? (
        <div className="rounded-lg border bg-background px-6 py-10 text-center">
          <p className="text-[14px] text-texto-medio">
            Nenhum contrato ativo para este pagador.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
            Contratos ativos
          </h2>
          {ativos.map((contrato) => {
            const mandatoAtivo = contrato.mandates.find(
              (m) => m.status === "authorized",
            );
            const mandatoUltimo = contrato.mandates[0] ?? null;

            return (
              <div
                key={contrato.id}
                className="rounded-lg border bg-background p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-medium text-foreground">
                      {contrato.description ?? ROTULO_METODO[contrato.current_method]}
                    </p>
                    <p className="mt-0.5 text-[13px] text-texto-medio">
                      {ROTULO_METODO[contrato.current_method]}
                      {contrato.due_day && ` · vence todo dia ${contrato.due_day}`}
                      {contrato.failure_count_12m > 0 && (
                        <span className="ml-2 text-[var(--pl-risco-texto)]">
                          {contrato.failure_count_12m} falha
                          {contrato.failure_count_12m > 1 ? "s" : ""} nos últimos 12 meses
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="pl-numero shrink-0 text-[20px] font-semibold text-foreground">
                    {formatarReais(contrato.amount_cents)}
                  </span>
                </div>

                {/* Status do mandato */}
                {mandatoUltimo && (
                  <div className="mt-3 flex items-center gap-2">
                    <SeloDeEstado
                      estado={
                        mandatoAtivo
                          ? "ativo"
                          : mandatoUltimo.status === "pending"
                            ? "pendente"
                            : "risco"
                      }
                    >
                      {ROTULO_STATUS_MANDATO[mandatoUltimo.status] ??
                        mandatoUltimo.status}
                    </SeloDeEstado>
                    {mandatoAtivo?.ceiling_cents && (
                      <span className="text-[12px] text-texto-medio">
                        Teto: {formatarReais(mandatoAtivo.ceiling_cents)}
                      </span>
                    )}
                  </div>
                )}

                {/* Formulário de reajuste */}
                <FormularioDeReajuste
                  contractId={contrato.id}
                  valorAtualCentavos={contrato.amount_cents}
                  ceilingCents={mandatoAtivo?.ceiling_cents ?? null}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Contratos inativos */}
      {inativos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
            Inativos
          </h2>
          {inativos.map((contrato) => (
            <div
              key={contrato.id}
              className="flex items-center justify-between rounded-lg border bg-background px-5 py-3 opacity-60"
            >
              <p className="text-[14px] text-foreground">
                {contrato.description ?? ROTULO_METODO[contrato.current_method]}
              </p>
              <div className="flex items-center gap-3">
                <SeloDeEstado estado="neutro">
                  {contrato.status === "paused" ? "Pausado" : "Cancelado"}
                </SeloDeEstado>
                <span className="pl-numero text-[14px] text-texto-medio">
                  {formatarReais(contrato.amount_cents)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatarCpf(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length !== 11) return digits;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
