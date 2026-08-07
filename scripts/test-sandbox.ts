/**
 * Smoke test contra o Asaas sandbox.
 * Uso: ASAAS_TEST_KEY=<chave> npx tsx scripts/test-sandbox.ts
 */
import { ClienteAsaas } from "../src/lib/gateways/asaas/client";

const CHAVE = process.env.ASAAS_TEST_KEY ?? "";
if (!CHAVE) {
  console.error("Defina ASAAS_TEST_KEY=<chave> antes de rodar.");
  process.exit(1);
}

const http = new ClienteAsaas({ apiKey: CHAVE, environment: "sandbox", webhookSecret: null });

async function main() {
  console.log("── Asaas sandbox smoke test ──────────────────────────────\n");

  console.log("1. GET /myAccount");
  try {
    const c = await http.requisitar<Record<string, unknown>>("/myAccount");
    console.log("   ✅", JSON.stringify({ name: c.name, email: c.email }));
  } catch (e: any) { console.error("   ❌", e.message); }

  console.log("2. GET /customers?limit=3");
  try {
    const r = await http.requisitar<{ data: unknown[]; totalCount?: number }>(
      "/customers", { query: { limit: 3 } }
    );
    console.log("   ✅ total:", r.totalCount);
    if (r.data[0]) console.log("   campos:", Object.keys(r.data[0] as object).join(", "));
  } catch (e: any) { console.error("   ❌", e.message); }

  console.log("3. GET /subscriptions?limit=3");
  try {
    const r = await http.requisitar<{ data: unknown[]; totalCount?: number }>(
      "/subscriptions", { query: { limit: 3 } }
    );
    console.log("   ✅ total:", r.totalCount);
    if (r.data[0]) console.log("   campos:", Object.keys(r.data[0] as object).join(", "));
  } catch (e: any) { console.error("   ❌", e.message); }

  console.log("4. POST /pixAutomaticRecurringAuthorizations (confirma: maximumValue + frequency)");
  try {
    await http.requisitar<unknown>("/pixAutomaticRecurringAuthorizations", {
      method: "POST",
      body: JSON.stringify({
        customer: "cus_000000000000",
        value: 150,
        maximumValue: 500,
        frequency: "MONTHLY",
        description: "Teste Pulse smoke",
      }),
    });
    console.log("   ✅ campos aceitos sem erro de campo inválido");
  } catch (e: any) {
    const corpo = e.detalhe?.corpo ?? "";
    const invalido = typeof corpo === "string" &&
      (corpo.includes("invalid") || corpo.includes("not found") || corpo.includes("inválido"));
    console.log(invalido ? "   ❌ campo inválido:" : "   ℹ️  erro esperado (cliente falso):", e.message);
    if (corpo) console.log("   corpo Asaas:", String(corpo).slice(0, 600));
  }

  console.log("5. GET /payments?limit=5&dueDate[ge]=2026-01-01");
  try {
    const r = await http.requisitar<{ data: unknown[]; totalCount?: number }>(
      "/payments", { query: { limit: 5, "dueDate[ge]": "2026-01-01" } }
    );
    console.log("   ✅ total:", r.totalCount);
    if (r.data[0]) console.log("   campos:", Object.keys(r.data[0] as object).join(", "));
  } catch (e: any) { console.error("   ❌", e.message); }

  console.log("\n── fim ───────────────────────────────────────────────────");
}

main();
