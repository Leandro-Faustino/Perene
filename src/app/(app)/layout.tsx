import { UserButton } from "@clerk/nextjs";

import { BarraLateral } from "@/components/barra-lateral";
import { MedidorDeMigracao } from "@/components/marca/medidor-de-migracao";
import { carregarMedidor } from "@/lib/domain/medidor";

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
 * Os números vêm do banco a cada render. Zerados só quando a base realmente
 * está zerada — um medidor que mostra zero permanentemente contradiz a
 * promessa que a marca faz.
 */
export default async function LayoutDoPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const medidor = await carregarMedidor();

  return (
    <div className="flex min-h-full flex-1">
      <BarraLateral />

      <div className="flex min-w-0 flex-1 flex-col">
        <MedidorDeMigracao {...medidor} />

        <header className="flex h-14 items-center justify-end border-b px-6">
          <UserButton />
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
