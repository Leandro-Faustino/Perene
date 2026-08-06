/**
 * Ícones SVG para a landing page.
 * Todos path-based, sem texto interno, sem dependência de fonte.
 */

export function IcTaxa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* Moeda com seta saindo */}
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.6" />
      {/* símbolo de percentual simplificado: dois círculos + barra */}
      <circle cx="17" cy="17" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="31" cy="31" r="4" stroke="currentColor" strokeWidth="1.6" />
      <line x1="13" y1="35" x2="35" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IcFalha({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* cartão de crédito */}
      <rect x="4" y="12" width="34" height="22" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <line x1="4" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8" y="25" width="10" height="4" rx="1" fill="currentColor" opacity=".35" />
      {/* X de erro — canto superior direito */}
      <circle cx="38" cy="12" r="8" fill="currentColor" />
      <line x1="34.5" y1="8.5" x2="41.5" y2="15.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="41.5" y1="8.5" x2="34.5" y2="15.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IcSaida({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* pessoa + seta saindo de um quadro */}
      <rect x="4" y="8" width="26" height="32" rx="3" stroke="currentColor" strokeWidth="1.6" />
      {/* linha de saída */}
      <line x1="4" y1="24" x2="4" y2="24" strokeWidth="0" />
      {/* pessoa (simplificada: cabeça + corpo) */}
      <circle cx="17" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 32c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* seta saindo */}
      <line x1="32" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline points="39,19 44,24 39,29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function IcDiagnostico({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* documento */}
      <rect x="8" y="4" width="28" height="36" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <line x1="14" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* mini-gráfico de barras */}
      <rect x="13" y="28" width="4" height="6" rx="1" fill="currentColor" opacity=".4" />
      <rect x="20" y="23" width="4" height="11" rx="1" fill="currentColor" opacity=".7" />
      <rect x="27" y="19" width="4" height="15" rx="1" fill="currentColor" />
      {/* lupa */}
      <circle cx="37" cy="38" r="7" stroke="currentColor" strokeWidth="1.6" />
      <line x1="42" y1="43" x2="47" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="38" x2="39" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="37" y1="36" x2="37" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IcOnda({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* Barras de sinal crescentes (ondas de envio) */}
      <rect x="6" y="32" width="6" height="10" rx="1.5" fill="currentColor" />
      <rect x="16" y="24" width="6" height="18" rx="1.5" fill="currentColor" opacity=".75" />
      <rect x="26" y="16" width="6" height="26" rx="1.5" fill="currentColor" opacity=".5" />
      <rect x="36" y="8" width="6" height="34" rx="1.5" fill="currentColor" opacity=".3" />
      {/* checkmark flutuante */}
      <circle cx="38" cy="10" r="9" fill="currentColor" />
      <polyline points="33,10 37,14 43,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function IcAutorizacao({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* celular */}
      <rect x="12" y="4" width="24" height="40" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <line x1="12" y1="11" x2="36" y2="11" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="37" x2="36" y2="37" stroke="currentColor" strokeWidth="1.5" />
      {/* checkmark na tela */}
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1.5" />
      <polyline points="19,24 23,28 30,19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function IcRadar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* sino de alerta */}
      <path d="M24 6c-7.18 0-13 5.82-13 13v10l-3 4h32l-3-4V19c0-7.18-5.82-13-13-13z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 37a4 4 0 008 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* ponto de alerta */}
      <circle cx="36" cy="10" r="6" fill="currentColor" />
      <line x1="36" y1="7" x2="36" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="36" cy="13" r="0.8" fill="white" />
    </svg>
  );
}

export function IcEscudo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path d="M24 4L6 12v14c0 10.18 7.56 19.7 18 22 10.44-2.3 18-11.82 18-22V12L24 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <polyline points="16,24 21,30 32,18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function IcSeta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <line x1="2" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <polyline points="11,5 16,10 11,15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function IcCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <polyline points="2,9 6,13 14,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Linha de pulso cardíaco (EKG) — ilustração de fundo do hero.
 * Dois ciclos completos + rabo entrando/saindo de quadro.
 */
export function HeroPulso({ className }: { className?: string }) {
  // Ciclo EKG: baseline → P wave → QRS → T wave → baseline longa
  // ViewBox 1440×360. Um ciclo ocupa ~480px de largura.
  const ciclo = (ox: number) =>
    [
      `L ${ox + 60},180`,         // baseline
      `C ${ox + 85},165 ${ox + 105},165 ${ox + 125},180`, // P wave (curva suave)
      `L ${ox + 165},180`,        // flat
      `L ${ox + 178},194`,        // Q dip
      `L ${ox + 196},68`,         // R pico (spike alto)
      `L ${ox + 214},220`,        // S dip
      `L ${ox + 230},180`,        // volta à baseline
      `C ${ox + 270},148 ${ox + 310},148 ${ox + 345},180`, // T wave
      `L ${ox + 480},180`,        // longa baseline
    ].join(" ");

  const d = [`M -60,180`, ciclo(0), ciclo(480), ciclo(960)].join(" ");

  return (
    <svg
      viewBox="0 0 1440 360"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      {/* linha principal brilhante */}
      <path d={d} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* glow: mesma linha, mais grossa e opaca */}
      <path d={d} stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
      {/* ponto destacado no pico do segundo spike */}
      <circle cx="676" cy="68" r="5" fill="currentColor" />
      <circle cx="676" cy="68" r="12" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

/** Linhas de grade financeira para fundo do hero */
export function HeroGrade({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 640"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      {/* linhas horizontais */}
      {[80, 160, 240, 320, 400, 480, 560].map((y) => (
        <line key={y} x1="0" y1={y} x2="1440" y2={y} stroke="currentColor" strokeWidth="1" />
      ))}
      {/* linhas verticais */}
      {[144, 288, 432, 576, 720, 864, 1008, 1152, 1296].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="640" stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  );
}

/** Padrão decorativo: grid de pontos para fundos de seção */
export function PadraoGrid({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}
