import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Botões — brand book §6.3.
 *
 * A variante `destrutivo` usa BORDA vermelha, nunca vermelho sólido: em
 * ferramenta financeira, botão vermelho cheio provoca clique acidental, e o
 * clique acidental aqui cancela a cobrança de alguém.
 *
 * Altura 40px no painel e 48px no site — a diferença é deliberada e está no
 * brand book. A página do pagador usa 52px, e tem componente próprio.
 */
const variantes = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[14px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pl-cobalto)] focus-visible:ring-offset-2 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variante: {
        primario:
          "bg-primary text-primary-foreground hover:bg-[var(--pl-cobalto-escuro)] hover:shadow-[var(--pl-sombra-marca)]",
        secundario:
          "border bg-background text-foreground hover:bg-[var(--pl-superficie)]",
        fantasma: "text-foreground hover:bg-[var(--pl-superficie)]",
        destrutivo:
          "border border-[var(--pl-risco)] bg-background text-[var(--pl-risco-texto)] hover:bg-[var(--pl-risco-bg)]",
      },
      tamanho: {
        painel: "h-10 px-4",
        site: "h-12 px-6 text-[15px]",
        pequeno: "h-8 px-3 text-[13px]",
        icone: "h-10 w-10",
      },
    },
    defaultVariants: { variante: "primario", tamanho: "painel" },
  },
);

export function Botao({
  className,
  variante,
  tamanho,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof variantes> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(variantes({ variante, tamanho }), className)}
      {...props}
    />
  );
}
