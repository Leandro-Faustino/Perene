import Link from "next/link";

import { Logo } from "@/components/marca/logo";

/**
 * Casca do onboarding.
 *
 * A meta do fluxo é menos de 10 minutos do cadastro até o número na tela
 * (§3.6). Isso é um orçamento, não uma aspiração: cada campo que não bloqueia
 * o diagnóstico está gastando o orçamento de outra pessoa.
 */
export default function LayoutDeOnboarding({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-16 items-center border-b px-6">
        <Link href="/" aria-label="Pulse">
          <Logo />
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
