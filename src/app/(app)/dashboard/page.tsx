import Link from "next/link";

import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Botao } from "@/components/ui/botao";
import { carregarDiagnostico } from "@/lib/domain/carregar-diagnostico";
import { descreverTarifa, rotulo } from "@/lib/domain/diagnostico";
import { formatarPercentual, formatarReais } from "@/lib/utils";

export const metadata = { title: "Diagnóstico" };

/**
 * O diagnóstico. Momento da Verdade nº 1 (§3.6): é aqui que o operador vê pela
 * primeira vez quanto perde por mês, e é o instante em que a marca prova que
 * existe.
 *
 * A regra de composição desta tela: o número primeiro, a memória de cálculo
 * junto, e nenhum adjetivo. "O número já é dramático o suficiente; qualquer
 * adjetivo o enfraquece" (§3.5, Pilar REVELAR).
 */
export default async function PaginaDeDiagnostico() {
  const diagnostico = await carregarDiagnostico();

  if (!diagnostico) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Cabecalho />
        <EstadoVazio
          titulo="Sua base ainda não foi importada"
          descricao="O diagnóstico precisa dos seus contratos para somar a perda. Conecte o gateway que você já usa ou envie um CSV — leva menos de 10 minutos até o número aparecer."
          acao={
            <Botao asChild>
              <Link href="/conectar-gateway">Conectar meu gateway</Link>
            </Botao>
          }
        />
      </div>
    );
  }

  const anual = diagnostico.custoMensalAtualCentavos * 12;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Cabecalho />

      {/* O número. Display 48px em Archivo Bold, tabular (§5.3). */}
      <section className="rounded-lg border bg-background p-6 shadow-[var(--pl-sombra)]">
        <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
          Custo de cobrança hoje
        </p>
        <p className="pl-numero mt-2 text-left font-titulo text-[48px] font-bold leading-none text-foreground">
          {formatarReais(diagnostico.custoMensalAtualCentavos)}
          <span className="text-[20px] font-medium text-texto-medio"> /mês</span>
        </p>
        <p className="mt-3 text-[15px] text-texto">
          Dá <strong>{formatarReais(anual)}</strong> por ano, sobre{" "}
          {diagnostico.contratosAtivos} contratos ativos e uma receita mensal de{" "}
          {formatarReais(diagnostico.receitaMensalCentavos)}.
        </p>
      </section>

      {/* Custo por método, do mais caro para o mais barato. */}
      <section>
        <h2 className="font-titulo text-[24px] font-semibold text-foreground">
          Onde está vazando
        </h2>
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-[14px]">
            <thead className="bg-[var(--pl-superficie)]">
              <tr>
                <th className="px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Método
                </th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Contratos
                </th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Receita/mês
                </th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                  Custo/mês
                </th>
              </tr>
            </thead>
            <tbody>
              {diagnostico.custoPorMetodo.map((linha) => (
                <tr key={linha.metodo} className="border-t">
                  <td className="px-4 py-3">
                    <span className="text-foreground">{rotulo(linha.metodo)}</span>
                    <span className="mt-0.5 block text-[13px] text-texto-medio">
                      {linha.memoria}
                    </span>
                  </td>
                  <td className="pl-numero px-4 py-3 font-medium">
                    {linha.contratos}
                  </td>
                  <td className="pl-numero px-4 py-3">
                    {formatarReais(linha.receitaMensalCentavos)}
                  </td>
                  <td className="pl-numero px-4 py-3 font-medium text-foreground">
                    {formatarReais(linha.custoMensalCentavos)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Falhas: o churn acidental em número. */}
      <section className="rounded-lg border bg-background p-6">
        <h2 className="font-titulo text-[18px] font-medium text-foreground">
          Cobranças que não entraram
        </h2>
        <p className="pl-numero mt-2 text-left font-titulo text-[32px] font-semibold text-foreground">
          {formatarReais(diagnostico.falhas.valorCentavos)}
        </p>
        <p className="mt-2 text-[13px] text-texto-medio">
          {diagnostico.falhas.memoria}
        </p>
      </section>

      {/* Cenários — sempre com o cenário declarado, nunca uma promessa só. */}
      <section>
        <h2 className="font-titulo text-[24px] font-semibold text-foreground">
          Quanto isso muda com Pix Automático
        </h2>
        <p className="mt-1 text-[15px] text-texto">
          Três cenários de adesão. Nenhum é promessa — são a mesma conta, com
          proporções diferentes de gente migrada.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {diagnostico.cenarios.map((cenario) => (
            <div
              key={cenario.adesao}
              className="rounded-lg border bg-background p-5"
            >
              <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                {formatarPercentual(cenario.adesao)} de adesão
              </p>
              <p className="pl-numero mt-2 text-left font-titulo text-[24px] font-semibold text-primary">
                {formatarReais(cenario.economiaMensalCentavos)}
                <span className="text-[14px] font-medium text-texto-medio">
                  {" "}
                  /mês
                </span>
              </p>
              <p className="pl-numero mt-1 text-left text-[13px] text-texto">
                {formatarReais(cenario.economiaAnualCentavos)} por ano
              </p>
              <p className="mt-3 text-[13px] text-texto-medio">
                {cenario.memoria}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* A memória de cálculo, inteira e à vista. Se o operador não consegue
          refazer a conta, o número não vale (§4.2). */}
      <section className="rounded-lg border bg-[var(--pl-superficie)] p-5">
        <h2 className="text-[14px] font-medium text-foreground">
          Como chegamos nesses números
        </h2>
        <ul className="mt-2 space-y-1.5 text-[13px] text-texto">
          {diagnostico.memoriaGeral.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-texto-medio">
          Tarifa do Pix Automático considerada:{" "}
          {descreverTarifa({
            metodo: "pix_automatico",
            percentBps: 0,
            fixedCents: 10,
            origem: "",
          })}
          . Ajuste as tarifas em Configurações para ver a sua conta exata.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Botao asChild tamanho="site">
          <Link href="/ondas/nova">Começar a migrar</Link>
        </Botao>
        <span className="text-[14px] text-texto-medio">
          Você escolhe quem entra na primeira onda.
        </span>
      </div>
    </div>
  );
}

function Cabecalho() {
  return (
    <div>
      <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Diagnóstico
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        Quanto sua base custa hoje, e quanto ela custaria no Pix Automático.
      </p>
    </div>
  );
}
