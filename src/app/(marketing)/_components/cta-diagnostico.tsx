import Link from "next/link";

import { Botao } from "@/components/ui/botao";

/**
 * Botão de diagnóstico — leva para o cadastro, que inicia o fluxo de
 * onboarding (conectar gateway → importar base → gerar PDF de diagnóstico).
 */
export function CtaDiagnostico({
  children,
  tamanho = "site",
  className,
}: {
  children: React.ReactNode;
  tamanho?: "site" | "painel" | "pequeno";
  className?: string;
}) {
  return (
    <Botao asChild tamanho={tamanho} className={className}>
      <Link href="/cadastrar">{children}</Link>
    </Botao>
  );
}
