"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSearch,
  Waves,
  TriangleAlert,
  Users,
  MessageSquare,
  Plug,
  Settings,
} from "lucide-react";

import { Logo } from "@/components/marca/logo";
import { cn } from "@/lib/utils";

/**
 * Navegação do painel.
 *
 * Os rótulos vêm da arquitetura de marca (§3.4): Diagnóstico, Ondas, Atenção,
 * Conexões. São seções, não produtos — nenhuma recebe logo, cor exclusiva ou
 * tipografia própria.
 *
 * Vocabulário (§4.3): "Precisa de atenção", nunca "Pendências" nem "Alertas
 * críticos"; "Conexões", nunca "Integrações" nem "Gateways".
 */
const SECOES = [
  {
    titulo: null,
    itens: [{ href: "/dashboard", rotulo: "Diagnóstico", Icone: FileSearch }],
  },
  {
    titulo: "Operação",
    itens: [
      { href: "/ondas", rotulo: "Ondas", Icone: Waves },
      { href: "/atencao", rotulo: "Precisa de atenção", Icone: TriangleAlert },
      { href: "/pagadores", rotulo: "Base", Icone: Users },
      { href: "/mensagens", rotulo: "Mensagens", Icone: MessageSquare },
    ],
  },
  {
    titulo: "Ajustes",
    itens: [
      { href: "/conectar-gateway", rotulo: "Conexões", Icone: Plug },
      { href: "/configuracoes", rotulo: "Configurações", Icone: Settings },
    ],
  },
] as const;

export function BarraLateral() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="flex w-60 shrink-0 flex-col border-r bg-[var(--pl-superficie)]"
    >
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" aria-label="Pulse — ir para o diagnóstico">
          <Logo />
        </Link>
      </div>

      <div className="flex-1 space-y-6 px-3 py-4">
        {SECOES.map((secao, i) => (
          <div key={secao.titulo ?? i}>
            {secao.titulo && (
              <p className="px-2 pb-2 text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
                {secao.titulo}
              </p>
            )}
            <ul className="space-y-0.5">
              {secao.itens.map(({ href, rotulo, Icone }) => {
                const ativo =
                  caminho === href || caminho.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={ativo ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-2 text-[14px] transition-colors",
                        ativo
                          ? "bg-background font-medium text-foreground shadow-[var(--pl-sombra)]"
                          : "text-texto hover:bg-background/60",
                      )}
                    >
                      {/* Ícones: Lucide, só contorno, sem preenchimento (§5.4) */}
                      <Icone
                        className="size-4 shrink-0"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {rotulo}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
