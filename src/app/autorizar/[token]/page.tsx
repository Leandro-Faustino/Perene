import type { Metadata } from "next";

import { carregarConvite, marcarConviteAberto } from "@/lib/domain/convite";
import { CartaoDeAutorizacao } from "@/components/autorizar/cartao-de-autorizacao";
import { AvisoDeConvite } from "@/components/autorizar/aviso-de-convite";
import { expirou } from "@/lib/domain/tokens";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Autorizar cobrança",
  // O link circula por WhatsApp. Não queremos preview de rede social nem
  // indexação de uma página que contém nome e valor de uma pessoa.
  robots: { index: false, follow: false },
};

/**
 * A PÁGINA DO PAGADOR.
 *
 * É a superfície oposta ao painel (§3.6): usada uma vez na vida, no celular,
 * provavelmente às pressas. Densidade mínima, uma decisão só. O erro fatal
 * aqui não é esconder informação — é pedir uma decisão a mais.
 *
 * Quem assina esta tela é a ORGANIZAÇÃO. A Pulse aparece numa linha de rodapé,
 * em texto, sem símbolo colorido e nunca acima do botão (§3.4, valor
 * DISCRIÇÃO). O pagador está prestes a autorizar débito na conta dele e precisa
 * saber que existe um sistema por trás — mas a relação é com a academia, não
 * conosco.
 */
export default async function PaginaDeAutorizacao({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const convite = await carregarConvite(token);

  if (!convite) {
    return (
      <AvisoDeConvite
        titulo="Esse link não vale mais"
        texto="Ele pode ter expirado ou sido substituído por outro. Peça um link novo a quem te enviou — leva um minuto."
      />
    );
  }

  if (convite.mandateStatus === "authorized" || convite.status === "authorized") {
    return (
      <AvisoDeConvite
        organizacao={convite.organizacao}
        titulo="Tudo certo, já está autorizado"
        texto={`Sua mensalidade da ${convite.organizacao.nome} vai ser debitada automaticamente. Você não precisa fazer mais nada.`}
        tom="ativo"
      />
    );
  }

  if (expirou(convite.expiraEm)) {
    return (
      <AvisoDeConvite
        organizacao={convite.organizacao}
        titulo="Esse link expirou"
        texto="Por segurança, o link vale por tempo limitado. Peça um novo a quem te enviou."
      />
    );
  }

  // Registra a abertura. O operador precisa distinguir "não recebeu" de
  // "recebeu, abriu e não autorizou" — são dois problemas com duas ações.
  await marcarConviteAberto(token);

  return <CartaoDeAutorizacao token={token} convite={convite} />;
}
