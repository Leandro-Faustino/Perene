import { ClienteAsaas } from "../src/lib/gateways/asaas/client";

const CHAVE = process.env.ASAAS_TEST_KEY ?? "";
const http = new ClienteAsaas({ apiKey: CHAVE, environment: "sandbox", webhookSecret: null });

async function main() {
  // 1. Verificar se o endpoint de mandatos existe (GET deve retornar lista ou 404)
  console.log("1. GET /pixAutomaticRecurringAuthorizations (endpoint existe?)");
  try {
    const r = await http.requisitar<{ data: unknown[]; totalCount?: number }>(
      "/pixAutomaticRecurringAuthorizations", { query: { limit: 5 } }
    );
    console.log("   ✅ endpoint ok, total:", r.totalCount);
  } catch (e: any) {
    console.log("   ❌ status/msg:", e.message);
    console.log("   detalhe:", JSON.stringify(e.detalhe));
  }

  // 2. Criar cliente de teste real
  console.log("2. POST /customers (criar cliente de teste)");
  let clienteId = "";
  try {
    const c = await http.requisitar<{ id: string; name: string }>("/customers", {
      method: "POST",
      body: JSON.stringify({ name: "Teste Pulse", cpfCnpj: "24971563792", email: "teste@pulse.app" }),
    });
    clienteId = c.id;
    console.log("   ✅ cliente:", clienteId, c.name);
  } catch (e: any) {
    console.log("   ❌", e.message);
    console.log("   corpo:", JSON.stringify(e.detalhe?.corpo).slice(0, 300));
  }

  if (!clienteId) { console.log("Sem clienteId — parando."); return; }

  // 3. Criar mandato com cliente real — confirma maximumValue e frequency
  console.log("3. POST /pixAutomaticRecurringAuthorizations (maximumValue + frequency)");
  try {
    const m = await http.requisitar<Record<string, unknown>>(
      "/pixAutomaticRecurringAuthorizations", {
        method: "POST",
        body: JSON.stringify({
          customer: clienteId,
          value: 150,
          maximumValue: 500,
          frequency: "MONTHLY",
          description: "Teste Pulse smoke",
        }),
      }
    );
    console.log("   ✅ mandato criado! campos retornados:", Object.keys(m).join(", "));
    console.log("   resposta:", JSON.stringify(m).slice(0, 500));
  } catch (e: any) {
    console.log("   ❌", e.message);
    console.log("   corpo Asaas:", String(e.detalhe?.corpo ?? "").slice(0, 600));
  }

  // Limpar cliente de teste
  console.log("4. DELETE /customers/" + clienteId + " (limpeza)");
  try {
    await http.requisitar(`/customers/${clienteId}`, { method: "DELETE" });
    console.log("   ✅ removido");
  } catch (e: any) {
    console.log("   ⚠️  não removido (ok):", e.message);
  }
}

main();
