import { FormularioDeOrganizacao } from "@/components/onboarding/formulario-de-organizacao";

export const metadata = { title: "Sua organização" };

export default function PaginaDaOrganizacao() {
  return (
    <div className="mx-auto w-full max-w-lg px-6 py-16">
      <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-texto-medio">
        Passo 1 de 3
      </p>
      <h1 className="mt-2 font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Vamos começar pelo básico
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-texto">
        Duas perguntas e seguimos. Em menos de dez minutos você vê quanto sua
        base custa hoje.
      </p>

      <FormularioDeOrganizacao />
    </div>
  );
}
