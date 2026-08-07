"use client";

import { useActionState } from "react";

import {
  conectarGateway,
  type EstadoDaConexao,
} from "@/app/(onboarding)/conectar-gateway/acoes";
import { Botao } from "@/components/ui/botao";

export function FormularioDeConexao() {
  const [estado, acao, pendente] = useActionState<EstadoDaConexao | null, FormData>(
    conectarGateway,
    null,
  );

  return (
    <form action={acao} className="mt-8 space-y-5">
      <input type="hidden" name="provider" value="asaas" />

      <div>
        <label
          htmlFor="apiKey"
          className="block text-[14px] font-medium text-foreground"
        >
          Chave de API do Asaas
        </label>
        <input
          id="apiKey"
          name="apiKey"
          type="password"
          required
          autoComplete="off"
          aria-describedby={estado && !estado.ok ? "erro-conexao" : "ajuda-chave"}
          aria-invalid={estado && !estado.ok ? true : undefined}
          className="pl-codigo mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-cobalto"
          placeholder="$aact_..."
        />
        {/* Legenda em --pl-texto-medio, nunca em texto fraco: carrega
            informação, e informação não é letra miúda (§5.2). */}
        <p id="ajuda-chave" className="mt-1.5 text-[13px] text-texto-medio">
          No Asaas: Configurações → Integrações → Chave de API. A chave é
          guardada criptografada e nunca aparece de volta na tela.
        </p>
      </div>

      <fieldset>
        <legend className="text-[14px] font-medium text-foreground">
          Ambiente
        </legend>
        <div className="mt-2 flex gap-4">
          {(
            [
              ["sandbox", "Sandbox (teste)"],
              ["production", "Produção"],
            ] as const
          ).map(([valor, rotulo]) => (
            <label key={valor} className="flex items-center gap-2 text-[14px]">
              <input
                type="radio"
                name="environment"
                value={valor}
                defaultChecked={valor === "sandbox"}
                className="accent-cobalto"
              />
              {rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      {estado && !estado.ok && (
        // Erro com texto explicativo, não só cor de borda: quem não distingue
        // vermelho precisa saber o que houve (§6.3).
        <p
          id="erro-conexao"
          role="alert"
          className="rounded-md bg-risco-bg px-3 py-2.5 text-[14px] text-risco-texto"
        >
          {estado.mensagem}
        </p>
      )}

      <Botao type="submit" tamanho="site" disabled={pendente}>
        {pendente ? "Verificando a chave…" : "Conectar e continuar"}
      </Botao>
    </form>
  );
}
