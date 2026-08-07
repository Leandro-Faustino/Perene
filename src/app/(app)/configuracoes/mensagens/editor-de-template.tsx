"use client";

import { useActionState } from "react";

import { Botao } from "@/components/ui/botao";
import { salvarTemplate, salvarNotificacao, salvarNicho, type ResultadoDeSalvamento } from "./acoes";

const OPCOES_NICHO = [
  { valor: "academia",   rotulo: "Academia / Studio",          exemplo: "mensalidade, aluno" },
  { valor: "clinica",    rotulo: "Clínica / Consultório",      exemplo: "plano, paciente" },
  { valor: "condominio", rotulo: "Condomínio / Administradora", exemplo: "taxa condominial, morador" },
  { valor: "escola",     rotulo: "Escola / Curso",             exemplo: "mensalidade escolar, aluno" },
  { valor: "clube",      rotulo: "Clube / Associação",         exemplo: "mensalidade, associado" },
  { valor: "outro",      rotulo: "Outro",                      exemplo: "serviço, cliente" },
] as const;

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
            className="w-full resize-y rounded-md border bg-superficie px-3 py-2 font-mono text-[13px] text-foreground placeholder:text-texto-medio/50 focus:outline-none focus:ring-2 focus:ring-cobalto focus:ring-offset-1"
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
                  ? "text-[12px] text-ativo-texto"
                  : "text-[12px] text-risco-texto"
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
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-superficie px-3 py-2 text-[12px] text-texto-medio">
            {exemploPadrao}
          </pre>
        </details>
      )}
    </div>
  );
}

export function SeletorDeNicho({ nichoAtual }: { nichoAtual: string | null }) {
  const [estado, acao, pendente] = useActionState<
    ResultadoDeSalvamento | null,
    FormData
  >(salvarNicho, null);

  return (
    <div className="rounded-lg border bg-background p-5">
      <p className="text-[14px] font-medium text-foreground">Segmento de mercado</p>
      <p className="mt-0.5 text-[13px] text-texto-medio">
        Define o vocabulário padrão das mensagens —{" "}
        <span className="font-medium text-foreground">aluno</span>,{" "}
        <span className="font-medium text-foreground">paciente</span>,{" "}
        <span className="font-medium text-foreground">morador</span> — e adapta o tom de
        cada mensagem ao contexto do seu negócio. Você pode sobrescrever qualquer texto
        individualmente abaixo.
      </p>

      <form action={acao} className="mt-4 space-y-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {OPCOES_NICHO.map((op) => {
            const selecionado = nichoAtual === op.valor;
            return (
              <label
                key={op.valor}
                className={[
                  "flex cursor-pointer flex-col gap-0.5 rounded-lg border px-4 py-3 transition-colors",
                  selecionado
                    ? "border-cobalto bg-cobalto-bg"
                    : "border-borda bg-superficie hover:border-borda-media",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="nicho"
                  value={op.valor}
                  defaultChecked={selecionado}
                  className="sr-only"
                />
                <span className="text-[13px] font-medium text-foreground">{op.rotulo}</span>
                <span className="text-[11px] text-texto-medio">{op.exemplo}</span>
              </label>
            );
          })}

          {/* Opção "sem nicho" */}
          <label
            className={[
              "flex cursor-pointer flex-col gap-0.5 rounded-lg border px-4 py-3 transition-colors",
              !nichoAtual
                ? "border-cobalto bg-cobalto-bg"
                : "border-borda bg-superficie hover:border-borda-media",
            ].join(" ")}
          >
            <input
              type="radio"
              name="nicho"
              value=""
              defaultChecked={!nichoAtual}
              className="sr-only"
            />
            <span className="text-[13px] font-medium text-foreground">Genérico</span>
            <span className="text-[11px] text-texto-medio">sem nicho selecionado</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Botao type="submit" tamanho="pequeno" disabled={pendente}>
            {pendente ? "Salvando…" : "Salvar segmento"}
          </Botao>
          {estado && (
            <span
              className={
                estado.ok ? "text-[12px] text-ativo-texto" : "text-[12px] text-risco-texto"
              }
            >
              {estado.mensagem}
            </span>
          )}
        </div>
      </form>
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
          className="w-full max-w-xs rounded-md border bg-superficie px-3 py-2 text-[14px] text-foreground placeholder:text-texto-medio/50 focus:outline-none focus:ring-2 focus:ring-cobalto focus:ring-offset-1"
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
                ? "text-[12px] text-ativo-texto"
                : "text-[12px] text-risco-texto"
            }
          >
            {estado.mensagem}
          </span>
        )}
      </div>
    </form>
  );
}
