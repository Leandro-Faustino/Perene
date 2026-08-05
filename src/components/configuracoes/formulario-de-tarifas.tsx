"use client";

import { useActionState } from "react";

import { salvarTarifas, type EstadoDasTarifas } from "@/app/(app)/configuracoes/acoes";
import { Botao } from "@/components/ui/botao";
import { rotulo } from "@/lib/domain/diagnostico";
import type { MetodoPagamento } from "@/lib/gateways/types";

export interface TarifaAtual {
  metodo: MetodoPagamento;
  percentual: number;
  fixoEmReais: number;
  origem: string;
  daOrganizacao: boolean;
}

export function FormularioDeTarifas({ tarifas }: { tarifas: TarifaAtual[] }) {
  const [estado, acao, pendente] = useActionState<EstadoDasTarifas | null, FormData>(
    salvarTarifas,
    null,
  );

  return (
    <form action={acao} className="mt-6 space-y-5">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-[14px]">
          <thead className="bg-[var(--pl-superficie)]">
            <tr>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Método
              </th>
              <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Percentual
              </th>
              <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                Fixo por cobrança
              </th>
            </tr>
          </thead>
          <tbody>
            {tarifas.map((t) => (
              <tr key={t.metodo} className="border-t">
                <td className="px-4 py-3">
                  <span className="text-foreground">{rotulo(t.metodo)}</span>
                  {/* A origem fica visível: é o que permite ao operador saber
                      se o número do diagnóstico é dele ou nosso (§4.2). */}
                  <span className="mt-0.5 block text-[13px] text-texto-medio">
                    {t.origem}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <input
                      name={`${t.metodo}_percentual`}
                      type="number"
                      step="0.01"
                      min={0}
                      defaultValue={t.daOrganizacao ? t.percentual : undefined}
                      placeholder={String(t.percentual)}
                      className="pl-numero w-24 rounded-md border bg-background px-2 py-1.5 outline-none focus:ring-2 focus:ring-[var(--pl-cobalto)]"
                    />
                    <span className="text-texto-medio">%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <span className="text-texto-medio">R$</span>
                    <input
                      name={`${t.metodo}_fixo`}
                      type="number"
                      step="0.01"
                      min={0}
                      defaultValue={t.daOrganizacao ? t.fixoEmReais : undefined}
                      placeholder={String(t.fixoEmReais)}
                      className="pl-numero w-24 rounded-md border bg-background px-2 py-1.5 outline-none focus:ring-2 focus:ring-[var(--pl-cobalto)]"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[13px] text-texto-medio">
        Campo em branco mantém o valor de referência que aparece em cinza.
      </p>

      {estado && (
        <p
          role="status"
          className={
            estado.ok
              ? "rounded-md bg-[var(--pl-ativo-bg)] px-3 py-2.5 text-[14px] text-[var(--pl-ativo-texto)]"
              : "rounded-md bg-[var(--pl-risco-bg)] px-3 py-2.5 text-[14px] text-[var(--pl-risco-texto)]"
          }
        >
          {estado.mensagem}
        </p>
      )}

      <Botao type="submit" disabled={pendente}>
        {pendente ? "Salvando…" : "Salvar tarifas"}
      </Botao>
    </form>
  );
}
