"use client";

import { useActionState } from "react";

import { Botao } from "@/components/ui/botao";
import { reajustarContrato, type ResultadoDoReajuste } from "./acoes";

interface Props {
  contractId: string;
  valorAtualCentavos: number;
  ceilingCents: number | null;
}

export function FormularioDeReajuste({
  contractId,
  valorAtualCentavos,
  ceilingCents,
}: Props) {
  const [estado, acao, pendente] = useActionState<
    ResultadoDoReajuste | null,
    FormData
  >(reajustarContrato, null);

  const valorAtualReais = (valorAtualCentavos / 100).toFixed(2).replace(".", ",");

  return (
    <form action={acao} className="mt-3 flex items-end gap-2">
      <input type="hidden" name="contractId" value={contractId} />

      <div className="flex-1">
        <label
          htmlFor={`valor-${contractId}`}
          className="mb-1 block text-[12px] font-medium text-texto-medio"
        >
          Novo valor (R$)
        </label>
        <div className="flex items-center rounded-md border bg-[var(--pl-superficie)] px-3 focus-within:ring-2 focus-within:ring-[var(--pl-cobalto)] focus-within:ring-offset-1">
          <span className="pr-1 text-[13px] text-texto-medio">R$</span>
          <input
            id={`valor-${contractId}`}
            name="novoValorReais"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={(valorAtualCentavos / 100).toFixed(2)}
            className="w-full bg-transparent py-2 pl-0 pr-1 text-[14px] tabular-nums text-foreground outline-none"
            aria-describedby={estado ? `feedback-${contractId}` : undefined}
          />
        </div>
        {ceilingCents && (
          <p className="mt-0.5 text-[11px] text-texto-medio">
            Teto autorizado: R$ {(ceilingCents / 100).toFixed(2).replace(".", ",")}
            {" "}— acima disso exige reautorização do pagador.
          </p>
        )}
      </div>

      <Botao
        type="submit"
        variante="secundario"
        tamanho="pequeno"
        disabled={pendente}
        className="shrink-0"
      >
        {pendente ? "Salvando…" : "Salvar"}
      </Botao>

      {estado && (
        <p
          id={`feedback-${contractId}`}
          className={
            estado.ok
              ? "text-[12px] text-[var(--pl-ativo-texto)]"
              : "text-[12px] text-[var(--pl-risco-texto)]"
          }
        >
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
