"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

import { Logo } from "@/components/marca/logo";
import { Botao } from "@/components/ui/botao";
import { formatarReais, formatarPercentual } from "@/lib/utils";

/**
 * Calculadora pública — sem cadastro, sem autenticação.
 *
 * O objetivo é o Momento da Verdade nº 0: antes de criar conta, o visitante
 * vê o número real com os dados dele. "Sem cadastro. O número aparece na tela."
 * é a promessa da landing — esta página cumpre.
 *
 * Regra de composição: a memória de cálculo fica ao lado do número. O visitante
 * não deve ter que confiar no resultado sem entender de onde vem (§4.2 PRECISÃO).
 */

type MetodoAtual = "cartao" | "boleto" | "pix_manual" | "debito_automatico";

const ROTULOS: Record<MetodoAtual, string> = {
  cartao: "Cartão de crédito/débito",
  boleto: "Boleto bancário",
  pix_manual: "Pix manual (avulso)",
  debito_automatico: "Débito automático (TED/DOC)",
};

const TAXAS_PADRAO: Record<MetodoAtual, { tipo: "percentual" | "fixo"; valor: number }> = {
  cartao: { tipo: "percentual", valor: 2.9 },
  boleto: { tipo: "fixo", valor: 3.5 },
  pix_manual: { tipo: "fixo", valor: 0 },
  debito_automatico: { tipo: "percentual", valor: 1.2 },
};

const CENARIOS = [0.5, 0.7, 0.9] as const;

export default function PaginaDaCalculadora() {
  const [contratos, setContratos] = useState("200");
  const [ticketReais, setTicket] = useState("300");
  const [metodo, setMetodo] = useState<MetodoAtual>("cartao");
  const [taxaInput, setTaxa] = useState("2.9");
  const [tarifaPixInput, setTarifaPix] = useState("0.10");

  // Quando muda o método, preenche a taxa padrão
  function handleMetodo(m: MetodoAtual) {
    setMetodo(m);
    const padrao = TAXAS_PADRAO[m];
    setTaxa(padrao.valor.toString());
  }

  const resultado = useMemo(() => {
    const n = Math.max(0, parseInt(contratos) || 0);
    const ticket = Math.max(0, parseFloat(ticketReais) || 0);
    const taxa = Math.max(0, parseFloat(taxaInput) || 0);
    const tarifaPix = Math.max(0, parseFloat(tarifaPixInput) || 0.1);

    const { tipo } = TAXAS_PADRAO[metodo];

    const custoAtualMensal =
      tipo === "percentual"
        ? (n * ticket * taxa) / 100
        : n * taxa;

    const custoPix = n * tarifaPix;
    const economiaMensal = Math.max(0, custoAtualMensal - custoPix);
    const economiaAnual = economiaMensal * 12;

    const cenarios = CENARIOS.map((adesao) => ({
      adesao,
      economiaMensal: economiaMensal * adesao,
      economiaAnual: economiaAnual * adesao,
    }));

    return {
      n,
      ticket,
      custoAtualMensal,
      custoPix,
      economiaMensal,
      economiaAnual,
      cenarios,
      tipo,
    };
  }, [contratos, ticketReais, metodo, taxaInput, tarifaPixInput]);

  const temResultado = resultado.n > 0 && resultado.ticket > 0;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Botao asChild variante="fantasma" tamanho="painel">
            <Link href="/entrar">Entrar</Link>
          </Botao>
          <Botao asChild tamanho="painel">
            <Link href="/cadastrar">Criar conta</Link>
          </Botao>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1100px] px-6 py-12">
          <div className="mb-10 max-w-2xl">
            <h1 className="font-titulo text-[40px] font-bold leading-tight text-foreground">
              Quanto você paga hoje — e quanto vai pagar depois.
            </h1>
            <p className="mt-3 text-[16px] text-texto">
              Coloque os números da sua operação. A conta aparece na tela, com
              a memória de cálculo à vista.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Formulário de entrada */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-background p-6">
                <h2 className="mb-5 text-[14px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Sua operação hoje
                </h2>

                <div className="space-y-4">
                  <Campo
                    rotulo="Contratos ativos"
                    descricao="Quantos clientes recorrentes você cobra por mês"
                  >
                    <input
                      type="number"
                      min="0"
                      value={contratos}
                      onChange={(e) => setContratos(e.target.value)}
                      className={estiloInput}
                      placeholder="200"
                    />
                  </Campo>

                  <Campo
                    rotulo="Ticket médio (R$)"
                    descricao="Valor mensal de cada contrato"
                  >
                    <div className="flex items-center rounded-md border bg-superficie px-3 focus-within:ring-2 focus-within:ring-cobalto focus-within:ring-offset-1">
                      <span className="pr-1 text-[13px] text-texto-medio">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticketReais}
                        onChange={(e) => setTicket(e.target.value)}
                        className="w-full bg-transparent py-2 text-[14px] tabular-nums text-foreground outline-none"
                        placeholder="300.00"
                      />
                    </div>
                  </Campo>

                  <Campo rotulo="Método de cobrança atual">
                    <select
                      value={metodo}
                      onChange={(e) => handleMetodo(e.target.value as MetodoAtual)}
                      className={estiloInput}
                    >
                      {(Object.keys(ROTULOS) as MetodoAtual[]).map((m) => (
                        <option key={m} value={m}>
                          {ROTULOS[m]}
                        </option>
                      ))}
                    </select>
                  </Campo>

                  <Campo
                    rotulo={
                      TAXAS_PADRAO[metodo].tipo === "percentual"
                        ? "MDR / taxa (%)"
                        : "Custo fixo por cobrança (R$)"
                    }
                    descricao={
                      TAXAS_PADRAO[metodo].tipo === "percentual"
                        ? "Percentual cobrado sobre cada transação"
                        : "Valor fixo por boleto emitido ou transação processada"
                    }
                  >
                    <div className="flex items-center rounded-md border bg-superficie px-3 focus-within:ring-2 focus-within:ring-cobalto focus-within:ring-offset-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={taxaInput}
                        onChange={(e) => setTaxa(e.target.value)}
                        className="w-full bg-transparent py-2 text-[14px] tabular-nums text-foreground outline-none"
                      />
                      <span className="pl-1 text-[13px] text-texto-medio">
                        {TAXAS_PADRAO[metodo].tipo === "percentual" ? "%" : "R$"}
                      </span>
                    </div>
                  </Campo>

                  <Campo
                    rotulo="Tarifa do Pix Automático (R$/transação)"
                    descricao="O seu gateway pode cobrar diferente — ajuste aqui"
                  >
                    <div className="flex items-center rounded-md border bg-superficie px-3 focus-within:ring-2 focus-within:ring-cobalto focus-within:ring-offset-1">
                      <span className="pr-1 text-[13px] text-texto-medio">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tarifaPixInput}
                        onChange={(e) => setTarifaPix(e.target.value)}
                        className="w-full bg-transparent py-2 text-[14px] tabular-nums text-foreground outline-none"
                        placeholder="0.10"
                      />
                    </div>
                  </Campo>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div className="space-y-4">
              {temResultado ? (
                <>
                  {/* Número principal */}
                  <div className="rounded-lg border bg-background p-6 shadow-sm">
                    <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                      Economia com 100% migrado
                    </p>
                    <p className="pl-numero mt-2 font-titulo text-[48px] font-bold leading-none text-primary">
                      {formatarReais(Math.round(resultado.economiaMensal * 100))}
                      <span className="text-[18px] font-medium text-texto-medio">
                        {" "}
                        /mês
                      </span>
                    </p>
                    <p className="pl-numero mt-1 text-[15px] text-texto">
                      {formatarReais(Math.round(resultado.economiaAnual * 100))} por ano
                    </p>

                    {/* Memória de cálculo */}
                    <div className="mt-5 space-y-2 border-t pt-4 text-[13px] text-texto">
                      <div className="flex justify-between">
                        <span className="text-texto-medio">
                          Custo atual ({ROTULOS[metodo]})
                        </span>
                        <span className="pl-numero font-medium text-foreground">
                          {formatarReais(Math.round(resultado.custoAtualMensal * 100))}/mês
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-texto-medio">
                          Custo no Pix Automático ({resultado.n} × R${" "}
                          {parseFloat(tarifaPixInput).toFixed(2)})
                        </span>
                        <span className="pl-numero font-medium text-foreground">
                          {formatarReais(Math.round(resultado.custoPix * 100))}/mês
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-[14px] font-medium text-foreground">
                        <span>Diferença</span>
                        <span className="pl-numero text-primary">
                          {formatarReais(Math.round(resultado.economiaMensal * 100))}/mês
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cenários de adesão */}
                  <div className="rounded-lg border bg-background p-5">
                    <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                      Por taxa de adesão
                    </p>
                    <div className="space-y-3">
                      {resultado.cenarios.map((c) => (
                        <div key={c.adesao} className="flex items-baseline justify-between">
                          <span className="text-[13px] text-texto-medio">
                            {formatarPercentual(c.adesao)} migrado
                          </span>
                          <div className="text-right">
                            <span className="pl-numero text-[16px] font-semibold text-foreground">
                              {formatarReais(Math.round(c.economiaMensal * 100))}
                            </span>
                            <span className="ml-1 text-[12px] text-texto-medio">/mês</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="rounded-lg border bg-superficie p-5">
                    <p className="text-[13px] font-medium text-foreground">
                      Quer ver a conta com a sua base real?
                    </p>
                    <p className="mt-1 text-[13px] text-texto-medio">
                      O diagnóstico usa os contratos do seu gateway — o número
                      sai mais exato do que qualquer estimativa manual.
                    </p>
                    <Botao asChild className="mt-4 w-full" tamanho="site">
                      <Link href="/cadastrar">
                        Fazer o diagnóstico completo
                      </Link>
                    </Botao>
                    <p className="mt-2 text-center text-[12px] text-texto-medio">
                      Grátis. Conecta em minutos com o Asaas.
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border bg-background p-8 text-center">
                  <p className="text-[15px] text-texto-medio">
                    Preencha os campos ao lado para ver o resultado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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

function Campo({
  rotulo,
  descricao,
  children,
}: {
  rotulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[13px] font-medium text-foreground">
        {rotulo}
      </label>
      {children}
      {descricao && (
        <p className="mt-1 text-[12px] text-texto-medio">{descricao}</p>
      )}
    </div>
  );
}

const estiloInput =
  "w-full rounded-md border bg-superficie px-3 py-2 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-cobalto focus:ring-offset-1";
