import { UserButton } from "@clerk/nextjs";

import { BarraLateral } from "@/components/barra-lateral";
import { MedidorDeMigracao } from "@/components/marca/medidor-de-migracao";

/**
 * Layout do painel do operador.
 *
 * O MEDIDOR DE MIGRAÇÃO mora aqui, no layout, e não na página de diagnóstico.
 * É deliberado: o brand book §5.4 exige que ele seja persistente — "nunca
 * colapsa, nunca some, não vira card entre outros cards" — porque é o número
 * pelo qual o operador julga o produto, inclusive nos meses em que ele não
 * muda. Colocá-lo dentro de `/dashboard` faria dele mais um card.
 *
 * Esta superfície é o oposto da página do pagador: densa, diária, usada por
 * anos. As duas compartilham tokens e tipografia; não compartilham densidade
 * nem hierarquia (§3.6). Tratá-las com o mesmo sistema é o erro mais provável
 * do projeto.
 *
 * TODO(Semana 2): os números do medidor vêm de view materializada por org,
 * carregada aqui no layout. Enquanto o diagnóstico não existe, ficam zerados —
 * e zerado já é a leitura correta para quem acabou de entrar.
 */
export default function LayoutDoPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1">
      <BarraLateral />

      <div className="flex min-w-0 flex-1 flex-col">
        <MedidorDeMigracao
          contratosMigrados={0}
          contratosTotais={0}
          economiaMensalCentavos={0}
        />

        <header className="flex h-14 items-center justify-end border-b px-6">
          <UserButton />
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
