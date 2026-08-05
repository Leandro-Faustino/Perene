import Link from "next/link";

import { Logo } from "@/components/marca/logo";

export default function LayoutDeAutenticacao({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-16 items-center px-6">
        <Link href="/" aria-label="Pulse — voltar para o início">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 py-10">
        {children}
      </main>
    </div>
  );
}
