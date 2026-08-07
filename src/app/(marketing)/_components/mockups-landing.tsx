/**
 * Mockups de produto para a landing page.
 * Componentes de UI que simulam screenshots reais da Pulse,
 * criados em HTML/CSS para não depender de assets externos.
 */

// ─── Quadro de browser reutilizável ─────────────────────────────────────────
function Janela({
  titulo,
  children,
  className = "",
}: {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-grafite shadow-[0_28px_72px_rgba(30,39,64,0.16)] ${className}`}
    >
      {/* barra do browser */}
      <div className="flex items-center gap-2 bg-grafite px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <div className="ml-3 flex-1 rounded bg-noite-divide px-3 py-1">
          <span className="font-mono text-[10px] text-texto-noite-medio">{titulo}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Badge de status ─────────────────────────────────────────────────────────
function Badge({
  tipo,
  children,
}: {
  tipo: "ok" | "erro" | "alerta" | "info";
  children: React.ReactNode;
}) {
  const estilos = {
    ok: "bg-ativo-bg text-ativo-texto",
    erro: "bg-risco-bg text-risco-texto",
    alerta: "bg-pendente-bg text-pendente-texto",
    info: "bg-cobalto-bg text-cobalto",
  }[tipo];
  return (
    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${estilos}`}>
      {children}
    </span>
  );
}

// ─── Linha de tabela / lista ──────────────────────────────────────────────────
function Linha({
  nome,
  valor,
  badge,
  sub,
}: {
  nome: string;
  valor?: string;
  badge?: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-3 last:border-0">
      <div>
        <p className="text-[13px] font-medium text-grafite">{nome}</p>
        {sub && <p className="text-[11px] text-texto-medio">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {valor && (
          <span className="font-mono text-[12px] font-semibold text-grafite">
            {valor}
          </span>
        )}
        {badge}
      </div>
    </div>
  );
}

// ─── 1. Comparação de custo (Torneira 1 — Taxa) ──────────────────────────────
export function MockupComparacao() {
  return (
    <Janela titulo="pulse.app · Extrato de custo — 400 contratos">
      <div className="bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-risco-borda bg-risco-bg p-5">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-risco-texto">
              Hoje · Cartão recorrente
            </p>
            <p className="font-titulo text-[2.2rem] font-black leading-none text-risco">
              R$&nbsp;2.900
            </p>
            <p className="mt-1 text-[11px] text-texto-medio">400 × R$250 × 2,9%</p>
            <div className="mt-4 space-y-1 border-t border-risco-borda pt-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-texto">Em 12 meses</span>
                <span className="font-mono font-bold text-risco">R$ 34.800</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-ativo-borda bg-ativo-bg p-5">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ativo-texto">
              Com Pulse · Pix Automático
            </p>
            <p className="font-titulo text-[2.2rem] font-black leading-none text-ativo">
              R$&nbsp;40
            </p>
            <p className="mt-1 text-[11px] text-texto-medio">400 × R$ 0,10/transação</p>
            <div className="mt-4 space-y-1 border-t border-ativo-borda pt-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-texto">Em 12 meses</span>
                <span className="font-mono font-bold text-ativo">R$ 480</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-grafite px-5 py-4">
          <div>
            <p className="text-[11px] text-texto-noite">Economia por ano</p>
            <p className="font-titulo text-[1.6rem] font-black leading-tight text-white">
              R$&nbsp;34.320
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-texto-noite">Redução no custo</p>
            <p className="font-titulo text-[1.6rem] font-black leading-tight text-cobalto-claro">
              98,6%
            </p>
          </div>
        </div>
      </div>
    </Janela>
  );
}

// ─── 2. Recuperação de falha (Torneira 2 — Falha silenciosa) ─────────────────
export function MockupFalha() {
  return (
    <Janela titulo="pulse.app · Cobranças recentes">
      <div className="bg-white">
        {/* subtítulo de seção */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <span className="text-[12px] font-medium text-texto-medio">
            Hoje · 12 cobranças
          </span>
          <span className="font-mono text-[10px] text-cobalto">Ver todas →</span>
        </div>

        <div className="divide-y px-5">
          <Linha
            nome="Marina Souza"
            sub="Plano Mensal · venc. hoje"
            valor="R$ 189,90"
            badge={<Badge tipo="ok">Recebida</Badge>}
          />
          <Linha
            nome="Carlos Menezes"
            sub="Plano Trimestral · venc. hoje"
            valor="R$ 297,00"
            badge={<Badge tipo="erro">Falhou</Badge>}
          />
          <Linha
            nome="Juliana Pires"
            sub="Plano Anual · venc. hoje"
            valor="R$ 129,00"
            badge={<Badge tipo="ok">Recebida</Badge>}
          />
          <Linha
            nome="Roberto Lima"
            sub="Plano Mensal · venc. hoje"
            valor="R$ 189,90"
            badge={<Badge tipo="erro">Falhou</Badge>}
          />
        </div>

        {/* notificação de recuperação automática */}
        <div className="m-4 rounded-xl border border-ativo-borda bg-ativo-bg p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ativo" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ativo-texto">
              Recuperação automática
            </span>
          </div>
          <p className="text-[12px] text-grafite">
            <strong>2 cobranças com falha</strong> — Pix avulso enviado para Carlos Menezes e
            Roberto Lima às 09:14.
          </p>
          <div className="mt-3 flex gap-2">
            <Badge tipo="ok">Carlos · Pix enviado</Badge>
            <Badge tipo="ok">Roberto · Pix enviado</Badge>
          </div>
        </div>
      </div>
    </Janela>
  );
}

// ─── 3. Autorizações ativas (Torneira 3 — Saída involuntária) ────────────────
export function MockupAutorizacoes() {
  return (
    <Janela titulo="pulse.app · Radar de autorizações">
      <div className="bg-white">
        {/* cabeçalho */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-texto-medio">
              Ativas: 387
            </span>
            <span className="text-[12px] font-medium text-risco-texto">
              Atenção: 13
            </span>
          </div>
          <Badge tipo="alerta">13 alertas hoje</Badge>
        </div>

        <div className="divide-y px-5">
          <Linha
            nome="Fernanda Alves"
            sub="Autorização expirou ontem"
            badge={<Badge tipo="erro">Expirada</Badge>}
          />
          <Linha
            nome="Paulo Farias"
            sub="Cancelou via banco · 14h32"
            badge={<Badge tipo="erro">Cancelada</Badge>}
          />
          <Linha
            nome="Tatiane Rocha"
            sub="3 falhas consecutivas"
            badge={<Badge tipo="alerta">Em risco</Badge>}
          />
          <Linha
            nome="André Costa"
            sub="Reautorizada ontem · 09:01"
            badge={<Badge tipo="ok">Ativa</Badge>}
          />
          <Linha
            nome="Camila Nunes"
            sub="Ativa desde 12/03"
            badge={<Badge tipo="ok">Ativa</Badge>}
          />
        </div>

        {/* ação rápida */}
        <div className="m-4 rounded-xl border border-pendente-borda bg-pendente-bg p-4">
          <p className="text-[12px] font-medium text-pendente-texto">
            <strong>Fernanda e Paulo</strong> precisam de reautorização. Régua de recuperação pronta
            — aprovar envio?
          </p>
          <div className="mt-3 flex gap-2">
            <button className="rounded-full bg-grafite px-3 py-1 font-mono text-[10px] font-semibold text-white">
              Aprovar envio
            </button>
            <button className="rounded-full border px-3 py-1 font-mono text-[10px] font-semibold text-texto-medio">
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
    </Janela>
  );
}

// ─── 4. Tela de autorização no celular ───────────────────────────────────────
export function MockupTelefone() {
  return (
    <div className="mx-auto w-[260px]">
      {/* frame do celular */}
      <div className="overflow-hidden rounded-[2.8rem] border-[7px] border-grafite bg-white shadow-[0_32px_80px_rgba(30,39,64,0.22)]">
        {/* barra de status */}
        <div className="flex items-center justify-between bg-white px-5 py-2">
          <span className="font-mono text-[9px] font-semibold text-grafite">9:41</span>
          <div className="flex items-center gap-0.5">
            {[3, 3, 3, 2].map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm bg-grafite"
                style={{ height: `${h + i * 2}px`, opacity: i < 3 ? 1 : 0.35 }}
              />
            ))}
            <div className="ml-1.5 h-2.5 w-4 rounded-sm border border-grafite">
              <div className="m-px h-full w-3/4 rounded-sm bg-ativo" />
            </div>
          </div>
        </div>

        {/* conteúdo da tela */}
        <div className="bg-white px-5 pb-7">
          {/* logo do cliente */}
          <div className="mb-5 mt-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cobalto">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-2 font-titulo text-[13px] font-bold text-grafite">
              Academia Forma
            </p>
          </div>

          <p className="mb-3 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-texto-medio">
            Autorizar Pix Automático
          </p>

          <div className="space-y-2 rounded-xl bg-sidebar p-3">
            {[
              ["Para", "Academia Forma"],
              ["Valor", "R$ 250,00/mês"],
              ["Vencimento", "Todo dia 10"],
              ["Teto máximo", "R$ 500,00"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-[10px] text-texto-medio">{k}</span>
                <span className="text-[10px] font-semibold text-grafite">{v}</span>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full rounded-full bg-cobalto py-3 font-titulo text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(0,56,229,0.28)]">
            Autorizar
          </button>
          <p className="mt-2.5 text-center font-mono text-[9px] leading-tight text-texto-medio">
            Confirmação no app do seu banco
            <br />
            Nenhuma senha nova necessária
          </p>
        </div>
      </div>

      {/* "sombra" abaixo do celular */}
      <div className="mx-auto mt-4 h-3 w-3/4 rounded-full bg-grafite opacity-10 blur-md" />
    </div>
  );
}

// ─── 5. Dashboard de radar de alertas ────────────────────────────────────────
export function MockupRadarDash() {
  return (
    <Janela titulo="pulse.app · Radar — alertas do dia">
      <div className="bg-sidebar">
        {/* stats de topo */}
        <div className="grid grid-cols-3 gap-px bg-border">
          {[
            { label: "Autorizações ativas", valor: "387", cor: "text-ativo" },
            { label: "Alertas hoje", valor: "13", cor: "text-pendente" },
            { label: "Recuperadas", valor: "9", cor: "text-cobalto" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-4 text-center">
              <p className={`font-titulo text-[1.6rem] font-black leading-none ${s.cor}`}>
                {s.valor}
              </p>
              <p className="mt-0.5 text-[10px] text-texto-medio">{s.label}</p>
            </div>
          ))}
        </div>

        {/* lista de alertas */}
        <div className="divide-y bg-white">
          {[
            {
              icone: "🔴",
              msg: "Fernanda Alves cancelou a autorização via banco",
              hora: "14h32",
              acao: "Reautorizar",
            },
            {
              icone: "🟠",
              msg: "Paulo Farias — 3ª falha consecutiva neste mês",
              hora: "12h07",
              acao: "Pix avulso",
            },
            {
              icone: "🟠",
              msg: "Tatiane Rocha — autorização expira em 5 dias",
              hora: "09h00",
              acao: "Renovar",
            },
            {
              icone: "🟢",
              msg: "André Costa reautorizou após campanha",
              hora: "08h41",
              acao: null,
            },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-px text-[13px]">{a.icone}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-grafite leading-snug">{a.msg}</p>
                <p className="mt-0.5 font-mono text-[10px] text-texto-medio">
                  {a.hora}
                </p>
              </div>
              {a.acao && (
                <button className="shrink-0 rounded-full border border-cobalto px-2.5 py-1 font-mono text-[9px] font-semibold text-cobalto">
                  {a.acao}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Janela>
  );
}
