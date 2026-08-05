import { corDeDestaque } from "@/lib/contraste";

/**
 * Telas de aviso do fluxo do pagador: link morto, já autorizado, expirado.
 *
 * Elas são tão parte do produto quanto o caminho feliz. Quem cai aqui já foi
 * convidado uma vez e está tentando resolver — merece saber o que houve e o
 * que fazer, não um "Ops! Algo deu errado" (§4.3, honestidade sobre limite).
 */
export function AvisoDeConvite({
  titulo,
  texto,
  organizacao,
  tom = "neutro",
}: {
  titulo: string;
  texto: string;
  organizacao?: { nome: string; corDeMarca: string | null };
  tom?: "neutro" | "ativo";
}) {
  const destaque = corDeDestaque(organizacao?.corDeMarca);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
      {organizacao && (
        <p className="mb-6 text-center text-[20px] font-medium text-foreground">
          {organizacao.nome}
        </p>
      )}

      <div className="rounded-lg border bg-background p-6 text-center">
        {tom === "ativo" && (
          <div
            aria-hidden
            className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--pl-ativo-bg)" }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="var(--pl-ativo-texto)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <h1 className="font-titulo text-[22px] font-semibold text-foreground">
          {titulo}
        </h1>
        {/* Texto em --pl-texto, nunca em texto fraco: é conteúdo, não letra
            miúda (§5.2). */}
        <p className="mt-3 text-[16px] leading-relaxed text-texto">{texto}</p>

        {tom === "ativo" && (
          <div
            aria-hidden
            className="mx-auto mt-6 h-1 w-10 rounded-full"
            style={{ backgroundColor: destaque }}
          />
        )}
      </div>

      <Assinatura />
    </main>
  );
}

/**
 * A assinatura da Pulse (§3.4): rodapé, em texto, sem símbolo colorido, nunca
 * acima do botão, no máximo 12px. É o único ponto do sistema em que
 * `--pl-texto-fraco` é permitido em texto — por ser assinatura de marca, não
 * conteúdo.
 */
export function Assinatura() {
  return (
    <p className="mt-8 text-center text-[12px] text-texto-fraco">
      Autorização processada com segurança por <strong>Pulse</strong>
    </p>
  );
}
