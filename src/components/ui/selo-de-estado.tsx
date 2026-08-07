import { cn } from "@/lib/utils";

/**
 * Selo de estado — brand book §6.3 e §7.2.
 *
 * Duas regras que este componente existe para tornar impossíveis de quebrar:
 *
 * 1. SEMPRE com texto. Nunca um ponto colorido sozinho. Quem não distingue
 *    verde de vermelho precisa conseguir ler o estado.
 * 2. O tom de SUPERFÍCIE (o ponto) e o tom de TEXTO são valores diferentes.
 *    Usar o tom de superfície como cor de texto é o erro de acessibilidade
 *    mais provável do sistema — por isso os dois vêm daqui, não do consumidor.
 *
 * E a regra maior, que nenhum componente consegue impor sozinho: cor de estado
 * é vocabulário, não paleta. Verde, âmbar e vermelho significam ativo,
 * pendente e risco. Não coloram gráfico, ícone de menu nem template de post.
 */
export type Estado = "ativo" | "pendente" | "risco" | "neutro";

const ESTILOS: Record<Estado, { ponto: string; texto: string; fundo: string }> = {
  ativo: {
    ponto: "bg-ativo",
    texto: "text-ativo-texto",
    fundo: "bg-ativo-bg",
  },
  pendente: {
    ponto: "bg-pendente",
    texto: "text-pendente-texto",
    fundo: "bg-pendente-bg",
  },
  risco: {
    ponto: "bg-risco",
    texto: "text-risco-texto",
    fundo: "bg-risco-bg",
  },
  neutro: {
    ponto: "bg-texto-fraco",
    texto: "text-texto",
    fundo: "bg-superficie",
  },
};

export function SeloDeEstado({
  estado,
  children,
  className,
}: {
  estado: Estado;
  children: React.ReactNode;
  className?: string;
}) {
  const estilo = ESTILOS[estado];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium tracking-[0.02em]",
        estilo.fundo,
        estilo.texto,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", estilo.ponto)}
      />
      {children}
    </span>
  );
}
