import Link from "next/link";

import { Logo } from "@/components/marca/logo";
import { Botao } from "@/components/ui/botao";
import { formatarReais } from "@/lib/utils";

/**
 * Landing — uma promessa, um número, um botão (brand book §6.3).
 *
 * Deliberadamente SEM lista de funcionalidades. O gap do mercado, segundo a
 * análise de pontos de contato (§3.6), é justamente esse: todo mundo lista
 * recurso, ninguém faz a conta. A conta é o gatilho inteiro.
 *
 * A hierarquia da mensagem segue o Insight 4: retenção primeiro, economia como
 * evidência. E o herói é o operador — a Pulse é mentor, nunca protagonista
 * (§3.5, regra de ouro da narrativa).
 */

// Exemplo do brand book §3.1: 400 contratos de R$ 250 no cartão a 2,9% de MDR.
// Número de ilustração, com a conta à mostra — nunca cifra sem origem (§4.3).
const CONTRATOS = 400;
const TICKET_CENTAVOS = 25_000;
const MDR_BPS = 290;
const CUSTO_CARTAO = Math.round((CONTRATOS * TICKET_CENTAVOS * MDR_BPS) / 10_000);
const CUSTO_PIX_AUTOMATICO = CONTRATOS * 10; // R$ 0,10 por transação

export default function Landing() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Botao asChild variante="fantasma" tamanho="painel">
            <Link href="/entrar">Entrar</Link>
          </Botao>
          <Botao asChild tamanho="painel">
            <Link href="/calculadora">Ver minha perda</Link>
          </Botao>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="font-titulo text-[48px] font-bold leading-[1.1] text-foreground">
              Sua receita tem um pulso.
              <br />A gente não deixa ele parar.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-texto">
              Negócio de recorrência não morre de uma vez. Ele vaza — em taxa que
              come a margem, em cobrança que falha sem ninguém ver, em cliente
              que some sem ter decidido sair. A Pulse soma essa perda, migra sua
              base para Pix Automático sem perder cliente no caminho, e avisa no
              mesmo dia quando uma autorização quebra.
            </p>
          </div>

          {/* A conta feita na tela. É o formato que converte para este público:
              cálculo demonstrado, não promessa (§3.1, tendências de conteúdo). */}
          <div className="mt-14 max-w-2xl rounded-lg border bg-background p-6 shadow-[var(--pl-sombra)]">
            <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
              A conta que quase ninguém fez
            </p>

            <dl className="mt-4 space-y-3 text-[15px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-texto">
                  {CONTRATOS} contratos de {formatarReais(TICKET_CENTAVOS)} no
                  cartão, a 2,9%
                </dt>
                <dd className="pl-numero shrink-0 font-medium text-foreground">
                  {formatarReais(CUSTO_CARTAO)}/mês
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-texto">
                  A mesma base no Pix Automático, a R$ 0,10 por transação
                </dt>
                <dd className="pl-numero shrink-0 font-medium text-foreground">
                  {formatarReais(CUSTO_PIX_AUTOMATICO)}/mês
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t pt-3">
                <dt className="font-medium text-foreground">
                  Diferença, por ano
                </dt>
                <dd className="pl-numero shrink-0 font-titulo text-[24px] font-bold text-primary">
                  {formatarReais((CUSTO_CARTAO - CUSTO_PIX_AUTOMATICO) * 12)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-[13px] text-texto-medio">
              Tarifa de cartão em faixa de mercado (2% a 3,5%). A sua é outra —
              e é por isso que o diagnóstico usa a sua, não esta.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Botao asChild tamanho="site">
              <Link href="/calculadora">Fazer a conta com meus números</Link>
            </Botao>
            <span className="text-[14px] text-texto-medio">
              Sem cadastro. O número aparece na tela.
            </span>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-8">
        <p className="text-[13px] text-texto-medio">
          A Pulse não é gateway — o dinheiro nunca passa por nós. Ela roda em
          cima do gateway que você já usa.
        </p>
      </footer>
    </div>
  );
}
