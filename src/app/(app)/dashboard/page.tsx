import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Botao } from "@/components/ui/botao";
import Link from "next/link";

export const metadata = { title: "Diagnóstico" };

/**
 * O diagnóstico. Momento da Verdade nº 1 (§3.6): é aqui que o operador vê pela
 * primeira vez quanto perde por mês, e é o instante em que a marca prova que
 * existe.
 *
 * TODO(Semana 2): RF-30 a RF-33 — custo atual por método com tarifa
 * parametrizável, falha de cobrança dos últimos 12 meses, projeção por cenário
 * de adesão (50% / 70% / 90%). Toda cifra sai acompanhada da memória de
 * cálculo: se o operador não consegue refazer a conta, o número não vale.
 */
export default function PaginaDeDiagnostico() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
          Diagnóstico
        </h1>
        <p className="mt-1 text-[15px] text-texto">
          Quanto sua base custa hoje, e quanto ela custaria no Pix Automático.
        </p>
      </div>

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
