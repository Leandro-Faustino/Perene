import { renderToBuffer } from "@react-pdf/renderer";

import { registrarFontes } from "@/lib/pdf/fontes";
import { DocumentoDeDiagnostico } from "@/lib/pdf/diagnostico-pdf";
import { carregarDiagnostico } from "@/lib/domain/carregar-diagnostico";
import { supabaseServidor } from "@/lib/supabase/server";
import { exigirOrgAtual } from "@/lib/clerk/user-service";

// A geração usa fontkit e o sistema de arquivos: precisa do runtime Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await exigirOrgAtual();

  const supa = supabaseServidor();

  // RLS já limita à organização da sessão — não há como pedir o PDF de outra.
  const { data: organizacao } = await supa
    .from("organizations")
    .select("name, brand_color, payer_label")
    .maybeSingle();

  if (!organizacao) {
    return new Response("Organização não encontrada.", { status: 404 });
  }

  const diagnostico = await carregarDiagnostico();
  if (!diagnostico) {
    return new Response(
      "Ainda não há base importada para gerar o diagnóstico.",
      { status: 409 },
    );
  }

  registrarFontes();

  const buffer = await renderToBuffer(
    DocumentoDeDiagnostico({
      organizacao: {
        nome: organizacao.name,
        corDeMarca: organizacao.brand_color,
        rotuloDoPagador: organizacao.payer_label,
      },
      diagnostico,
      geradoEm: new Date(),
    }),
  );

  const arquivo = `diagnostico-${organizacao.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      // `inline` e não `attachment`: o operador abre, confere e decide se
      // encaminha. O PDF existe para circular (§3.6), e forçar download antes
      // de ele ver o conteúdo põe atrito no meio disso.
      "Content-Disposition": `inline; filename="${arquivo}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
