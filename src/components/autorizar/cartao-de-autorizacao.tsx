"use client";

import { useEffect, useState } from "react";

import { iniciarAutorizacao } from "@/app/autorizar/[token]/acoes";
import { Assinatura } from "@/components/autorizar/aviso-de-convite";
import { Simbolo } from "@/components/marca/logo";
import { corDeDestaque, textoSobre } from "@/lib/contraste";
import {
  descreverPeriodicidade,
  type ConviteParaPagador,
} from "@/lib/domain/convite-tipos";
import { formatarReais } from "@/lib/utils";

type Etapa = "convite" | "aguardando" | "autorizado" | "erro";

export function CartaoDeAutorizacao({
  token,
  convite,
}: {
  token: string;
  convite: ConviteParaPagador;
}) {
  const [etapa, setEtapa] = useState<Etapa>("convite");
  const [erro, setErro] = useState<string | null>(null);
  const [qr, setQr] = useState<{ imagem: string | null; payload: string | null; link: string | null }>();
  const [copiado, setCopiado] = useState(false);

  // A cor vem da organização e pode ser qualquer coisa. Calculamos o texto
  // sobre ela: "nunca confiar na cor que o cliente subiu" (§5.2).
  const destaque = corDeDestaque(convite.organizacao.corDeMarca);
  const sobreDestaque = textoSobre(destaque);

  // Polling enquanto o pagamento não liquida (RF-53).
  useEffect(() => {
    if (etapa !== "aguardando") return;

    const intervalo = setInterval(async () => {
      try {
        const r = await fetch(`/autorizar/${token}/status`, { cache: "no-store" });
        const { estado } = await r.json();
        if (estado === "autorizado") setEtapa("autorizado");
        if (estado === "recusado" || estado === "encerrado") {
          setErro("A autorização não foi concluída. Peça um novo link.");
          setEtapa("erro");
        }
      } catch {
        // Falha de rede é passageira; o próximo ciclo tenta de novo.
      }
    }, 3000);

    return () => clearInterval(intervalo);
  }, [etapa, token]);

  async function autorizar() {
    setEtapa("aguardando");
    const r = await iniciarAutorizacao(token);
    if (!r.ok) {
      setErro(r.mensagem ?? "Não conseguimos preparar a autorização.");
      setEtapa("erro");
      return;
    }
    setQr({
      imagem: r.qrCodeImagem ?? null,
      payload: r.qrCodePayload ?? null,
      link: r.linkPagamento ?? null,
    });
  }

  if (etapa === "autorizado") {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <div className="rounded-lg border bg-background p-6 text-center">
          <Simbolo tamanho={32} className="mx-auto" />
          <h1 className="mt-4 font-titulo text-[22px] font-semibold text-foreground">
            Pronto, está autorizado
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-texto">
            Sua mensalidade da {convite.organizacao.nome} passa a ser debitada
            automaticamente. Você não precisa fazer mais nada — e pode cancelar
            quando quiser, pelo app do seu banco.
          </p>
        </div>
        <Assinatura />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
      {/* Quem assina a tela é a organização. */}
      <div className="mb-6 text-center">
        <p className="text-[20px] font-medium text-foreground">
          {convite.organizacao.nome}
        </p>
        <p className="mt-1 text-[15px] text-texto">Olá, {convite.pagador}</p>
      </div>

      <div className="rounded-lg border bg-background p-6">
        {etapa !== "aguardando" && (
          <>
            {/* O VALOR primeiro, em 40px. É o número que a pessoa precisa
                conferir antes de autorizar qualquer coisa (§5.3). */}
            <p className="text-[13px] uppercase tracking-[0.02em] text-texto-medio">
              {convite.descricao ?? "Mensalidade"}
            </p>
            <p className="pl-numero mt-1 text-left font-titulo text-[40px] font-bold leading-none text-foreground">
              {formatarReais(convite.valorCentavos)}
            </p>
            <p className="mt-2 text-[16px] text-texto">
              Cobrado {descreverPeriodicidade(convite.periodicidade, convite.diaVencimento)}.
            </p>

            {/* Informação de consentimento. Nunca em texto fraco (§5.3): é o
                que limita o que a pessoa está permitindo. */}
            {convite.tetoCentavos && (
              <p className="mt-4 rounded-md bg-superficie px-3 py-2.5 text-[16px] text-texto">
                Você autoriza débitos de até{" "}
                <strong className="pl-numero text-foreground">
                  {formatarReais(convite.tetoCentavos)}
                </strong>
                . Acima disso, pedimos sua autorização de novo.
              </p>
            )}

            {/* O fluxo real do Pix Automático: há um pagamento AGORA, e é ele
                que registra o consentimento. Esconder isso seria pedir uma
                decisão sob informação incompleta. */}
            <p className="mt-4 text-[15px] leading-relaxed text-texto">
              Ao continuar, você paga esta primeira mensalidade por Pix. É esse
              pagamento que autoriza as próximas — que passam a acontecer
              sozinhas, sem você precisar lembrar.
            </p>
          </>
        )}

        {etapa === "convite" && (
          <button
            onClick={autorizar}
            style={{ backgroundColor: destaque, color: sobreDestaque }}
            className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-md px-5 text-[17px] font-medium transition-opacity hover:opacity-90"
          >
            Autorizar e pagar a primeira
          </button>
        )}

        {etapa === "aguardando" && (
          <div className="text-center">
            {/* O símbolo pulsando: único momento em que a marca fica visível
                por vários segundos, e literalmente encena o nome (§5.6). */}
            <Simbolo tamanho={32} className="mx-auto animate-pulse" />
            <h1 className="mt-4 font-titulo text-[20px] font-semibold text-foreground">
              {qr ? "Pague para autorizar" : "Preparando…"}
            </h1>

            {qr?.imagem && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${qr.imagem}`}
                alt="QR Code do Pix para autorizar a cobrança"
                className="mx-auto mt-4 size-56 rounded-md border"
              />
            )}

            {qr?.payload && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qr.payload!);
                  setCopiado(true);
                  setTimeout(() => setCopiado(false), 2500);
                }}
                className="mt-4 min-h-[52px] w-full rounded-md border px-5 text-[16px] font-medium text-foreground"
              >
                {copiado ? "Código copiado" : "Copiar código Pix"}
              </button>
            )}

            {qr?.link && (
              <a
                href={qr.link}
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: destaque, color: sobreDestaque }}
                className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-md px-5 text-[17px] font-medium"
              >
                Abrir no app do banco
              </a>
            )}

            <p className="mt-4 text-[15px] text-texto">
              Assim que o pagamento cair, esta tela avisa. Pode deixar aberta.
            </p>
          </div>
        )}

        {etapa === "erro" && (
          <div role="alert" className="mt-4 rounded-md bg-risco-bg px-3 py-3 text-[16px] text-risco-texto">
            {erro}
          </div>
        )}
      </div>

      {/* Nunca acima do botão. */}
      <Assinatura />
    </main>
  );
}
