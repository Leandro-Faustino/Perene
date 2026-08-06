import { supabaseServidor } from "@/lib/supabase/server";
import {
  TEMPLATES,
  montarAvisoPre,
  montarPixAvulso,
} from "@/lib/messaging/templates";
import { EditorDeTemplate, FormularioDeNotificacao } from "./editor-de-template";

export const metadata = { title: "Configurações — Mensagens" };

/** Dados de exemplo usados para renderizar o preview do template padrão. */
const EXEMPLO = {
  pagador: "Maria Silva",
  organizacao: "Academia Exemplo",
  valorCentavos: 15000,
  link: "https://pulse.app/autorizar/exemplo",
  rotuloDoPagador: "aluno",
  dataDebito: "15 de setembro",
  cycleRef: "2026-08",
};

const TEMPLATES_CONFIG = [
  {
    chave: "convite_d0",
    rotulo: "Convite — D0",
    descricao: "Primeira mensagem enviada quando o convite chega ao pagador.",
    variaveis: "{pagador} {organizacao} {valor} {link}",
    exemplo: TEMPLATES.convite_d0.montar({
      pagador: EXEMPLO.pagador,
      organizacao: EXEMPLO.organizacao,
      valorCentavos: EXEMPLO.valorCentavos,
      link: EXEMPLO.link,
      rotuloDoPagador: EXEMPLO.rotuloDoPagador,
    }),
  },
  {
    chave: "convite_d2",
    rotulo: "Convite — D+2",
    descricao: "Lembrete enviado 2 dias após o convite inicial.",
    variaveis: "{pagador} {organizacao} {valor} {link}",
    exemplo: TEMPLATES.convite_d2.montar({
      pagador: EXEMPLO.pagador,
      organizacao: EXEMPLO.organizacao,
      valorCentavos: EXEMPLO.valorCentavos,
      link: EXEMPLO.link,
      rotuloDoPagador: EXEMPLO.rotuloDoPagador,
    }),
  },
  {
    chave: "convite_d5",
    rotulo: "Convite — D+5",
    descricao: "Segundo lembrete, com explicação sobre o Pix Automático.",
    variaveis: "{pagador} {organizacao} {valor} {link}",
    exemplo: TEMPLATES.convite_d5.montar({
      pagador: EXEMPLO.pagador,
      organizacao: EXEMPLO.organizacao,
      valorCentavos: EXEMPLO.valorCentavos,
      link: EXEMPLO.link,
      rotuloDoPagador: EXEMPLO.rotuloDoPagador,
    }),
  },
  {
    chave: "convite_d10",
    rotulo: "Convite — D+10",
    descricao: "Último lembrete. A régua para após este.",
    variaveis: "{pagador} {organizacao} {valor} {link}",
    exemplo: TEMPLATES.convite_d10.montar({
      pagador: EXEMPLO.pagador,
      organizacao: EXEMPLO.organizacao,
      valorCentavos: EXEMPLO.valorCentavos,
      link: EXEMPLO.link,
      rotuloDoPagador: EXEMPLO.rotuloDoPagador,
    }),
  },
  {
    chave: "aviso_pre_cobranca",
    rotulo: "Aviso pré-débito (D-3)",
    descricao: "Enviado 3 dias antes do débito automático — avisa, não cobra.",
    variaveis: "{pagador} {organizacao} {valor} {dataDebito}",
    exemplo: montarAvisoPre({
      pagador: EXEMPLO.pagador,
      organizacao: EXEMPLO.organizacao,
      valorCentavos: EXEMPLO.valorCentavos,
      dataDebito: EXEMPLO.dataDebito,
    }),
  },
  {
    chave: "pix_avulso",
    rotulo: "Pix avulso (cobrança que falhou)",
    descricao: "Enviado quando o débito automático não passa — traz link de pagamento alternativo.",
    variaveis: "{pagador} {organizacao} {valor} {link} {mesRef}",
    exemplo: montarPixAvulso({
      pagador: EXEMPLO.pagador,
      organizacao: EXEMPLO.organizacao,
      valorCentavos: EXEMPLO.valorCentavos,
      cycleRef: EXEMPLO.cycleRef,
      link: EXEMPLO.link,
    }),
  },
] as const;

export default async function PaginaDeMensagens() {
  const supa = supabaseServidor();

  // Carrega templates customizados e configurações da org num só round-trip.
  const [{ data: customTemplates }, { data: org }] = await Promise.all([
    supa
      .from("message_templates")
      .select("key, body")
      .eq("channel", "whatsapp"),
    supa.from("organizations").select("notification_phone").maybeSingle(),
  ]);

  const customPorChave: Record<string, string> = {};
  for (const t of customTemplates ?? []) {
    customPorChave[t.key] = t.body;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
          Mensagens
        </h1>
        <p className="mt-1 text-[15px] text-texto">
          Personalize os textos enviados pela régua e pelo ciclo de cobrança.
          Deixe em branco para usar o texto padrão da Pulse.
        </p>
      </div>

      {/* Templates da régua e operacionais */}
      <section className="space-y-4">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
          Templates de mensagem (WhatsApp)
        </h2>

        {TEMPLATES_CONFIG.map((tpl) => (
          <EditorDeTemplate
            key={tpl.chave}
            chave={tpl.chave}
            rotulo={tpl.rotulo}
            descricao={tpl.descricao}
            variaveis={tpl.variaveis}
            corpoAtual={customPorChave[tpl.chave] ?? ""}
            exemploPadrao={tpl.exemplo}
          />
        ))}
      </section>

      {/* Notificações do operador */}
      <section className="space-y-4">
        <div>
          <h2 className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
            Notificações do operador
          </h2>
          <p className="mt-1 text-[13px] text-texto-medio">
            Alertas de eventos críticos e o resumo diário são enviados para
            este número.
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <FormularioDeNotificacao
            telefoneAtual={org?.notification_phone ?? null}
          />
        </div>
      </section>
    </div>
  );
}
