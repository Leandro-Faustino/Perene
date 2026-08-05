import type { MetodoPagamento, Periodicidade } from "@/lib/gateways/types";

/**
 * Importação da base a partir de CSV.
 *
 * Este arquivo é função pura de ponta a ponta, pelo mesmo motivo do
 * `diagnostico.ts`: é sobre estes dados que o número do diagnóstico é
 * calculado, e o operador precisa poder conferir o que entrou.
 *
 * A regra que molda o desenho inteiro é o RF-23: **nunca resolver duplicado em
 * silêncio.** Uma base real de academia tem o mesmo aluno cadastrado duas
 * vezes, o filho no CPF da mãe, o telefone repetido entre irmãos. Escolher
 * sozinho qual linha vale é como um sistema perde a confiança de quem opera —
 * por isso o retorno separa o que entrou do que precisa de decisão humana.
 */

export interface LinhaImportada {
  linha: number;
  nome: string;
  email: string | null;
  telefoneE164: string | null;
  cpf: string | null;
  valorCentavos: number;
  metodo: MetodoPagamento;
  periodicidade: Periodicidade;
  diaVencimento: number | null;
}

export interface LinhaComProblema {
  linha: number;
  conteudo: string;
  /** Já em português e acionável — o operador precisa saber o que corrigir. */
  motivo: string;
}

export interface GrupoDuplicado {
  /** O que fez as linhas colidirem: mesmo CPF ou mesmo telefone. */
  chave: string;
  criterio: "cpf" | "telefone";
  linhas: LinhaImportada[];
}

export interface ResultadoDaImportacao {
  aceitas: LinhaImportada[];
  duplicados: GrupoDuplicado[];
  problemas: LinhaComProblema[];
  colunasReconhecidas: Record<string, string>;
}

// -----------------------------------------------------------------------------
// Reconhecimento de colunas
// -----------------------------------------------------------------------------

/**
 * Cada sistema de gestão exporta com um cabeçalho diferente. Em vez de exigir
 * um modelo fixo — que faria o operador editar planilha antes de começar, e a
 * meta é menos de 10 minutos até o número —, reconhecemos os nomes usuais.
 */
const SINONIMOS: Record<string, string[]> = {
  nome: ["nome", "name", "cliente", "aluno", "paciente", "morador", "assinante", "razao social"],
  email: ["email", "e-mail", "mail"],
  telefone: ["telefone", "celular", "fone", "whatsapp", "phone", "telefone celular"],
  cpf: ["cpf", "cpf/cnpj", "cpfcnpj", "documento", "doc", "cnpj"],
  valor: ["valor", "mensalidade", "amount", "preco", "preço", "valor mensal"],
  metodo: ["metodo", "método", "forma de pagamento", "forma pagamento", "billingtype", "tipo"],
  periodicidade: ["periodicidade", "frequencia", "frequência", "ciclo", "cycle"],
  vencimento: ["vencimento", "dia vencimento", "dia de vencimento", "duedate", "due day", "dia"],
};

function normalizarCabecalho(bruto: string): string {
  return bruto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function mapearColunas(cabecalhos: string[]): Record<string, number> {
  const mapa: Record<string, number> = {};

  cabecalhos.forEach((bruto, indice) => {
    const normalizado = normalizarCabecalho(bruto);
    for (const [campo, sinonimos] of Object.entries(SINONIMOS)) {
      if (mapa[campo] !== undefined) continue;
      if (sinonimos.some((s) => normalizarCabecalho(s) === normalizado)) {
        mapa[campo] = indice;
      }
    }
  });

  return mapa;
}

// -----------------------------------------------------------------------------
// CSV
// -----------------------------------------------------------------------------

/**
 * Detecta o separador. Planilha exportada no Brasil usa ponto e vírgula com
 * frequência, porque a vírgula já é o separador decimal. Errar isso faz a
 * importação inteira virar uma coluna só.
 */
export function detectarSeparador(primeiraLinha: string): "," | ";" | "\t" {
  const candidatos = [";", ",", "\t"] as const;
  let melhor: (typeof candidatos)[number] = ",";
  let maior = 0;

  for (const c of candidatos) {
    const quantidade = primeiraLinha.split(c).length - 1;
    if (quantidade > maior) {
      maior = quantidade;
      melhor = c;
    }
  }
  return melhor;
}

/** Parser de CSV com suporte a aspas e a separador dentro de campo citado. */
export function analisarCsv(texto: string, separador: string): string[][] {
  const linhas: string[][] = [];
  let campo = "";
  let atual: string[] = [];
  let dentroDeAspas = false;

  const conteudo = texto.replace(/^﻿/, ""); // BOM do Excel

  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];

    if (dentroDeAspas) {
      if (c === '"') {
        if (conteudo[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroDeAspas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      dentroDeAspas = true;
    } else if (c === separador) {
      atual.push(campo);
      campo = "";
    } else if (c === "\n") {
      atual.push(campo);
      linhas.push(atual);
      atual = [];
      campo = "";
    } else if (c !== "\r") {
      campo += c;
    }
  }

  if (campo !== "" || atual.length > 0) {
    atual.push(campo);
    linhas.push(atual);
  }

  return linhas.filter((l) => l.some((c) => c.trim() !== ""));
}

// -----------------------------------------------------------------------------
// Conversões
// -----------------------------------------------------------------------------

/**
 * Dinheiro em formato brasileiro.
 *
 * "R$ 1.234,56" → 123456. O ponto é separador de milhar e a vírgula é decimal —
 * o inverso do que `Number()` espera. Interpretar "1.234,56" como 1.234 é um
 * erro de duas ordens de grandeza no diagnóstico inteiro.
 */
export function analisarDinheiro(bruto: string): number | null {
  const limpo = bruto.replace(/[R$\s ]/gi, "").trim();
  if (!limpo) return null;

  const temVirgula = limpo.includes(",");
  const temPonto = limpo.includes(".");

  let normalizado = limpo;
  if (temVirgula && temPonto) {
    // "1.234,56" — ponto é milhar, vírgula é decimal.
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else if (temVirgula) {
    // "1234,56" — só decimal.
    normalizado = limpo.replace(",", ".");
  } else if (temPonto) {
    // Ambíguo: "1.234" pode ser mil e duzentos ou um e pouco. Se houver
    // exatamente dois dígitos depois do ponto, tratamos como decimal; senão,
    // como milhar. É a leitura que acerta na esmagadora maioria dos exports.
    const partes = limpo.split(".");
    const ultimo = partes[partes.length - 1];
    normalizado = ultimo.length === 2 ? limpo : limpo.replace(/\./g, "");
  }

  const numero = Number(normalizado);
  if (!Number.isFinite(numero) || numero <= 0) return null;
  return Math.round(numero * 100);
}

export function analisarCpf(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "");
  if (digitos.length === 11 || digitos.length === 14) return digitos;
  return null;
}

export function analisarTelefone(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  if (digitos.startsWith("55") && digitos.length >= 12) return `+${digitos}`;
  if (digitos.length > 11) return null;
  return `+55${digitos}`;
}

export function analisarMetodo(bruto: string): MetodoPagamento {
  const t = normalizarCabecalho(bruto);
  if (/cartao|credito|credit|card/.test(t)) return "card";
  if (/boleto|bank slip/.test(t)) return "boleto";
  if (/pix automatico|pix recorrente|automatico/.test(t)) return "pix_automatico";
  if (/pix/.test(t)) return "pix_manual";
  if (/debito automatico|debito em conta/.test(t)) return "debito_automatico";
  return "other";
}

export function analisarPeriodicidade(bruto: string): Periodicidade {
  const t = normalizarCabecalho(bruto);
  if (/seman/.test(t)) return "weekly";
  if (/trimestr|quarter/.test(t)) return "quarterly";
  if (/semestr/.test(t)) return "semiannual";
  if (/anual|year/.test(t)) return "annual";
  return "monthly";
}

function analisarDiaVencimento(bruto: string): number | null {
  const digitos = bruto.replace(/\D/g, "");
  if (!digitos) return null;
  // Aceita tanto "10" quanto uma data completa ("2026-08-10", "10/08/2026").
  const dia = bruto.includes("/")
    ? Number(bruto.split("/")[0])
    : bruto.includes("-")
      ? Number(bruto.slice(8, 10))
      : Number(digitos);
  return Number.isFinite(dia) && dia >= 1 && dia <= 31 ? dia : null;
}

// -----------------------------------------------------------------------------
// Importação
// -----------------------------------------------------------------------------

export function importarCsv(texto: string): ResultadoDaImportacao {
  const linhasBrutas = texto.split("\n");
  if (linhasBrutas.length === 0 || texto.trim() === "") {
    return {
      aceitas: [],
      duplicados: [],
      problemas: [{ linha: 0, conteudo: "", motivo: "O arquivo está vazio." }],
      colunasReconhecidas: {},
    };
  }

  const separador = detectarSeparador(linhasBrutas[0]);
  const grade = analisarCsv(texto, separador);
  const [cabecalho, ...corpo] = grade;
  const colunas = mapearColunas(cabecalho ?? []);

  const colunasReconhecidas: Record<string, string> = {};
  for (const [campo, indice] of Object.entries(colunas)) {
    colunasReconhecidas[campo] = cabecalho[indice];
  }

  const problemas: LinhaComProblema[] = [];

  if (colunas.nome === undefined) {
    problemas.push({
      linha: 1,
      conteudo: (cabecalho ?? []).join(separador),
      motivo:
        "Não encontramos a coluna de nome. Renomeie o cabeçalho para 'nome' e envie de novo.",
    });
  }
  if (colunas.valor === undefined) {
    problemas.push({
      linha: 1,
      conteudo: (cabecalho ?? []).join(separador),
      motivo:
        "Não encontramos a coluna de valor da mensalidade. Renomeie o cabeçalho para 'valor'.",
    });
  }
  if (problemas.length > 0) {
    return { aceitas: [], duplicados: [], problemas, colunasReconhecidas };
  }

  const candidatas: LinhaImportada[] = [];

  corpo.forEach((celulas, i) => {
    const numeroDaLinha = i + 2; // +1 pelo cabeçalho, +1 porque planilha começa em 1
    const pegar = (campo: string) =>
      colunas[campo] !== undefined ? (celulas[colunas[campo]] ?? "").trim() : "";

    const nome = pegar("nome");
    if (!nome) {
      problemas.push({
        linha: numeroDaLinha,
        conteudo: celulas.join(separador),
        motivo: "Sem nome. Toda linha precisa identificar quem paga.",
      });
      return;
    }

    const valorCentavos = analisarDinheiro(pegar("valor"));
    if (valorCentavos === null) {
      problemas.push({
        linha: numeroDaLinha,
        conteudo: celulas.join(separador),
        motivo: `Valor não reconhecido: "${pegar("valor")}". Use 250,00 ou R$ 250,00.`,
      });
      return;
    }

    const telefoneE164 = analisarTelefone(pegar("telefone"));
    const email = pegar("email") || null;
    const cpf = analisarCpf(pegar("cpf"));

    // Sem telefone e sem e-mail não há como convidar essa pessoa a migrar —
    // o contrato entra no diagnóstico, mas a onda não alcança. Avisamos agora,
    // e não no dia do disparo.
    if (!telefoneE164 && !email) {
      problemas.push({
        linha: numeroDaLinha,
        conteudo: celulas.join(separador),
        motivo:
          "Sem telefone e sem e-mail: dá para contar no diagnóstico, mas não dá para convidar a migrar.",
      });
    }

    candidatas.push({
      linha: numeroDaLinha,
      nome,
      email,
      telefoneE164,
      cpf,
      valorCentavos,
      metodo: analisarMetodo(pegar("metodo")),
      periodicidade: analisarPeriodicidade(pegar("periodicidade")),
      diaVencimento: analisarDiaVencimento(pegar("vencimento")),
    });
  });

  const { aceitas, duplicados } = separarDuplicados(candidatas);

  return { aceitas, duplicados, problemas, colunasReconhecidas };
}

/**
 * Agrupa colisões em vez de escolher um vencedor.
 *
 * CPF primeiro, telefone depois: CPF identifica pessoa, telefone identifica
 * aparelho — e aparelho é compartilhado entre mãe e filho, entre irmãos, entre
 * casal. Um telefone repetido pode ser duas pessoas de verdade, e é por isso
 * que a decisão volta para quem conhece a base.
 */
export function separarDuplicados(linhas: LinhaImportada[]): {
  aceitas: LinhaImportada[];
  duplicados: GrupoDuplicado[];
} {
  const porCpf = new Map<string, LinhaImportada[]>();
  const porTelefone = new Map<string, LinhaImportada[]>();
  const semChave: LinhaImportada[] = [];

  for (const linha of linhas) {
    if (linha.cpf) {
      porCpf.set(linha.cpf, [...(porCpf.get(linha.cpf) ?? []), linha]);
    } else if (linha.telefoneE164) {
      porTelefone.set(linha.telefoneE164, [
        ...(porTelefone.get(linha.telefoneE164) ?? []),
        linha,
      ]);
    } else {
      semChave.push(linha);
    }
  }

  const aceitas: LinhaImportada[] = [...semChave];
  const duplicados: GrupoDuplicado[] = [];

  for (const [chave, grupo, criterio] of [
    ...[...porCpf.entries()].map(
      ([k, v]) => [k, v, "cpf"] as [string, LinhaImportada[], "cpf"],
    ),
    ...[...porTelefone.entries()].map(
      ([k, v]) => [k, v, "telefone"] as [string, LinhaImportada[], "telefone"],
    ),
  ]) {
    if (grupo.length === 1) {
      aceitas.push(grupo[0]);
    } else {
      duplicados.push({ chave, criterio, linhas: grupo });
    }
  }

  aceitas.sort((a, b) => a.linha - b.linha);
  duplicados.sort((a, b) => a.linhas[0].linha - b.linhas[0].linha);

  return { aceitas, duplicados };
}
