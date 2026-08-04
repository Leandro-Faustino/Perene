"use client";

import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Cliente Supabase para componentes de browser.
 *
 * Existe por um motivo específico: o realtime do medidor de migração durante a
 * onda (§3.6, momento "aha" nº 2) — ver o medidor subir enquanto as
 * autorizações entram. Fora disso, prefira RSC e Server Action: menos
 * superfície e menos token circulando no cliente.
 *
 * O token é buscado a cada requisição via `useSession`, então expiração e
 * renovação ficam por conta do Clerk.
 */
export function useSupabase() {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          accessToken: async () => session?.getToken() ?? null,
        },
      ),
    [session],
  );
}
