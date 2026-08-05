import { ImportadorDeBase } from "@/components/onboarding/importador-de-base";

export const metadata = { title: "Importar sua base" };

export default function PaginaImportarBase() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
        Passo 3 de 3
      </p>
      <h1 className="mt-2 font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Traga sua base
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-texto">
        Envie um CSV com quem paga mensalidade hoje. Não precisa arrumar nada
        antes — a gente mostra o que entendeu e o que não entendeu, e você
        confere antes de qualquer coisa entrar.
      </p>

      <ImportadorDeBase />
    </div>
  );
}
