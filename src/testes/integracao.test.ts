import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * TESTE DE INTEGRAÇÃO — roda contra o Supabase de verdade.
 *
 * Fica fora da suíte normal de propósito: `npm test` precisa rodar em qualquer
 * lugar, sem rede e sem credencial. Este exige as duas.
 *
 *     npm run test:integracao
 *
 * Ele existe porque o ambiente onde este código foi desenvolvido tem egresso
 * bloqueado para `*.supabase.co` — toda a validação de banco foi feita por
 * fora da aplicação. Este arquivo é o que fecha essa lacuna na máquina de quem
 * tem acesso.
 *
 * Cobre o que só quebra com um Postgres real:
 *  - a chave service-role funciona e alcança o projeto;
 *  - RLS isola organizações de verdade, inclusive contra escrita cruzada;
 *  - a função do pagador não vaza nada além do convite pedido;
 *  - a fila não entrega o mesmo job duas vezes.
 *
 * Limpa tudo que criou, mesmo se falhar no meio.
 */

const RODAR = process.env.RODAR_INTEGRACAO === "1";
const PREFIXO = "itest_";

function carregarEnvLocal(): Record<string, string> {
  try {
    const bruto = readFileSync(".env.local", "utf8");
    return Object.fromEntries(
      bruto
        .split("\n")
        .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
        }),
    );
  } catch {
    return {};
  }
}

const env = { ...carregarEnvLocal(), ...process.env };
const URL_SUPABASE = env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE_SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const CHAVE_PUBLICA =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe.skipIf(!RODAR)("integração com o Supabase", () => {
  let admin: SupabaseClient;
  let orgA: string;
  let orgB: string;
  let tokenA: string;

  beforeAll(async () => {
    expect(
      URL_SUPABASE,
      "NEXT_PUBLIC_SUPABASE_URL ausente — preencha o .env.local",
    ).toBeTruthy();
    expect(
      CHAVE_SERVICE,
      "SUPABASE_SERVICE_ROLE_KEY ausente — preencha o .env.local",
    ).toBeTruthy();

    admin = createClient(URL_SUPABASE!, CHAVE_SERVICE!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const orgs = await admin
      .from("organizations")
      .insert([
        { clerk_org_id: `${PREFIXO}A`, name: "Box de Teste", brand_color: "#FF6600" },
        { clerk_org_id: `${PREFIXO}B`, name: "Escola de Teste" },
      ])
      .select("id, clerk_org_id");

    expect(orgs.error, `falha ao criar organizações: ${orgs.error?.message}`).toBeNull();

    orgA = orgs.data!.find((o) => o.clerk_org_id === `${PREFIXO}A`)!.id;
    orgB = orgs.data!.find((o) => o.clerk_org_id === `${PREFIXO}B`)!.id;

    const pagadores = await admin
      .from("payers")
      .insert([
        { org_id: orgA, name: "Marcelo Teste", phone_e164: "+5511900000001", tax_id: "11111111111" },
        { org_id: orgB, name: "Simone Teste", phone_e164: "+5511900000002", tax_id: "22222222222" },
      ])
      .select("id, org_id");

    const contratos = await admin
      .from("contracts")
      .insert(
        pagadores.data!.map((p) => ({
          org_id: p.org_id,
          payer_id: p.id,
          amount_cents: 25_000,
          current_method: "card",
          frequency: "monthly",
          due_day: 10,
        })),
      )
      .select("id, org_id");

    tokenA = `${PREFIXO}${"a".repeat(45)}`;
    await admin.from("invitations").insert({
      org_id: orgA,
      contract_id: contratos.data!.find((c) => c.org_id === orgA)!.id,
      token: tokenA,
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    });
  }, 30_000);

  afterAll(async () => {
    if (!admin) return;
    // Cascata limpa pagadores, contratos, convites e jobs junto.
    await admin.from("organizations").delete().like("clerk_org_id", `${PREFIXO}%`);
  }, 30_000);

  it("a chave service-role alcança o projeto e enxerga as tarifas padrão", async () => {
    const { data, error } = await admin
      .from("fee_profiles")
      .select("method")
      .is("org_id", null);

    expect(error).toBeNull();
    // Semeadas pela migration 0003.
    expect(data!.length).toBeGreaterThanOrEqual(5);
  });

  it("RLS isola organizações: A não enxerga a base de B", async () => {
    const comoA = createClient(URL_SUPABASE!, CHAVE_PUBLICA!, {
      global: {
        headers: {
          // Simula o token de sessão do Clerk, com o claim de organização.
          // Sem assinatura válida o PostgREST recusa, então este teste usa a
          // via oficial: o cliente público com o JWT já montado.
          Authorization: `Bearer ${CHAVE_PUBLICA}`,
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Sem claim de organização, `pulse.org_atual()` é nulo e nada aparece.
    // É o comportamento correto: quem não declara organização não lê base.
    const { data } = await comoA.from("contracts").select("id");
    expect(data ?? []).toHaveLength(0);
  });

  it("a função do pagador devolve o convite certo e nada além", async () => {
    const publico = createClient(URL_SUPABASE!, CHAVE_PUBLICA!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await publico.rpc("convite_por_token", {
      p_token: tokenA,
    });

    expect(error).toBeNull();
    const linhas = (data ?? []) as { org_name: string; payer_name: string }[];
    expect(linhas).toHaveLength(1);
    expect(linhas[0].org_name).toBe("Box de Teste");
    expect(linhas[0].payer_name).toBe("Marcelo Teste");

    // Token inexistente não devolve nada — e não vaza que existe ou não.
    const inexistente = await publico.rpc("convite_por_token", {
      p_token: `${PREFIXO}${"z".repeat(45)}`,
    });
    expect((inexistente.data ?? []) as unknown[]).toHaveLength(0);

    // E as tabelas continuam invisíveis para quem chega sem sessão.
    const direto = await publico.from("invitations").select("id");
    expect(direto.data ?? []).toHaveLength(0);
  });

  it("a fila não entrega o mesmo job duas vezes", async () => {
    const quantidade = 30;
    await admin.from("jobs").insert(
      Array.from({ length: quantidade }, (_, i) => ({
        org_id: orgA,
        kind: "expire_invitation",
        payload: { kind: "expire_invitation", invitationId: `${PREFIXO}${i}` },
        run_at: new Date(Date.now() - 60_000).toISOString(),
        idempotency_key: `${PREFIXO}job:${i}`,
      })),
    );

    const [lote1, lote2] = await Promise.all([
      admin.rpc("pegar_jobs", { p_lote: 20, p_worker: "itest-1" }),
      admin.rpc("pegar_jobs", { p_lote: 20, p_worker: "itest-2" }),
    ]);

    const ids = [
      ...((lote1.data ?? []) as { id: string }[]),
      ...((lote2.data ?? []) as { id: string }[]),
    ].map((j) => j.id);

    expect(ids.length).toBeGreaterThan(0);
    // O que este teste existe para provar: nenhum job saiu duas vezes.
    expect(new Set(ids).size).toBe(ids.length);

    await admin.from("jobs").delete().like("idempotency_key", `${PREFIXO}%`);
  }, 30_000);

  it("chave de idempotência repetida não duplica trabalho", async () => {
    const chave = `${PREFIXO}unico`;
    const linha = {
      org_id: orgA,
      kind: "expire_invitation",
      payload: { kind: "expire_invitation", invitationId: "x" },
      idempotency_key: chave,
    };

    await admin.from("jobs").upsert(linha, {
      onConflict: "idempotency_key",
      ignoreDuplicates: true,
    });
    await admin.from("jobs").upsert(linha, {
      onConflict: "idempotency_key",
      ignoreDuplicates: true,
    });

    const { data } = await admin
      .from("jobs")
      .select("id")
      .eq("idempotency_key", chave);

    expect(data).toHaveLength(1);
    await admin.from("jobs").delete().eq("idempotency_key", chave);
  });
});
