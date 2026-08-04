import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Toaster } from "sonner";
import { ProvedorDeTema } from "@/components/provedor-de-tema";
import "./globals.css";

/* Brand book §5.3. As três famílias não são escolha estética:
 * - Archivo carrega o logotipo e os números grandes de destaque;
 * - Inter tem algarismos tabulares nativos, que é o requisito decisivo num
 *   produto que existe para dar credibilidade a número;
 * - JetBrains Mono separa identificador de valor (token de convite, ID de
 *   cobrança), evitando a confusão entre 0/O e 1/l/I. */
const archivo = Archivo({
  variable: "--fonte-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--fonte-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--fonte-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pulse — recorrência que não quebra",
    template: "%s · Pulse",
  },
  description:
    "Mostra quanto seu negócio perde hoje com taxa e cobrança que falha, migra sua base para Pix Automático sem perder cliente no caminho e avisa no mesmo dia quando uma autorização quebra.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider localization={ptBR}>
      <html
        lang="pt-BR"
        suppressHydrationWarning
        className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ProvedorDeTema>
            {children}
            <Toaster position="top-right" closeButton />
          </ProvedorDeTema>
        </body>
      </html>
    </ClerkProvider>
  );
}
