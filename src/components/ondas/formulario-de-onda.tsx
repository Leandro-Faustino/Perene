"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { criarOnda, type EstadoDaOnda } from "@/app/(app)/ondas/acoes";
import { Botao } from "@/components/ui/botao";
import { rotulo } from "@/lib/domain/diagnostico";
import type { PreviaDaOnda } from "@/app/(app)/ondas/acoes";
import { formatarReais } from "@/lib/utils";

const METODOS = ["card", "boleto", "pix_manual", "debito_automatico"] as const;

export function FormularioDeOnda({ previaInicial }: { previaInicial: PreviaDaOnda }) {
  const router = useRouter();
  const [estado, acao, pendente] = useActionState<EstadoDaOnda | null, FormData>(
    criarOnda,
    null,
  );

  useEffect(() => {
    if (estado?.ok && estado.waveId) router.push(`/ondas/${estado.waveId}`);
  }, [estado, router]);

  return (
    <form action={acao} className="mt-8 space-y-6">
      <div>
        <label htmlFor="nome" className="block text-[14px] font-medium text-foreground">
          Nome da onda
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue="Primeira onda"
          className="mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-cobalto"
        />
        <p className="mt-1.5 text-[13px] text-texto-medio">
          Só para você se localizar depois.
        </p>
      </div>

      <fieldset>
        <legend className="text-[14px] font-medium text-foreground">
          Quem entra
        </legend>
        <p className="mt-1 text-[13px] text-texto-medio">
          Sem marcar nada, entram todos os métodos migráveis.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {METODOS.map((m) => (
            <label key={m} className="flex items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                name="metodos"
                value={m}
                className="accent-cobalto"
              />
              {rotulo(m)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="valorMinimo" className="block text-[14px] font-medium text-foreground">
            Valor mínimo (R$)
          </label>
          <input
            id="valorMinimo"
            name="valorMinimo"
            type="number"
            min={0}
            step="0.01"
            placeholder="sem mínimo"
            className="pl-numero mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-cobalto"
          />
        </div>
        <div>
          <label htmlFor="falhasMinimas" className="block text-[14px] font-medium text-foreground">
            Mínimo de falhas em 12 meses
          </label>
          <input
            id="falhasMinimas"
            name="falhasMinimas"
            type="number"
            min={0}
            placeholder="sem mínimo"
            className="pl-numero mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-cobalto"
          />
        </div>
      </div>

      <div>
        <label htmlFor="limiteDiario" className="block text-[14px] font-medium text-foreground">
          Limite de convites por dia
        </label>
        <input
          id="limiteDiario"
          name="limiteDiario"
          type="number"
          min={1}
          max={1000}
          defaultValue={100}
          className="pl-numero mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-cobalto"
        />
        {/* O limite não é sobre educação: disparar centenas de mensagens de
            uma vez é o caminho mais curto para o bloqueio do número. */}
        <p className="mt-1.5 text-[13px] text-texto-medio">
          Espalhar os convites protege seu número de WhatsApp. Cem por dia é um
          ritmo seguro.
        </p>
      </div>

      <div className="rounded-lg border bg-superficie p-4">
        <p className="text-[14px] text-texto">
          Com sua base de hoje, e sem filtro nenhum:{" "}
          <strong className="pl-numero text-foreground">
            {previaInicial.elegiveis}
          </strong>{" "}
          contratos entrariam, somando{" "}
          <strong className="pl-numero text-foreground">
            {formatarReais(previaInicial.valorMensalEmJogoCentavos)}
          </strong>{" "}
          por mês.
        </p>
        {previaInicial.motivos.length > 0 && (
          <ul className="mt-2 space-y-1 text-[13px] text-texto-medio">
            {previaInicial.motivos.map((m) => (
              <li key={m.motivo}>
                {m.quantidade} de fora: {m.motivo}
              </li>
            ))}
          </ul>
        )}
      </div>

      {estado && !estado.ok && (
        <p
          role="alert"
          className="rounded-md bg-risco-bg px-3 py-2.5 text-[14px] text-risco-texto"
        >
          {estado.mensagem}
        </p>
      )}

      <Botao type="submit" tamanho="site" disabled={pendente}>
        {pendente ? "Criando a onda…" : "Criar onda e começar a convidar"}
      </Botao>
    </form>
  );
}
