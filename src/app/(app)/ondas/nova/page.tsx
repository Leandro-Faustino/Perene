import { preverOnda } from "@/app/(app)/ondas/acoes";
import { FormularioDeOnda } from "@/components/ondas/formulario-de-onda";

export const metadata = { title: "Nova onda" };

export default async function PaginaNovaOnda() {
  // A prévia sem filtro é calculada no servidor, para o operador já abrir a
  // tela sabendo o tamanho do que tem — e não descobrir depois de preencher.
  const previa = await preverOnda({}, 100);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-titulo text-[32px] font-semibold leading-tight text-foreground">
        Nova onda
      </h1>
      <p className="mt-1 text-[15px] text-texto">
        Escolha quem entra. A gente convida no mesmo dia e lembra em D+2, D+5 e
        D+10 — parando na hora em que a pessoa autoriza.
      </p>

      <FormularioDeOnda previaInicial={previa} />
    </div>
  );
}
