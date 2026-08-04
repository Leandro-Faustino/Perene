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
    ponto: "bg-[var(--pl-ativo)]",
    texto: "text-[var(--pl-ativo-texto)]",
    fundo: "bg-[var(--pl-ativo-bg)]",
  },
  pendente: {
    ponto: "bg-[var(--pl-pendente)]",
    texto: "text-[var(--pl-pendente-texto)]",
    fundo: "bg-[var(--pl-pendente-bg)]",
  },
  risco: {
    ponto: "bg-[var(--pl-risco)]",
    texto: "text-[var(--pl-risco-texto)]",
    fundo: "bg-[var(--pl-risco-bg)]",
  },
  neutro: {
    ponto: "bg-[var(--pl-texto-fraco)]",
    texto: "text-[var(--pl-texto)]",
    fundo: "bg-[var(--pl-superficie)]",
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
