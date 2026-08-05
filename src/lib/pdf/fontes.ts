import path from "node:path";

import { Font } from "@react-pdf/renderer";

import "server-only";

/**
 * Fontes do PDF.
 *
 * Os arquivos são versionados em `src/assets/fontes/` em vez de buscados no
 * Google Fonts em tempo de render. Um PDF que depende de rede para existir é um
 * PDF que falha exatamente no pior momento — quando o operador acabou de ver o
 * número e vai mandar o relatório para o sócio.
 *
 * SOBRE OS NÚMEROS — desvio deliberado do §5.3.
 *
 * O brand book manda usar Inter com `font-variant-numeric: tabular-nums` em
 * todo valor. O `@react-pdf/renderer` não expõe features OpenType, então
 * `tnum` não existe aqui. E medindo a Inter, os dígitos são proporcionais de
 * verdade: o "1" ocupa 833 unidades contra 1323 do "4" — numa coluna de
 * dinheiro, a vírgula dançaria, que é precisamente o defeito que a regra
 * existe para evitar.
 *
 * A Archivo tem dígitos de 595 a 597 unidades: 0,3% de variação, imperceptível.
 * Então os NÚMEROS do PDF saem em Archivo. É desobedecer a letra da regra para
 * cumprir a intenção dela.
 */
const PASTA = path.join(process.cwd(), "src/assets/fontes");

let registradas = false;

export function registrarFontes() {
  if (registradas) return;

  Font.register({
    family: "Archivo",
    fonts: [
      { src: path.join(PASTA, "Archivo-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(PASTA, "Archivo-Bold.ttf"), fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(PASTA, "Inter-Regular.ttf"), fontWeight: 400 },
      { src: path.join(PASTA, "Inter-Medium.ttf"), fontWeight: 500 },
      { src: path.join(PASTA, "Inter-SemiBold.ttf"), fontWeight: 600 },
    ],
  });

  // Sem isso, o quebrador de linha padrão parte palavras em português em
  // lugares esquisitos.
  Font.registerHyphenationCallback((palavra) => [palavra]);

  registradas = true;
}
