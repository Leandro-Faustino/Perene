import { FormularioDeConexao } from "@/components/onboarding/formulario-de-conexao";

export const metadata = { title: "Conectar gateway" };

/**
 * Passo 2 do onboarding.
 *
 * A meta do fluxo inteiro é menos de 10 minutos até o número na tela (§3.6),
 * então esta página pede uma coisa só: a chave. Nada de nome amigável, nada de
 * configuração de webhook, nada que não bloqueie o diagnóstico. O que der para
 * descobrir sozinho, a gente descobre.
 */
export default function PaginaConectarGateway() {
  return (
    <div className="mx-auto w-full max-w-lg px-6 py-16">
      <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
        Passo 2 de 3
      </p>
      <h1 className="mt-2 font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Conecte o gateway que você já usa
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-texto">
        A Pulse roda em cima do seu gateway — o dinheiro continua indo direto
        para você, e nada muda na sua conta. Precisamos da chave só para ler sua
        base e montar o diagnóstico.
      </p>

      <FormularioDeConexao />
    </div>
  );
}
