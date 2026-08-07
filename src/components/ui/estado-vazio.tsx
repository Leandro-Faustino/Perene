import { cn } from "@/lib/utils";

/**
 * Estado vazio — brand book §6.3 e §4.2 (valor TRADUÇÃO).
 *
 * "Estado vazio sem ação proposta é bug de interface." Por isso `acao` não é
 * opcional: o tipo obriga quem usa o componente a responder o que a pessoa
 * deve fazer ali.
 *
 * A fila "Precisa de atenção" vazia é caso de uso deliberado — ela diz com
 * todas as letras que está vazia, em vez de deixar em branco. É um dos rituais
 * da marca (§4.4) e a resposta ao Momento da Verdade nº 5.
 */
export function EstadoVazio({
  titulo,
  descricao,
  acao,
  className,
}: {
  titulo: string;
  descricao: string;
  acao: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-background px-6 py-12 text-center",
        className,
      )}
    >
      {/* Padrão gráfico: repetição do motivo de barras a 40% (§5.4).
          Nunca atrás de texto — por isso fica no topo, fora do bloco. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-1.5 opacity-40">
        {[16, 16, 16, 11.2, 16, 16, 16, 11.2].map((altura, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-border"
            style={{ height: altura }}
          />
        ))}
      </div>

      <h3 className="font-titulo text-[18px] font-medium text-foreground">
        {titulo}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-[14px] text-texto-medio">
        {descricao}
      </p>
      <div className="mt-5 flex justify-center">{acao}</div>
    </div>
  );
}
