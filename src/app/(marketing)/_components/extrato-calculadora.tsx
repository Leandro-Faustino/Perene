"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { formatarReais } from "@/lib/utils";

type Metodo = "cartao" | "boleto" | "misto";

const TAXAS_PADRAO: Record<Metodo, number> = {
  cartao: 2.9,
  boleto: 3.49,
  misto: 2.9,
};
const PIX_UNIT = 0.1;

function CursorSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 22" fill="none" className={className} aria-hidden>
      <path
        d="M3 1.5 L3 17.5 L6.8 13.2 L10.2 19.8 L12.5 18.7 L9.1 12.1 L15 12.1 Z"
        fill="white"
        stroke="#0B1721"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExtratoCalculadora() {
  const [contratos, setContratos] = useState("");
  const [ticket, setTicket] = useState("");
  const [metodo, setMetodo] = useState<Metodo>("cartao");
  const [taxa, setTaxa] = useState("2.9");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputContratosRef = useRef<HTMLInputElement>(null);
  const inputTicketRef = useRef<HTMLInputElement>(null);
  const t0Ref = useRef<number>(Date.now());
  const animRanRef = useRef(false);
  const animCanceledRef = useRef(false);

  const [tick, setTick] = useState(0);
  const [cursor, setCursor] = useState({
    x: 0, y: 0, visible: false, clicking: false,
  });
  const [activeField, setActiveField] = useState<"contratos" | "ticket" | null>(null);

  const resultado = useMemo(() => {
    const q = Math.max(0, parseInt(contratos) || 0);
    const v = Math.max(0, parseFloat(ticket) || 0);
    const t = Math.max(0, parseFloat(taxa) || 0);
    const mrr = q * v;
    let hoje: number;
    if (metodo === "boleto") hoje = q * t;
    else if (metodo === "misto") hoje = (q / 2) * v * (t / 100) + (q / 2) * 3.49;
    else hoje = q * v * (t / 100);
    const pix = q * PIX_UNIT;
    const anoVazamento = Math.max(0, (hoje - pix) * 12);
    return { mrr, hoje, pix, anoVazamento };
  }, [contratos, ticket, metodo, taxa]);

  useEffect(() => {
    t0Ref.current = Date.now();
    setTick(0);
  }, [resultado.anoVazamento]);

  useEffect(() => {
    if (resultado.anoVazamento === 0) return;
    const id = setInterval(() => {
      const perSec = resultado.anoVazamento / (365 * 24 * 3600);
      setTick(perSec * ((Date.now() - t0Ref.current) / 1000));
    }, 120);
    return () => clearInterval(id);
  }, [resultado.anoVazamento]);

  function cancelAnim() {
    if (animRanRef.current && !animCanceledRef.current) {
      animCanceledRef.current = true;
      setCursor((c) => ({ ...c, visible: false }));
      setActiveField(null);
      if (!contratos) setContratos("400");
      if (!ticket) setTicket("250");
    }
  }

  function getPos(ref: React.RefObject<HTMLInputElement | null>) {
    if (!ref.current || !containerRef.current) return { x: 80, y: 80 };
    const ir = ref.current.getBoundingClientRect();
    const cr = containerRef.current.getBoundingClientRect();
    return {
      x: ir.left - cr.left + ir.width * 0.25,
      y: ir.top - cr.top + ir.height * 0.5,
    };
  }

  const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

  useEffect(() => {
    if (animRanRef.current) return;
    animRanRef.current = true;

    async function run() {
      await sleep(900);
      if (animCanceledRef.current) return;

      // Cursor aparece perto do primeiro campo e depois vai até ele
      const pos1 = getPos(inputContratosRef);
      setCursor({ x: pos1.x + 70, y: pos1.y - 50, visible: true, clicking: false });
      await sleep(150);
      if (animCanceledRef.current) return;

      // Move até o campo contratos
      setCursor({ x: pos1.x, y: pos1.y, visible: true, clicking: false });
      await sleep(520);
      if (animCanceledRef.current) return;

      // Click
      setCursor((c) => ({ ...c, clicking: true }));
      inputContratosRef.current?.focus();
      setActiveField("contratos");
      await sleep(180);
      setCursor((c) => ({ ...c, clicking: false }));
      await sleep(200);

      // Digita "400"
      for (const char of ["4", "40", "400"]) {
        if (animCanceledRef.current) return;
        setContratos(char);
        await sleep(190);
      }
      await sleep(500);
      if (animCanceledRef.current) return;

      // Move até ticket
      setActiveField(null);
      const pos2 = getPos(inputTicketRef);
      setCursor({ x: pos2.x, y: pos2.y, visible: true, clicking: false });
      await sleep(520);
      if (animCanceledRef.current) return;

      // Click
      setCursor((c) => ({ ...c, clicking: true }));
      inputTicketRef.current?.focus();
      setActiveField("ticket");
      await sleep(180);
      setCursor((c) => ({ ...c, clicking: false }));
      await sleep(200);

      // Digita "250"
      for (const char of ["2", "25", "250"]) {
        if (animCanceledRef.current) return;
        setTicket(char);
        await sleep(190);
      }
      await sleep(700);
      if (animCanceledRef.current) return;

      // Cursor some
      setCursor((c) => ({ ...c, visible: false }));
      setActiveField(null);
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMetodo(m: Metodo) {
    setMetodo(m);
    setTaxa(TAXAS_PADRAO[m].toString());
  }

  const taxaLabel = metodo === "boleto" ? "Sua taxa (R$ por boleto)" : "Sua taxa (%)";

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white shadow-flutuante"
    >
      {/* Cursor animado */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-50"
        style={{
          left: cursor.x,
          top: cursor.y,
          opacity: cursor.visible ? 1 : 0,
          transform: `scale(${cursor.clicking ? 0.78 : 1})`,
          transition:
            "left 0.48s cubic-bezier(0.25,0.46,0.45,0.94), top 0.48s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.25s ease, transform 0.12s ease",
        }}
      >
        <CursorSVG className="h-6 w-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
        {/* pulse no click */}
        {cursor.clicking && (
          <span className="absolute -inset-3 animate-ping rounded-full bg-cobalto opacity-30" />
        )}
      </div>

      {/* Cabeçalho */}
      <div className="flex items-baseline justify-between gap-3 border-b border-grafite bg-grafite px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white">
          Extrato de vazamento
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-texto-noite-medio">
          Estimativa · 12 meses
        </span>
      </div>

      {/* Corpo */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <CampoExtrato rotulo="Contratos ativos">
            <input
              ref={inputContratosRef}
              id="campo-contratos"
              type="number"
              min="1"
              value={contratos}
              onChange={(e) => setContratos(e.target.value)}
              onFocus={cancelAnim}
              placeholder="400"
              className={`${estiloInput} ${activeField === "contratos" ? "border-cobalto ring-1 ring-cobalto" : ""}`}
              inputMode="numeric"
            />
          </CampoExtrato>
          <CampoExtrato rotulo="Mensalidade média (R$)">
            <input
              ref={inputTicketRef}
              type="number"
              min="1"
              step="1"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              onFocus={cancelAnim}
              placeholder="250"
              className={`${estiloInput} ${activeField === "ticket" ? "border-cobalto ring-1 ring-cobalto" : ""}`}
              inputMode="decimal"
            />
          </CampoExtrato>
          <CampoExtrato rotulo="Como você cobra hoje">
            <select
              value={metodo}
              onChange={(e) => handleMetodo(e.target.value as Metodo)}
              onFocus={cancelAnim}
              className={estiloInput}
            >
              <option value="cartao">Cartão recorrente</option>
              <option value="boleto">Boleto</option>
              <option value="misto">Metade cartão, metade boleto</option>
            </select>
          </CampoExtrato>
          <CampoExtrato rotulo={taxaLabel}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={taxa}
              onChange={(e) => setTaxa(e.target.value)}
              onFocus={cancelAnim}
              className={estiloInput}
              inputMode="decimal"
            />
          </CampoExtrato>
        </div>

        {/* Ledger */}
        <div className="mt-5 border-t border-grafite pt-1">
          <LinhaLedger
            rotulo="Receita recorrente"
            sub="por mês"
            valor={formatarReais(Math.round(resultado.mrr * 100))}
          />
          <LinhaLedger
            rotulo="Custo de cobrança hoje"
            sub="por mês"
            valor={formatarReais(Math.round(resultado.hoje * 100))}
            classeValor="text-risco"
          />
          <LinhaLedger
            rotulo="Custo no Pix Automático"
            sub="R$ 0,10 por transação"
            valor={formatarReais(Math.round(resultado.pix * 100))}
            classeValor="text-ativo"
          />
        </div>

        {/* Total */}
        <div
          className="mt-4 flex items-baseline justify-between gap-4 border border-risco bg-risco-bg px-4 py-4 transition-all duration-700"
          style={{
            opacity: resultado.anoVazamento > 0 ? 1 : 0.35,
            transform: resultado.anoVazamento > 0 ? "scale(1)" : "scale(0.98)",
          }}
        >
          <span className="font-titulo font-bold text-risco-texto">
            Vazamento em 12 meses
          </span>
          <span className="pl-numero font-mono text-[clamp(1.3rem,3vw,1.9rem)] font-semibold text-risco transition-all duration-500">
            {formatarReais(Math.round(resultado.anoVazamento * 100))}
          </span>
        </div>

        {/* Ticker */}
        <div className="mt-3 flex items-center justify-between gap-3 border border-dashed border-risco px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-risco-texto">
            Vazando desde que você abriu esta página
          </span>
          <span className="pl-numero font-mono font-semibold text-risco">
            {resultado.anoVazamento > 0
              ? formatarReais(Math.round(tick * 100))
              : "—"}
          </span>
        </div>

        <p className="mt-3 font-mono text-[11px] leading-relaxed text-texto-medio">
          Conta de guardanapo, feita com os seus números. O diagnóstico completo lê a sua base real
          no gateway e mostra o que falhou nos últimos 12 meses — não estimado, contado.
        </p>
      </div>
    </div>
  );
}

function LinhaLedger({
  rotulo, sub, valor, classeValor = "text-foreground",
}: {
  rotulo: string; sub: string; valor: string; classeValor?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-3">
      <div>
        <span className="text-[14px] text-texto">{rotulo}</span>
        <small className="block font-mono text-[10px] text-texto-medio">{sub}</small>
      </div>
      <span className={`pl-numero font-mono font-semibold transition-all duration-300 ${classeValor}`}>
        {valor}
      </span>
    </div>
  );
}

function CampoExtrato({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-texto-medio">
        {rotulo}
      </label>
      {children}
    </div>
  );
}

const estiloInput =
  "w-full border border-border bg-sidebar px-3 py-2 font-mono text-[14px] tabular-nums text-foreground outline-none transition-colors focus:border-cobalto focus:ring-1 focus:ring-cobalto";
