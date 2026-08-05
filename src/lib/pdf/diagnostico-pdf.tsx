import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import { corDeDestaque, textoSobre } from "@/lib/contraste";
import { rotulo, type Diagnostico } from "@/lib/domain/diagnostico";

/**
 * O RELATÓRIO DE DIAGNÓSTICO (RF-34).
 *
 * O brand book chama este PDF de "o material de marca mais importante do
 * negócio" (§1.2) e de ativo sensorial da marca (§4.4): é o objeto que passa
 * de mão em mão, que circula em grupo de WhatsApp sem intervenção comercial, e
 * de onde deve sair 20% dos leads qualificados no primeiro semestre.
 *
 * Por isso a decisão de assinatura que parece contraintuitiva: **quem assina
 * este documento é a ORGANIZAÇÃO, não a Pulse.** Nome dela no topo, cor dela no
 * destaque. A Pulse assina uma linha no rodapé, em texto, sem símbolo colorido.
 *
 * Isso resolve a persona Rafael (§2.3), o parceiro de canal: ele precisa poder
 * apresentar o diagnóstico como material dele, sem parecer revendedor de
 * ninguém. Uma marca nossa no cabeçalho transformaria um multiplicador em
 * concorrente.
 *
 * A cor da organização chega arbitrária, então o texto sobre ela é calculado
 * (§5.2) — nunca confiamos na cor que o cliente subiu.
 */

const COR = {
  grafite: "#12161C",
  texto: "#475467",
  textoMedio: "#667085",
  borda: "#E4E7EC",
  superficie: "#F7F8FA",
  branco: "#FFFFFF",
};

const estilos = StyleSheet.create({
  pagina: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: "Inter",
    fontSize: 10,
    color: COR.texto,
    lineHeight: 1.5,
  },

  // Cabeçalho: a organização assina.
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COR.borda,
  },
  nomeDaOrganizacao: {
    fontFamily: "Archivo",
    fontWeight: 600,
    fontSize: 16,
    color: COR.grafite,
  },
  etiqueta: {
    fontSize: 8,
    color: COR.textoMedio,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // O número. Archivo, porque em PDF é ela que tem dígito de largura uniforme.
  destaque: {
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 8,
    padding: 18,
    marginBottom: 20,
  },
  numeroGrande: {
    fontFamily: "Archivo",
    fontWeight: 700,
    fontSize: 34,
    color: COR.grafite,
    marginTop: 6,
    // O react-pdf não reserva a altura da linha sozinho quando há Text
    // aninhado de tamanho menor: sem isto, o número invade a frase de baixo.
    lineHeight: 1.2,
    marginBottom: 4,
  },
  numero: { fontFamily: "Archivo", fontWeight: 600 },

  secao: { marginBottom: 18 },
  tituloDeSecao: {
    fontFamily: "Archivo",
    fontWeight: 600,
    fontSize: 13,
    color: COR.grafite,
    marginBottom: 10,
  },

  linhaDeCabecalho: {
    flexDirection: "row",
    backgroundColor: COR.superficie,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  linha: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COR.borda,
  },
  colMetodo: { flex: 3 },
  colNumero: { flex: 2, textAlign: "right" },

  cartao: {
    flex: 1,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 8,
    padding: 12,
  },

  memoria: {
    backgroundColor: COR.superficie,
    borderRadius: 8,
    padding: 14,
  },
  itemDeMemoria: { fontSize: 8.5, color: COR.texto, marginBottom: 4 },

  // A assinatura da Pulse: rodapé, texto, sem cor de marca (§3.4).
  rodape: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COR.textoMedio,
  },
});

function reais(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

function percentual(fracao: number): string {
  return `${Math.round(fracao * 100)}%`;
}

export interface DadosDaOrganizacao {
  nome: string;
  corDeMarca: string | null;
  rotuloDoPagador: string;
}

export function DocumentoDeDiagnostico({
  organizacao,
  diagnostico,
  geradoEm,
}: {
  organizacao: DadosDaOrganizacao;
  diagnostico: Diagnostico;
  geradoEm: Date;
}) {
  const destaque = corDeDestaque(organizacao.corDeMarca);
  const sobreDestaque = textoSobre(destaque);

  const custoAnual = diagnostico.custoMensalAtualCentavos * 12;
  const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(geradoEm);

  return (
    <Document
      title={`Diagnóstico de cobrança — ${organizacao.nome}`}
      author={organizacao.nome}
      subject="Custo atual de cobrança e projeção com Pix Automático"
    >
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.cabecalho}>
          <View>
            <Text style={estilos.nomeDaOrganizacao}>{organizacao.nome}</Text>
            <Text style={{ fontSize: 9, color: COR.textoMedio, marginTop: 2 }}>
              Diagnóstico de cobrança · {data}
            </Text>
          </View>
          {/* Único uso da cor da organização: uma tarja de identificação, com
              o texto calculado contra ela. */}
          <View
            style={{
              backgroundColor: destaque,
              borderRadius: 4,
              paddingVertical: 4,
              paddingHorizontal: 8,
            }}
          >
            <Text style={{ fontSize: 8, color: sobreDestaque, fontWeight: 500 }}>
              {diagnostico.contratosAtivos} contratos ativos
            </Text>
          </View>
        </View>

        {/* O número primeiro. Sem adjetivo: ele já é dramático o suficiente. */}
        <View style={estilos.destaque}>
          <Text style={estilos.etiqueta}>Custo de cobrança hoje</Text>
          <Text style={estilos.numeroGrande}>
            {reais(diagnostico.custoMensalAtualCentavos)}
            <Text style={{ fontSize: 14, color: COR.textoMedio }}> /mês</Text>
          </Text>
          <Text style={{ marginTop: 8, fontSize: 10 }}>
            São <Text style={estilos.numero}>{reais(custoAnual)}</Text> por ano,
            sobre uma receita mensal de{" "}
            <Text style={estilos.numero}>
              {reais(diagnostico.receitaMensalCentavos)}
            </Text>
            .
          </Text>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.tituloDeSecao}>Onde está vazando</Text>

          <View style={estilos.linhaDeCabecalho}>
            <Text style={[estilos.colMetodo, estilos.etiqueta]}>Método</Text>
            <Text style={[estilos.colNumero, estilos.etiqueta]}>Contratos</Text>
            <Text style={[estilos.colNumero, estilos.etiqueta]}>Receita/mês</Text>
            <Text style={[estilos.colNumero, estilos.etiqueta]}>Custo/mês</Text>
          </View>

          {diagnostico.custoPorMetodo.map((m) => (
            <View key={m.metodo} style={estilos.linha}>
              <Text style={estilos.colMetodo}>{rotulo(m.metodo)}</Text>
              <Text style={[estilos.colNumero, estilos.numero]}>{m.contratos}</Text>
              <Text style={[estilos.colNumero, estilos.numero]}>
                {reais(m.receitaMensalCentavos)}
              </Text>
              <Text
                style={[estilos.colNumero, estilos.numero, { color: COR.grafite }]}
              >
                {reais(m.custoMensalCentavos)}
              </Text>
            </View>
          ))}
        </View>

        {diagnostico.falhas.quantidade > 0 && (
          <View style={estilos.secao}>
            <Text style={estilos.tituloDeSecao}>Cobranças que não entraram</Text>
            <Text style={{ fontFamily: "Archivo", fontWeight: 600, fontSize: 20, color: COR.grafite }}>
              {reais(diagnostico.falhas.valorCentavos)}
            </Text>
            <Text style={{ fontSize: 9, color: COR.textoMedio, marginTop: 4 }}>
              {diagnostico.falhas.memoria}
            </Text>
          </View>
        )}

        <View style={estilos.secao}>
          <Text style={estilos.tituloDeSecao}>
            Quanto muda com Pix Automático
          </Text>
          <Text style={{ fontSize: 9.5, marginBottom: 10 }}>
            Três cenários de adesão. Nenhum é promessa — é a mesma conta, com
            proporções diferentes de {organizacao.rotuloDoPagador}es migrados.
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {diagnostico.cenarios.map((c) => (
              <View key={c.adesao} style={estilos.cartao}>
                <Text style={estilos.etiqueta}>
                  {percentual(c.adesao)} de adesão
                </Text>
                <Text
                  style={{
                    fontFamily: "Archivo",
                    fontWeight: 600,
                    fontSize: 15,
                    color: COR.grafite,
                    marginTop: 4,
                  }}
                >
                  {reais(c.economiaMensalCentavos)}
                  <Text style={{ fontSize: 9, color: COR.textoMedio }}> /mês</Text>
                </Text>
                <Text style={{ fontSize: 9, color: COR.texto, marginTop: 2 }}>
                  {reais(c.economiaAnualCentavos)} por ano
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* A memória de cálculo não é apêndice: é o que torna o número
            reproduzível, e sem isso ele não vale (§4.2, valor PRECISÃO). */}
        <Text
          style={{
            fontSize: 8.5,
            color: COR.textoMedio,
            textAlign: "center",
            marginTop: 4,
          }}
        >
          A memória de cálculo, com a origem de cada tarifa, está na página
          seguinte.
        </Text>

        {/* A memória vai para a página 2 DE PROPÓSITO, com `break`.
            Ela não cabe junto com os números sem espremer o corpo do texto, e
            o brand book proíbe letra miúda em conteúdo (§5.2). Duas páginas
            com a segunda inteira dedicada a "como chegamos nesses números" lê
            como anexo deliberado; meia página vazia leria como erro.
            `wrap={false}` impede que ela ainda assim se parta ao meio. */}
        <View style={estilos.memoria} break wrap={false}>
          <Text
            style={{
              fontFamily: "Archivo",
              fontWeight: 600,
              fontSize: 10,
              color: COR.grafite,
              marginBottom: 6,
            }}
          >
            Como chegamos nesses números
          </Text>
          {diagnostico.memoriaGeral.map((linha) => (
            <Text key={linha} style={estilos.itemDeMemoria}>
              • {linha}
            </Text>
          ))}
          {diagnostico.custoPorMetodo.map((m) => (
            <Text key={m.metodo} style={estilos.itemDeMemoria}>
              • {m.memoria}
            </Text>
          ))}
        </View>

        <View style={estilos.rodape} fixed>
          <Text>
            Diagnóstico gerado para {organizacao.nome} em {data}
          </Text>
          <Text>Processado por Pulse</Text>
        </View>
      </Page>
    </Document>
  );
}
