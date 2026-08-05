"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  analisarArquivo,
  gravarImportacao,
  type EstadoDaAnalise,
} from "@/app/(onboarding)/importar-base/acoes";
import { Botao } from "@/components/ui/botao";
import { SeloDeEstado } from "@/components/ui/selo-de-estado";
import { rotulo } from "@/lib/domain/diagnostico";
import { formatarReais } from "@/lib/utils";
import type { LinhaImportada } from "@/lib/domain/importacao";

export function ImportadorDeBase() {
  const router = useRouter();

  const [analise, setAnalise] = useState<EstadoDaAnalise | null>(null);
  const [escolhas, setEscolhas] = useState<Record<string, number>>({});
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarArquivo(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setOcupado(true);
    setErro(null);
    try {
      setAnalise(await analisarArquivo(null, new FormData(evento.currentTarget)));
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar() {
    const resultado = analise?.resultado;
    if (!resultado) return;

    // As aceitas entram inteiras; dos duplicados, entra só a linha que o
    // operador escolheu. Grupo sem escolha fica de fora — silêncio aqui
    // significaria decidir por ele, que é exatamente o que o RF-23 proíbe.
    const dosDuplicados = resultado.duplicados
      .map((grupo) => {
        const escolhida = escolhas[grupo.chave];
        return escolhida === undefined
          ? null
          : grupo.linhas.find((l) => l.linha === escolhida);
      })
      .filter((l): l is LinhaImportada => Boolean(l));

    setOcupado(true);
    setErro(null);
    try {
      const r = await gravarImportacao([...resultado.aceitas, ...dosDuplicados]);
      if (!r.ok) {
        setErro(r.mensagem);
        return;
      }
      router.push("/dashboard");
    } finally {
      setOcupado(false);
    }
  }

  const resultado = analise?.resultado;

  if (!resultado) {
    return (
      <form onSubmit={enviarArquivo} className="mt-8 space-y-5">
        <div>
          <label htmlFor="arquivo" className="block text-[14px] font-medium text-foreground">
            Arquivo CSV
          </label>
          <input
            id="arquivo"
            name="arquivo"
            type="file"
            accept=".csv,text/csv"
            required
            className="mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-[14px] text-texto file:mr-3 file:rounded file:border-0 file:bg-[var(--pl-superficie)] file:px-3 file:py-1.5 file:text-[13px] file:text-foreground"
          />
          <p className="mt-1.5 text-[13px] text-texto-medio">
            Exporte do seu sistema como está. Reconhecemos as colunas pelos
            nomes usuais — nome, valor, telefone, CPF, forma de pagamento — e
            avisamos se faltar alguma.
          </p>
        </div>

        {analise && !analise.ok && (
          <p role="alert" className="rounded-md bg-[var(--pl-risco-bg)] px-3 py-2.5 text-[14px] text-[var(--pl-risco-texto)]">
            {analise.mensagem}
          </p>
        )}

        <Botao type="submit" tamanho="site" disabled={ocupado}>
          {ocupado ? "Lendo o arquivo…" : "Enviar e conferir"}
        </Botao>
      </form>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-2">
        <SeloDeEstado estado="ativo">
          {resultado.aceitas.length} prontos para importar
        </SeloDeEstado>
        {resultado.duplicados.length > 0 && (
          <SeloDeEstado estado="pendente">
            {resultado.duplicados.length} precisam da sua decisão
          </SeloDeEstado>
        )}
        {resultado.problemas.length > 0 && (
          <SeloDeEstado estado="risco">
            {resultado.problemas.length} com problema
          </SeloDeEstado>
        )}
      </div>

      {resultado.duplicados.length > 0 && (
        <section>
          <h2 className="font-titulo text-[18px] font-medium text-foreground">
            Quem é a mesma pessoa?
          </h2>
          <p className="mt-1 text-[14px] text-texto">
            Encontramos linhas que compartilham CPF ou telefone. Não decidimos
            por você: escolha qual vale, ou deixe o grupo de fora.
          </p>

          <div className="mt-4 space-y-3">
            {resultado.duplicados.map((grupo) => (
              <fieldset key={grupo.chave} className="rounded-lg border p-4">
                <legend className="px-1 text-[13px] text-texto-medio">
                  Mesmo {grupo.criterio === "cpf" ? "CPF" : "telefone"}
                </legend>
                <div className="space-y-2">
                  {grupo.linhas.map((linha) => (
                    <label
                      key={linha.linha}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-[14px] hover:bg-[var(--pl-superficie)]"
                    >
                      <input
                        type="radio"
                        name={`dup-${grupo.chave}`}
                        checked={escolhas[grupo.chave] === linha.linha}
                        onChange={() =>
                          setEscolhas((e) => ({ ...e, [grupo.chave]: linha.linha }))
                        }
                        className="accent-[var(--pl-cobalto)]"
                      />
                      <span className="font-medium text-foreground">{linha.nome}</span>
                      <span className="pl-numero text-texto">
                        {formatarReais(linha.valorCentavos)}
                      </span>
                      <span className="text-texto-medio">{rotulo(linha.metodo)}</span>
                      <span className="pl-codigo ml-auto text-texto-fraco">
                        linha {linha.linha}
                      </span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-[14px] text-texto-medio hover:bg-[var(--pl-superficie)]">
                    <input
                      type="radio"
                      name={`dup-${grupo.chave}`}
                      checked={escolhas[grupo.chave] === undefined}
                      onChange={() =>
                        setEscolhas((atuais) => {
                          const resto = { ...atuais };
                          delete resto[grupo.chave];
                          return resto;
                        })
                      }
                      className="accent-[var(--pl-cobalto)]"
                    />
                    Deixar de fora por enquanto
                  </label>
                </div>
              </fieldset>
            ))}
          </div>
        </section>
      )}

      {resultado.problemas.length > 0 && (
        <section>
          <h2 className="font-titulo text-[18px] font-medium text-foreground">
            Linhas com problema
          </h2>
          <ul className="mt-3 space-y-2">
            {resultado.problemas.slice(0, 20).map((p) => (
              <li key={`${p.linha}-${p.motivo}`} className="rounded-md border px-3 py-2 text-[14px]">
                <span className="pl-codigo text-texto-medio">linha {p.linha}</span>{" "}
                <span className="text-texto">{p.motivo}</span>
              </li>
            ))}
          </ul>
          {resultado.problemas.length > 20 && (
            <p className="mt-2 text-[13px] text-texto-medio">
              e mais {resultado.problemas.length - 20}.
            </p>
          )}
        </section>
      )}

      {erro && (
        <p role="alert" className="rounded-md bg-[var(--pl-risco-bg)] px-3 py-2.5 text-[14px] text-[var(--pl-risco-texto)]">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Botao onClick={confirmar} tamanho="site" disabled={ocupado}>
          {ocupado
            ? "Importando…"
            : `Importar ${resultado.aceitas.length + Object.keys(escolhas).length} e ver o diagnóstico`}
        </Botao>
        <Botao
          variante="fantasma"
          tamanho="site"
          onClick={() => {
            setAnalise(null);
            setEscolhas({});
          }}
          disabled={ocupado}
        >
          Trocar de arquivo
        </Botao>
      </div>
    </div>
  );
}
