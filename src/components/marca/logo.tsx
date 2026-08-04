/**
 * Assinaturas visuais da marca — brand book §5.1.
 *
 * Regras que o componente aplica sozinho, para que não dependam de disciplina:
 * - a quarta barra está em 70% da altura e essa proporção não muda (§7.2);
 * - abaixo de 88px de largura usa-se o símbolo isolado, nunca a horizontal;
 * - sobre fundo escuro a quarta barra usa `--pl-cobalto-claro`, porque cobalto
 *   sobre grafite reprova em contraste (§5.2).
 */

type Tom = "claro" | "escuro" | "mono";

const BARRAS = [
  { x: 1.5, y: 4, altura: 16 },
  { x: 7.5, y: 4, altura: 16 },
  { x: 13.5, y: 4, altura: 16 },
  { x: 19.5, y: 8.8, altura: 11.2 }, // 70% — cenário intermediário do RF-33
] as const;

function corDaBarra(indice: number, tom: Tom) {
  if (tom === "mono") return "currentColor";
  const ehQuarta = indice === BARRAS.length - 1;
  if (ehQuarta) {
    return tom === "escuro" ? "var(--pl-cobalto-claro)" : "var(--pl-cobalto)";
  }
  return tom === "escuro" ? "var(--pl-branco)" : "var(--pl-grafite)";
}

export function Simbolo({
  tamanho = 24,
  tom = "claro",
  className,
}: {
  tamanho?: number;
  tom?: Tom;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      className={className}
      role="img"
      aria-label="Pulse"
    >
      {BARRAS.map((barra, i) => (
        <rect
          key={barra.x}
          x={barra.x}
          y={barra.y}
          width={3}
          height={barra.altura}
          rx={1.5}
          fill={corDaBarra(i, tom)}
        />
      ))}
    </svg>
  );
}

export function Logo({
  tom = "claro",
  className,
}: {
  tom?: Tom;
  className?: string;
}) {
  const corTexto =
    tom === "mono"
      ? "currentColor"
      : tom === "escuro"
        ? "var(--pl-branco)"
        : "var(--pl-grafite)";

  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <Simbolo tamanho={24} tom={tom} />
      <span
        style={{
          fontFamily: "var(--fonte-titulo)",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: corTexto,
        }}
      >
        pulse
      </span>
    </span>
  );
}
