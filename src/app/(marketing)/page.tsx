import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/marca/logo";
import { Botao } from "@/components/ui/botao";
import { ExtratoCalculadora } from "./_components/extrato-calculadora";
import { CtaDiagnostico } from "./_components/cta-diagnostico";
import {
  MockupComparacao,
  MockupFalha,
  MockupAutorizacoes,
  MockupTelefone,
  MockupRadarDash,
} from "./_components/mockups-landing";
import { HeroPulso, HeroGrade, PadraoGrid } from "./_components/icones-landing";

export default function Landing() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* ─── NAV — fundo escuro para se fundir com o hero ────────────────────── */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-6 border-b border-white/10 bg-[#07111D]/95 px-6 backdrop-blur-md">
        <Logo tom="escuro" />
        <nav className="hidden items-center gap-6 text-[14px] text-white/60 md:flex">
          {[
            ["#problema", "O problema"],
            ["#como", "Como funciona"],
            ["#oferta", "A oferta"],
            ["#garantia", "Garantia"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Botao
            asChild
            variante="fantasma"
            tamanho="painel"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Link href="/entrar">Entrar</Link>
          </Botao>
          <CtaDiagnostico tamanho="painel">Fazer diagnóstico</CtaDiagnostico>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── HERO ────────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28"
          id="calculadora"
          style={{
            background:
              "linear-gradient(135deg, #07111D 0%, #0B1D30 45%, #0A1826 100%)",
          }}
        >
          {/* grade de fundo — muito sutil */}
          <HeroGrade className="absolute inset-0 h-full w-full text-white/[0.04]" />

          {/* linha de pulso — posicionada no terço inferior */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[55%]">
            <HeroPulso className="h-full w-full text-[var(--pl-cobalto)] opacity-30" />
          </div>

          {/* brilho ambiente — esquerda cobalto */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-0 h-[560px] w-[560px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0,56,229,0.18) 0%, transparent 70%)",
            }}
          />
          {/* brilho ambiente — direita verde */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 bottom-0 h-[400px] w-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(14,159,110,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {/* ── Coluna de texto ── */}
            <div>
              {/* pill eyebrow */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--pl-ativo)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
                  Para negócios de mensalidade recorrente
                </span>
              </div>

              <h1 className="font-titulo text-[clamp(2.4rem,5.2vw,4.2rem)] font-bold leading-[1.04] tracking-tight text-white">
                Sua base já pagou.
                <br />
                A taxa fica com o{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">cartão</span>
                  <span
                    aria-hidden
                    className="absolute left-[-2%] right-[-2%] top-[55%] z-20 block h-[0.1em] origin-left bg-[var(--pl-risco)] [animation:strike_0.8s_cubic-bezier(0.2,0.8,0.3,1)_0.6s_forwards] [transform:scaleX(0)]"
                  />
                </span>
                .
              </h1>

              <p className="mt-6 max-w-[50ch] text-[1.08rem] leading-relaxed text-white/60">
                A Pulse migra sua base para Pix Automático sem interromper nenhuma cobrança — e
                avisa no mesmo dia quando uma autorização quebra.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <CtaDiagnostico tamanho="site">
                  Gerar meu diagnóstico em PDF
                </CtaDiagnostico>
                <span className="font-mono text-[12px] text-white/40">
                  Grátis · leva menos de 10 minutos
                </span>
              </div>

              {/* métricas — glass cards */}
              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { n: "98%", l: "menos custo de cobrança", cor: "cobalto" as const },
                  { n: "60d", l: "para migrar a base", cor: "ativo" as const },
                  { n: "0", l: "cobranças interrompidas", cor: "neutro" as const },
                ].map((m) => (
                  <MetricaBadge key={m.n} valor={m.n} rotulo={m.l} cor={m.cor} />
                ))}
              </div>
            </div>

            {/* ── Calculadora — card claro flutuando sobre escuro ── */}
            <div className="relative">
              {/* reflexo/brilho atrás do card */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-3xl opacity-40 blur-2xl"
                style={{
                  background:
                    "radial-gradient(ellipse at 60% 40%, rgba(0,56,229,0.35) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <ExtratoCalculadora />
              </div>
            </div>
          </div>

          {/* gradiente de transição para a próxima seção clara */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
            style={{
              background: "linear-gradient(to bottom, transparent, #f5f7fb)",
            }}
          />
        </section>

        {/* ─── PROBLEMA / torneiras ────────────────────────────────────────────── */}
        <div
          className="border-y bg-[var(--pl-grafite)] px-6 py-5 text-center"
          id="problema"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6E8598]">
            Negócio de recorrência não morre de uma vez —{" "}
            <span className="text-white">ele vaza por três torneiras ao mesmo tempo</span>
          </p>
        </div>

        {/* ─── TORNEIRA 1 — Taxa ───────────────────────────────────────────────── */}
        <section className="bg-[#f5f7fb] px-6 py-24 md:py-32">
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <MockupComparacao />

            <div>
              <Tag cor="risco">Torneira 1 de 3</Tag>
              <h2 className="mt-4 font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight">
                A taxa que come a margem antes de você ver o extrato.
              </h2>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-texto">
                Cada mensalidade passa por um pedágio percentual. Quanto mais contratos você tem,
                mais a taxa leva — sem que nada de melhor aconteça em troca.
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-[var(--pl-ativo-bg)] px-5 py-4">
                <span className="mt-0.5 font-mono text-[var(--pl-ativo)]">→</span>
                <p className="text-[14px] text-[var(--pl-ativo-texto)]">
                  <strong>Com Pix Automático:</strong> R$&nbsp;0,10 por transação, independente do
                  valor da mensalidade. A conta para de crescer com você.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TORNEIRA 2 — Falha silenciosa ──────────────────────────────────── */}
        <section className="bg-white px-6 py-24 md:py-32">
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <Tag cor="risco">Torneira 2 de 3</Tag>
              <h2 className="mt-4 font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight">
                A cobrança que falha às 9h e ninguém percebe até o fim do mês.
              </h2>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-texto">
                Cartão vencido, limite estourado, boleto não pago. O cliente continua usando o
                serviço e o mês fecha com um buraco que vira "inadimplência" sem nome nem rosto.
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-[var(--pl-ativo-bg)] px-5 py-4">
                <span className="mt-0.5 font-mono text-[var(--pl-ativo)]">→</span>
                <p className="text-[14px] text-[var(--pl-ativo-texto)]">
                  <strong>Com Pulse:</strong> falhou às 9h, o pagador recebe um Pix avulso às
                  9h01. Receita recuperada no mesmo dia.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <MockupFalha />
            </div>
          </div>
        </section>

        {/* ─── TORNEIRA 3 — Saída involuntária ────────────────────────────────── */}
        <section className="bg-[#f5f7fb] px-6 py-24 md:py-32">
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <MockupAutorizacoes />

            <div>
              <Tag cor="risco">Torneira 3 de 3</Tag>
              <h2 className="mt-4 font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight">
                O cliente que saiu sem ter decidido sair.
              </h2>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-texto">
                A autorização cai, a cobrança para, e quando alguém repara já são três meses.
                Metade dessas pessoas não queria cancelar — simplesmente nunca foi avisada.
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-[var(--pl-ativo-bg)] px-5 py-4">
                <span className="mt-0.5 font-mono text-[var(--pl-ativo)]">→</span>
                <p className="text-[14px] text-[var(--pl-ativo-texto)]">
                  <strong>Com Pulse:</strong> autorização cancelada vira alerta no mesmo dia, com
                  a ação de recuperação já pronta do lado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── POSICIONAMENTO ──────────────────────────────────────────────────── */}
        <section className="bg-[var(--pl-grafite)] px-6 py-20 md:py-28">
          <div className="mx-auto max-w-[1180px]">
            <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6E8598]">
                  Comparado a quê
                </p>
                <h2 className="font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight text-white">
                  A Pulse não substitui o que você já usa.
                </h2>
                <p className="mt-5 max-w-[46ch] text-[1.05rem] leading-relaxed text-[#9FB3C0]">
                  Seu gateway já tem o botão de Pix Automático. O problema nunca foi o botão — é
                  que ninguém aperta.
                </p>
                <div className="mt-6 border-l-4 border-[var(--pl-cobalto)] bg-[#101E2B] px-5 py-4">
                  <p className="text-[14px] leading-relaxed text-[#CBD9E2]">
                    <strong className="text-white">
                      Isso ajuda a migrar, ou ajuda a manter a autorização viva?
                    </strong>{" "}
                    Se não faz nem uma coisa nem outra, fica de fora.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px rounded-2xl overflow-hidden bg-[#1E3248]">
                {[
                  ["Não é gateway", "O dinheiro nunca passa por nós. Sua conta, seu contrato, sua taxa negociada."],
                  ["Não é ERP", "Sem agenda, catraca ou prontuário. O sistema que você usa todo dia continua o mesmo."],
                  ["Não é fiscal", "Nota fiscal fica com quem já faz. Não trocamos problema resolvido por problema novo."],
                  ["Não é CRM", "Guardamos só o necessário para cobrar e reter. Sem campos que ninguém preenche."],
                ].map(([t, d]) => (
                  <div key={t} className="bg-[#172436] p-6">
                    <p className="mb-2 font-titulo font-bold text-white">{t}</p>
                    <p className="text-[13px] leading-relaxed text-[#7A95AE]">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── MECANISMO ───────────────────────────────────────────────────────── */}
        <section className="bg-white px-6 py-24 md:py-32" id="como">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-14 max-w-[56ch]">
              <Eyebrow>O mecanismo</Eyebrow>
              <h2 className="font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight">
                Quatro movimentos. Você participa de um.
              </h2>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-texto">
                A migração é feita em ondas, não de uma vez. Começa por quem mais falha hoje.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  n: "01",
                  t: "Diagnóstico",
                  q: "Dia 1 · menos de 10 min",
                  d: "12 meses do seu gateway lidos e entregues como PDF com a sua marca. Seu, migrando ou não.",
                  fundo: "bg-[#eef2ff]",
                  cor: "text-[var(--pl-cobalto)]",
                  icone: (
                    <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
                      <rect x="3" y="2" width="18" height="24" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <rect x="7" y="16" width="3" height="5" rx="1" fill="currentColor" opacity=".4" />
                      <rect x="11.5" y="13" width="3" height="8" rx="1" fill="currentColor" opacity=".7" />
                      <rect x="16" y="10" width="3" height="11" rx="1" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  n: "02",
                  t: "Onda de migração",
                  q: "Semana 1 · você aprova",
                  d: "Primeiro lote segmentado por histórico de falha. Régua automática: convite D0, lembrete D+2, encerra D+10.",
                  fundo: "bg-[#e8f8f2]",
                  cor: "text-[var(--pl-ativo)]",
                  icone: (
                    <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
                      <rect x="2" y="18" width="5" height="8" rx="1" fill="currentColor" />
                      <rect x="9" y="12" width="5" height="14" rx="1" fill="currentColor" opacity=".7" />
                      <rect x="16" y="6" width="5" height="20" rx="1" fill="currentColor" opacity=".4" />
                      <circle cx="22" cy="5" r="5" fill="currentColor" />
                      <polyline points="19,5 21,7 25,3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  ),
                },
                {
                  n: "03",
                  t: "Autorização",
                  q: "Pagador · 3 toques",
                  d: "Link com o seu logo, valor e dia. Confirma no app do banco que ele já usa. Sem conta nova, sem senha.",
                  fundo: "bg-[#fff8ec]",
                  cor: "text-[var(--pl-pendente-texto)]",
                  icone: (
                    <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
                      <rect x="8" y="2" width="12" height="24" rx="3" stroke="currentColor" strokeWidth="1.6" />
                      <line x1="8" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.3" />
                      <line x1="8" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="14" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                      <polyline points="11,14 13,16 17,11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  ),
                },
                {
                  n: "04",
                  t: "Radar",
                  q: "Todo dia, para sempre",
                  d: "Cancelamento, expiração e falhas viram alerta no mesmo dia com ação clara do lado.",
                  fundo: "bg-[#fdf0f0]",
                  cor: "text-[var(--pl-risco-texto)]",
                  icone: (
                    <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
                      <path d="M14 3c-5.523 0-10 4.477-10 10v7l-2 3h24l-2-3V13C24 7.477 19.523 3 14 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M11 25a3 3 0 006 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="22" cy="5" r="4" fill="currentColor" />
                      <line x1="22" y1="3.5" x2="22" y2="5.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="22" cy="6.8" r="0.7" fill="white" />
                    </svg>
                  ),
                },
              ].map((p) => (
                <div
                  key={p.n}
                  className="flex flex-col rounded-2xl border border-[var(--pl-borda)] bg-white p-6 shadow-[0_4px_20px_rgba(30,39,64,0.06)]"
                >
                  <div className={`mb-5 w-fit rounded-xl ${p.fundo} p-3`}>
                    <span className={p.cor}>{p.icone}</span>
                  </div>
                  <p className={`mb-1 font-mono text-[10px] font-bold uppercase tracking-wider ${p.cor}`}>
                    {p.n} — {p.q}
                  </p>
                  <h3 className="mb-3 font-titulo font-bold">{p.t}</h3>
                  <p className="flex-1 text-[13px] leading-relaxed text-texto">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURE: Autorização ────────────────────────────────────────────── */}
        <section className="bg-[#eef2ff] px-6 py-24 md:py-32">
          <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <Eyebrow>Do lado do pagador</Eyebrow>
              <h2 className="font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight">
                Três toques. Sem conta, sem senha, sem app novo.
              </h2>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-texto">
                Seu cliente abre um link com o seu logo, confere valor e dia, e confirma dentro do
                app do banco que ele já usa. Depois disso, ele nunca mais precisa fazer nada.
              </p>

              <ol className="mt-8 space-y-4">
                {[
                  "Recebe o link com o seu logo e o nome dele",
                  "Confere valor, dia de vencimento e teto",
                  "Toca uma vez e confirma no app do banco",
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--pl-cobalto)] font-mono text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-[15px] text-texto">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex justify-center">
              <MockupTelefone />
            </div>
          </div>
        </section>

        {/* ─── FEATURE: Radar ──────────────────────────────────────────────────── */}
        <section className="bg-white px-6 py-24 md:py-32">
          <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <MockupRadarDash />

            <div>
              <Eyebrow>Retenção automática</Eyebrow>
              <h2 className="font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight">
                Autorização quebrada. Você sabe no mesmo dia.
              </h2>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-texto">
                É a parte que ninguém vende — e que decide se a migração valeu. Sem radar, a base
                migrada começa a vazar de novo, em silêncio.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "Cancelamento via banco → alerta imediato",
                  "Autorização expirando → campanha de renovação",
                  "3 falhas seguidas → Pix avulso automático",
                  "Reajuste acima do teto → reautorização dirigida",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[14px] text-texto">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--pl-cobalto)]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── A OFERTA ────────────────────────────────────────────────────────── */}
        <section className="bg-[#f5f7fb] px-6 py-24 md:py-32" id="oferta">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-14 max-w-[56ch]">
              <span className="mb-4 inline-block bg-primary px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white">
                Migração Assistida em 60 dias
              </span>
              <h2 className="font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight">
                Não vendemos acesso. Vendemos a base migrada.
              </h2>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-texto">
                Software sozinho não migra ninguém. A Pulse opera a campanha inteira dos primeiros
                60 dias, com você aprovando cada onda.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
              {/* items do stack */}
              <div className="space-y-3">
                {/* incluídos */}
                <p className="font-mono text-[10px] uppercase tracking-widest text-texto-medio">
                  Incluído em todos os planos
                </p>
                <div className="overflow-hidden rounded-2xl border border-[var(--pl-grafite)] bg-white">
                  {[
                    { t: "Diagnóstico de vazamento completo", d: "Sua base real, 12 meses, custo por método, falhas. PDF com a sua marca.", w: "Antes de pagar" },
                    { t: "Importação e higienização", d: "Sync com gateway ou CSV. Duplicados para revisão. Celular normalizado." },
                    { t: "Configuração técnica por nós", d: "Credencial, webhook, permissão de Pix, teste de conexão. Sem dev." },
                    { t: "Ondas operadas", d: "Segmentação, régua, disparo, retomada. Você aprova a lista; nós rodamos." },
                    { t: "Página de autorização com a sua marca", d: "Seu logo, cor, nome, valor, dia. Sem login, sem cookie de rastreio." },
                    { t: "Radar de autorização", d: "Cancelamento e falha viram alerta no mesmo dia com a ação do lado." },
                  ].map((r, i, arr) => (
                    <div
                      key={r.t}
                      className={`flex items-start gap-4 px-6 py-4 ${i < arr.length - 1 ? "border-b" : ""}`}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--pl-cobalto)]">
                        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <p className="font-titulo font-bold">{r.t}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-texto-medio">{r.d}</p>
                      </div>
                      {r.w && (
                        <span className="shrink-0 font-mono text-[11px] text-texto-medio">{r.w}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* bônus */}
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--pl-ativo-texto)]">
                  Bônus — incluídos por padrão
                </p>
                <div className="overflow-hidden rounded-2xl border border-[var(--pl-ativo)] bg-[#f0fdf4]">
                  {[
                    { t: "Pix avulso automático na falha", d: "Falhou → pagador recebe Pix para quitar no mesmo dia." },
                    { t: "Reajuste sem quebrar autorização", d: "Reajuste acima do teto → reautorização dirigida antes da cobrança falhar." },
                    { t: "Relatório mensal de economia comprovada", d: "% migrado, economia acumulada, inadimplência antes e depois." },
                  ].map((r, i, arr) => (
                    <div
                      key={r.t}
                      className={`flex items-start gap-4 px-6 py-4 ${i < arr.length - 1 ? "border-b border-[#bbf7d0]" : ""}`}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--pl-ativo)]">
                        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <p className="font-titulo font-bold">{r.t}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-texto-medio">{r.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* painel de preço sticky */}
              <div className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-2xl border border-[var(--pl-grafite)] bg-[var(--pl-grafite)]">
                  <div className="p-6">
                    <h3 className="font-titulo text-[1.3rem] font-bold leading-tight text-white">
                      O preço sai de dentro da economia que você já tem
                    </h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-[#9FB3C0]">
                      Valor fixo mensal — não por contrato. Se a economia não pagar a nossa
                      mensalidade, ela é suspensa.
                    </p>
                  </div>
                  <div className="mx-4 mb-4 divide-y divide-[#24384A] rounded-xl border border-[#2A4055] bg-[#101E2B] px-5 py-2">
                    <LinhaPreco rotulo="Vazamento anual" valor="→ calculadora no topo" />
                    <LinhaPreco rotulo="Implantação" valor="a definir" />
                    <LinhaPreco rotulo="Mensalidade" valor="a definir" />
                    <LinhaPreco rotulo="Sobra, ano 1" valor="a definir" destaque />
                  </div>
                  <div className="p-4 pt-0">
                    <Botao asChild tamanho="site" className="w-full">
                      <Link href="/cadastrar">Começar o diagnóstico</Link>
                    </Botao>
                    <p className="mt-3 text-center font-mono text-[10px] text-[#6E8598]">
                      Grátis · Sem cartão · PDF com sua marca
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── GARANTIAS ───────────────────────────────────────────────────────── */}
        <section className="bg-white px-6 py-24 md:py-32" id="garantia">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-14 text-center">
              <Eyebrow className="justify-center">O risco é nosso</Eyebrow>
              <h2 className="font-titulo text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight">
                Duas coisas que você teme, por escrito.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <GarantiaCard
                tag="Garantia 1 · de economia"
                titulo="Se a economia não cobrir a mensalidade, você não paga."
                texto="Em 60 dias, o relatório mostra quanto a base migrada economizou — lido do gateway, não estimado. Se não cobrir a mensalidade, ela é suspensa e continuamos operando até que cubra. A implantação você paga uma vez."
                medo='"pago e ninguém migra"'
                cor="ativo"
              />
              <GarantiaCard
                tag="Garantia 2 · de continuidade"
                titulo="Nenhum contrato é interrompido para migrar."
                texto="Quem autoriza passa para Pix Automático. Quem não autoriza continua sendo cobrado exatamente como hoje — mesmo cartão, mesmo dia, mesmo gateway. A base nunca fica no vácuo entre um método e outro."
                medo='"vou perder cliente no meio do caminho"'
                cor="cobalto"
              />
            </div>
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
        <section className="bg-[#f5f7fb] px-6 py-24 md:py-32">
          <div className="mx-auto max-w-[1180px]">
            <div className="grid gap-14 lg:grid-cols-[320px_1fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <Eyebrow>Perguntas frequentes</Eyebrow>
                <h2 className="font-titulo text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-tight">
                  As dúvidas legítimas.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-texto">
                  Se a sua não estiver aqui, o diagnóstico responde — e é gratuito de qualquer
                  forma.
                </p>
                <div className="mt-8">
                  <Botao asChild tamanho="site">
                    <Link href="/cadastrar">Gerar diagnóstico grátis</Link>
                  </Botao>
                </div>
              </div>

              <div className="divide-y border-t border-[var(--pl-grafite)] bg-white rounded-2xl overflow-hidden border">
                {[
                  {
                    p: "Meu gateway já oferece Pix Automático. Por que eu precisaria de vocês?",
                    r: "Porque ele te dá a ferramenta, não o resultado. O gateway gera o link de autorização — e para por aí. Quem decide a ordem da fila, escreve e dispara o convite, faz o lembrete no dia certo, para a régua quando o cliente já autorizou, recupera quem não abriu, e percebe no mesmo dia quando uma autorização cai três meses depois? Você continua com o seu gateway e sua taxa negociada. A Pulse é a operação por cima.",
                  },
                  {
                    p: "E se o banco do meu cliente não suportar Pix Automático?",
                    r: "A página avisa em português claro que aquele banco ainda não oferece, e o contrato continua sendo cobrado como está hoje, sem interrupção. Ele volta para o pool e entra numa onda futura. É exatamente por isso que migramos em ondas — a cobertura bancária cresce a cada mês.",
                  },
                  {
                    p: "Meu cliente vai achar complicado autorizar?",
                    r: "São três toques: abre o link com o seu logo, vê o próprio nome e o valor, confirma no app do banco que ele já usa. Sem conta nova, sem app instalado, sem senha criada. Depois disso, ele nunca mais precisa entrar em lugar nenhum.",
                  },
                  {
                    p: "Vocês ficam com o meu dinheiro?",
                    r: "Não. O dinheiro vai do cliente direto para a conta que você tem no gateway. Se você cancelar amanhã, as autorizações continuam vivas e as cobranças seguem acontecendo — você perde a operação e os alertas, não o recebimento.",
                  },
                  {
                    p: "Quanto tempo preciso dedicar a isso?",
                    r: "Aprovar a lista de cada onda e olhar a fila de alertas. Importação, configuração de webhook, mensagens, disparo, retomada e monitoramento são nossos. Se exigisse muito mais do dono, não sairia do papel — e sabemos disso porque é o que acontece quando alguém tenta migrar sozinho.",
                  },
                ].map(({ p, r }) => (
                  <FaqItem key={p} pergunta={p}>
                    {r}
                  </FaqItem>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[var(--pl-grafite)] px-6 py-28 md:py-36">
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--pl-cobalto)] opacity-10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[var(--pl-ativo)] opacity-10 blur-3xl" />
          <PadraoGrid className="absolute right-0 top-0 h-full w-1/2 text-white opacity-[0.025]" />

          <div className="relative mx-auto max-w-[860px] text-center">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6E8598]">
              Começa aqui
            </p>
            <h2 className="font-titulo text-[clamp(2rem,5vw,3.6rem)] font-bold leading-tight text-white">
              Primeiro o número.
              <br />
              Depois a conversa.
            </h2>
            <p className="mx-auto mt-6 max-w-[50ch] text-[1.05rem] leading-relaxed text-[#9FB3C0]">
              O diagnóstico lê a sua base de verdade e devolve um PDF com quanto a taxa levou nos
              últimos 12 meses e quanto sobraria com 50%, 70% e 90% da base migrada.
              <br />
              <strong className="text-white">
                Se o número for pequeno, a gente te diz para não contratar.
              </strong>
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Botao asChild tamanho="site">
                <Link href="/cadastrar">Gerar meu diagnóstico</Link>
              </Botao>
              <span className="font-mono text-[12px] text-[#6E8598]">
                Menos de 10 minutos · Sem cartão · O PDF é seu
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1A2E42] bg-[var(--pl-grafite)] px-6 py-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4">
          <Logo tom="escuro" />
          <p className="text-[13px] text-[#6E8598]">
            Migração e retenção de recorrência. Não somos gateway, ERP, CRM nem emissor fiscal.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Componentes de suporte ──────────────────────────────────────────────────

function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-texto-medio ${className}`}
    >
      {children}
      <span className="h-px flex-1 bg-[var(--pl-borda)]" />
    </p>
  );
}

function Tag({ children, cor }: { children: ReactNode; cor: "risco" | "ativo" | "cobalto" }) {
  const estilos = {
    risco: "bg-[var(--pl-risco-bg)] text-[var(--pl-risco-texto)]",
    ativo: "bg-[var(--pl-ativo-bg)] text-[var(--pl-ativo-texto)]",
    cobalto: "bg-[#eef2ff] text-[var(--pl-cobalto)]",
  }[cor];
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${estilos}`}
    >
      {children}
    </span>
  );
}

function MetricaBadge({
  valor,
  rotulo,
  cor,
}: {
  valor: string;
  rotulo: string;
  cor: "cobalto" | "ativo" | "neutro";
}) {
  const valorCor = {
    cobalto: "text-[var(--pl-cobalto-claro)]",
    ativo: "text-[var(--pl-ativo)]",
    neutro: "text-white",
  }[cor];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <p className={`font-titulo text-[1.8rem] font-black leading-none ${valorCor}`}>{valor}</p>
      <p className="mt-1 text-[11px] leading-tight text-white/50">{rotulo}</p>
    </div>
  );
}

function GarantiaCard({
  tag,
  titulo,
  texto,
  medo,
  cor,
}: {
  tag: string;
  titulo: string;
  texto: string;
  medo: string;
  cor: "ativo" | "cobalto";
}) {
  const borda = cor === "ativo" ? "border-l-[var(--pl-ativo)]" : "border-l-[var(--pl-cobalto)]";
  const tagCor = cor === "ativo" ? "text-[var(--pl-ativo-texto)]" : "text-[var(--pl-cobalto)]";
  const iconBg = cor === "ativo" ? "bg-[var(--pl-ativo-bg)] text-[var(--pl-ativo)]" : "bg-[#eef2ff] text-[var(--pl-cobalto)]";
  return (
    <div className={`rounded-2xl border border-[var(--pl-grafite)] bg-white overflow-hidden`}>
      <div className={`border-l-4 ${borda} p-8`}>
        <div className="mb-4 flex items-start gap-4">
          <div className={`shrink-0 rounded-xl p-3 ${iconBg}`}>
            <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
              <path
                d="M16 2L3 8v10c0 7.18 5.52 13.9 13 15.9 7.48-2 13-8.72 13-15.9V8L16 2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <polyline
                points="10,16 14,20 22,12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div>
            <p className={`mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider ${tagCor}`}>
              {tag}
            </p>
            <h3 className="font-titulo text-[1.1rem] font-bold leading-snug">{titulo}</h3>
          </div>
        </div>
        <p className="text-[15px] leading-relaxed text-texto">{texto}</p>
        <p className="mt-5 border-t pt-4 font-mono text-[11px] text-texto-medio">
          O medo que isto inverte: <em>{medo}</em>
        </p>
      </div>
    </div>
  );
}

function LinhaPreco({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 py-2.5 font-mono text-[13px] tabular-nums ${
        destaque ? "pt-4 font-semibold text-white" : "text-[#9FB3C0]"
      }`}
    >
      <span>{rotulo}</span>
      <span className={destaque ? "text-[var(--pl-cobalto-claro)]" : ""}>{valor}</span>
    </div>
  );
}

function FaqItem({ pergunta, children }: { pergunta: string; children: ReactNode }) {
  return (
    <details className="group px-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-titulo font-bold [&::-webkit-details-marker]:hidden">
        {pergunta}
        <span className="shrink-0 font-mono text-xl text-texto-medio transition-transform duration-200 group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="max-w-[68ch] pb-6 text-[15px] leading-relaxed text-texto">{children}</p>
    </details>
  );
}
