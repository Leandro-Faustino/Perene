import { ClienteAsaas } from "../src/lib/gateways/asaas/client";

const CHAVE = process.env.ASAAS_API_KEY ?? "";
const http = new ClienteAsaas({ apiKey: CHAVE, environment: "sandbox", webhookSecret: null });

async function main() {
  // 1. Confirmar endpoint de autorização
  console.log("1. GET /pix/automatic/authorizations (lista)");
  try {
    const r = await http.requisitar<{ data: unknown[]; totalCount?: number }>(
      "/pix/automatic/authorizations", { query: { limit: 3 } }
    );
    console.log("   ✅ total:", r.totalCount);
    if (r.data[0]) console.log("   campos:", Object.keys(r.data[0] as object).join(", "));
  } catch (e: any) { console.log("   ❌", e.message, e.detalhe?.status); }

  // 2. Criar cliente de teste
  console.log("2. POST /customers (cliente de teste)");
  let clienteId = "";
  try {
    const c = await http.requisitar<{ id: string }>("/customers", {
      method: "POST",
      body: JSON.stringify({ name: "Teste Pulse", cpfCnpj: "24971563792", email: "teste@pulse.app" }),
    });
    clienteId = c.id;
    console.log("   ✅ id:", clienteId);
  } catch (e: any) { console.log("   ❌", e.message); }

  if (!clienteId) return;

  // 3. Criar autorização com campos que usamos — ver quais são aceitos
  console.log("3. POST /pix/automatic/authorizations");
  let authId = "";
  try {
    const m = await http.requisitar<Record<string, unknown>>(
      "/pix/automatic/authorizations", {
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
    authId = String(m.id ?? "");
    console.log("   ✅ autorização criada! id:", authId);
    console.log("   campos retornados:", Object.keys(m).join(", "));
    console.log("   resposta:", JSON.stringify(m).slice(0, 600));
  } catch (e: any) {
    console.log("   ❌", e.message);
    console.log("   corpo:", String(e.detalhe?.corpo ?? "").slice(0, 800));
  }

  // 4. GET autorização individual
  if (authId) {
    console.log("4. GET /pix/automatic/authorizations/" + authId);
    try {
      const r = await http.requisitar<Record<string, unknown>>(`/pix/automatic/authorizations/${authId}`);
      console.log("   ✅ status:", r.status, "campos:", Object.keys(r).join(", "));
    } catch (e: any) { console.log("   ❌", e.message); }

    // 5. Cancelar
    console.log("5. DELETE /pix/automatic/authorizations/" + authId);
    try {
      await http.requisitar(`/pix/automatic/authorizations/${authId}`, { method: "DELETE" });
      console.log("   ✅ cancelada");
    } catch (e: any) { console.log("   ⚠️ ", e.message); }
  }

  // 6. Listar paymentInstructions
  console.log("6. GET /pix/automatic/paymentInstructions");
  try {
    const r = await http.requisitar<{ data: unknown[]; totalCount?: number }>(
      "/pix/automatic/paymentInstructions", { query: { limit: 3 } }
    );
    console.log("   ✅ total:", r.totalCount);
    if (r.data[0]) console.log("   campos:", Object.keys(r.data[0] as object).join(", "));
  } catch (e: any) { console.log("   ❌", e.message, e.detalhe?.status); }

  // Limpar cliente
  await http.requisitar(`/customers/${clienteId}`, { method: "DELETE" }).catch(() => null);
  console.log("\n✅ Limpeza feita.");
}

main();
