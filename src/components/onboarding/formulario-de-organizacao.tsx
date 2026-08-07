"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationList } from "@clerk/nextjs";

import { registrarOrganizacao } from "@/app/(onboarding)/organizacao/acoes";
import { Botao } from "@/components/ui/botao";

/**
 * Passo 1: criar a organização.
 *
 * A ordem das três etapas importa e não dá para trocar:
 *  1. cria no Clerk — é ele quem detém a identidade;
 *  2. ATIVA na sessão — sem isso o token não carrega o `o.id` e a RLS recusa;
 *  3. grava a linha no banco, já sob a policy da própria organização.
 *
 * Se a etapa 3 falhar, a organização existe no Clerk e não no banco. O texto de
 * erro diz isso e oferece tentar de novo, porque o upsert é idempotente —
 * melhor do que deixar o operador achando que precisa recomeçar tudo.
 */
const ROTULOS = [
  ["aluno", "Academia, box, escola, curso"],
  ["paciente", "Clínica, consultório"],
  ["morador", "Condomínio, associação"],
  ["assinante", "SaaS, clube, assinatura"],
  ["cliente", "Outro tipo de negócio"],
] as const;

export function FormularioDeOrganizacao() {
  const { isLoaded, createOrganization, setActive } = useOrganizationList();
  const router = useRouter();

  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!isLoaded || !createOrganization || !setActive) return;

    const dados = new FormData(evento.currentTarget);
    const nome = String(dados.get("nome") ?? "").trim();

    if (nome.length < 2) {
      setErro("Informe o nome do negócio.");
      return;
    }

    setOcupado(true);
    setErro(null);

    try {
      const organizacao = await createOrganization({ name: nome });
      await setActive({ organization: organizacao.id });

      const resultado = await registrarOrganizacao(null, dados);
      if (!resultado.ok) {
        setErro(resultado.mensagem);
        return;
      }

      router.push("/conectar-gateway");
    } catch (causa) {
      setErro(
        causa instanceof Error
          ? causa.message
          : "Não conseguimos criar a organização agora. Tente de novo.",
      );
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-8 space-y-6">
      <div>
        <label htmlFor="nome" className="block text-[14px] font-medium text-foreground">
          Nome do negócio
        </label>
        <input
          id="nome"
          name="nome"
          required
          autoFocus
          aria-describedby={erro ? "erro-org" : undefined}
          aria-invalid={erro ? true : undefined}
          className="mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-cobalto"
          placeholder="Box Ferro & Fogo"
        />
      </div>

      <fieldset>
        <legend className="text-[14px] font-medium text-foreground">
          Como você chama quem paga?
        </legend>
        <p className="mt-1 text-[13px] text-texto-medio">
          É só um rótulo de tela. Muda depois quando quiser.
        </p>
        <div className="mt-3 space-y-2">
          {ROTULOS.map(([valor, exemplo]) => (
            <label
              key={valor}
              className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-[14px] hover:bg-superficie"
            >
              <input
                type="radio"
                name="rotuloDoPagador"
                value={valor}
                defaultChecked={valor === "aluno"}
                className="accent-cobalto"
              />
              <span className="font-medium text-foreground">{valor}</span>
              <span className="text-texto-medio">{exemplo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {erro && (
        <p
          id="erro-org"
          role="alert"
          className="rounded-md bg-risco-bg px-3 py-2.5 text-[14px] text-risco-texto"
        >
          {erro}
        </p>
      )}

      <Botao type="submit" tamanho="site" disabled={ocupado || !isLoaded}>
        {ocupado ? "Criando…" : "Continuar"}
      </Botao>
    </form>
  );
}
