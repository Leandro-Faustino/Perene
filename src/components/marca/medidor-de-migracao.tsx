import { cn, formatarPercentual, formatarReais } from "@/lib/utils";

/**
 * O MEDIDOR — único elemento gráfico proprietário do sistema (brand book §5.4).
 * É o mesmo objeto do logo em escala funcional: a barra que enche.
 *
 * Três regras que o componente não deixa quebrar:
 *
 * 1. É PERSISTENTE no topo do painel. Nunca colapsa, nunca some, não vira card
 *    entre outros cards. Por isso mora no layout de `(app)`, não na página
 *    `/dashboard`.
 * 2. Aparece inclusive — e principalmente — nos meses em que não muda. É a
 *    resposta ao Momento da Verdade nº 5 (§3.6): quando a base está migrada e
 *    nada acontece, valor invisível parece valor inexistente.
 * 3. Nenhum número sem denominador. "71%" sozinho é slogan; "292 de 412
 *    contratos" é prova, e o operador precisa poder refazer a conta (valor
 *    PRECISÃO, §4.2).
 */
export function MedidorDeMigracao({
  contratosMigrados,
  contratosTotais,
  economiaMensalCentavos,
  className,
}: {
  contratosMigrados: number;
  contratosTotais: number;
  economiaMensalCentavos: number;
  className?: string;
}) {
  const fracao = contratosTotais > 0 ? contratosMigrados / contratosTotais : 0;

  return (
    <section
      aria-label="Migração da base"
      className={cn(
        "flex items-center gap-6 border-b bg-background px-6 py-3",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
            Migração
          </span>
          <span className="pl-numero font-titulo text-[15px] font-semibold text-foreground">
            {formatarPercentual(fracao)}
          </span>
        </div>

        <div
          className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--pl-borda)]"
          role="progressbar"
          aria-valuenow={contratosMigrados}
          aria-valuemin={0}
          aria-valuemax={contratosTotais}
          aria-valuetext={`${contratosMigrados} de ${contratosTotais} contratos migrados`}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${Math.min(100, Math.max(0, fracao * 100))}%`,
              transition: "width var(--pl-dur-medidor) var(--pl-curva)",
            }}
          />
        </div>

        <p className="mt-1.5 text-[13px] text-texto-medio">
          <span className="pl-numero">{contratosMigrados}</span> de{" "}
          <span className="pl-numero">{contratosTotais}</span> contratos
        </p>
      </div>

      <div className="shrink-0 text-right">
        <span className="block text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
          Economia/mês
        </span>
        <span className="pl-numero mt-1 block font-titulo text-[20px] font-semibold text-foreground">
          {formatarReais(economiaMensalCentavos)}
        </span>
      </div>
    </section>
  );
}
