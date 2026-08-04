import { auth, currentUser } from "@clerk/nextjs/server";

import "server-only";

/**
 * Ponte entre a sessão Clerk e o domínio.
 *
 * Todo Server Action e todo RSC do painel começa por `exigirOrgAtual()`. Se
 * não há organização ativa, não há o que mostrar: o produto inteiro é
 * multi-tenant e a organização é a unidade de isolamento (glossário do brand
 * book).
 */

export async function getCurrentUser() {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    nome: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    avatarUrl: user.imageUrl,
  };
}

export async function getCurrentOrgId(): Promise<string | null> {
  const { orgId } = await auth();
  return orgId ?? null;
}

export async function exigirOrgAtual(): Promise<string> {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    throw new Error(
      "Nenhuma organização ativa na sessão. Conclua o onboarding em /organizacao.",
    );
  }
  return orgId;
}

export async function getCurrentOrgRole(): Promise<string | null> {
  const { orgRole } = await auth();
  return orgRole ?? null;
}
