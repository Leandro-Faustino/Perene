"use client";

import { useActionState } from "react";

import { Botao } from "@/components/ui/botao";
import { salvarTemplate, salvarNotificacao, type ResultadoDeSalvamento } from "./acoes";

interface Props {
  chave: string;
  rotulo: string;
  descricao: string;
  variaveis: string;
  corpoAtual: string; // custom salvo, ou "" se usando padrão
  exemploPadrao: string; // texto hardcoded renderizado com dados de exemplo
}

export function EditorDeTemplate({
  chave,
  rotulo,
  descricao,
  variaveis,
  corpoAtual,
  exemploPadrao,
}: Props) {
  const [estado, acao, pendente] = useActionState<
    ResultadoDeSalvamento | null,
    FormData
  >(salvarTemplate, null);

  const temCustom = corpoAtual.length > 0;

  return (
    <div className="rounded-lg border bg-background p-5">
      <div className="mb-3">
        <p className="text-[14px] font-medium text-foreground">{rotulo}</p>
        <p className="mt-0.5 text-[13px] text-texto-medio">{descricao}</p>
      </div>

      <form action={acao} className="space-y-3">
        <input type="hidden" name="key" value={chave} />

        <div>
          <textarea
            name="body"
            rows={6}
            defaultValue={corpoAtual}
            placeholder={exemploPadrao}
            className="w-full resize-y rounded-md border bg-[var(--pl-superficie)] px-3 py-2 font-mono text-[13px] text-foreground placeholder:text-texto-medio/50 focus:outline-none focus:ring-2 focus:ring-[var(--pl-cobalto)] focus:ring-offset-1"
            aria-label={`Corpo do template ${rotulo}`}
          />
          <p className="mt-1 text-[11px] text-texto-medio">
            Variáveis disponíveis:{" "}
            <span className="font-mono">{variaveis}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Botao type="submit" tamanho="pequeno" disabled={pendente}>
            {pendente ? "Salvando…" : "Salvar"}
          </Botao>

          {temCustom && (
            <Botao
              type="submit"
              variante="fantasma"
              tamanho="pequeno"
              disabled={pendente}
              onClick={(e) => {
                const form = e.currentTarget.closest("form") as HTMLFormElement;
                const textarea = form.querySelector("textarea");
                if (textarea) textarea.value = "";
              }}
            >
              Restaurar padrão
            </Botao>
          )}

          {estado && (
            <span
              className={
                estado.ok
                  ? "text-[12px] text-[var(--pl-ativo-texto)]"
                  : "text-[12px] text-[var(--pl-risco-texto)]"
              }
            >
              {estado.mensagem}
            </span>
          )}
        </div>
      </form>

      {!temCustom && (
        <details className="mt-4">
          <summary className="cursor-pointer text-[12px] text-texto-medio hover:text-foreground">
            Ver texto padrão
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-[var(--pl-superficie)] px-3 py-2 text-[12px] text-texto-medio">
            {exemploPadrao}
          </pre>
        </details>
      )}
    </div>
  );
}

export function FormularioDeNotificacao({
  telefoneAtual,
}: {
  telefoneAtual: string | null;
}) {
  const [estado, acao, pendente] = useActionState<
    ResultadoDeSalvamento | null,
    FormData
  >(salvarNotificacao, null);

  return (
    <form action={acao} className="space-y-3">
      <div>
        <label
          htmlFor="notification_phone"
          className="mb-1 block text-[13px] font-medium text-foreground"
        >
          WhatsApp de notificação
        </label>
        <input
          id="notification_phone"
          name="notification_phone"
          type="tel"
          defaultValue={telefoneAtual ?? ""}
          placeholder="+5511999999999"
          className="w-full max-w-xs rounded-md border bg-[var(--pl-superficie)] px-3 py-2 text-[14px] text-foreground placeholder:text-texto-medio/50 focus:outline-none focus:ring-2 focus:ring-[var(--pl-cobalto)] focus:ring-offset-1"
        />
        <p className="mt-1 text-[12px] text-texto-medio">
          Recebe alertas críticos e o resumo diário. Deixe em branco para
          desativar.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Botao type="submit" tamanho="pequeno" disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar"}
        </Botao>
        {estado && (
          <span
            className={
              estado.ok
                ? "text-[12px] text-[var(--pl-ativo-texto)]"
                : "text-[12px] text-[var(--pl-risco-texto)]"
            }
          >
            {estado.mensagem}
          </span>
        )}
      </div>
    </form>
  );
}
