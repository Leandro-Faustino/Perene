import { describe, expect, it } from "vitest";

import {
  agendarRegua,
  dentroDoHorarioCivil,
  deveContinuar,
  dividirEmLotesDiarios,
  REGUA_PADRAO,
} from "./cadence";
import {
  ordenarParaConvite,
  resumirOnda,
  selecionarParaOnda,
  type ContratoCandidato,
} from "./waves";
import { calcularExpiracao, expirou, gerarToken, pareceToken } from "./tokens";

function contrato(over: Partial<ContratoCandidato> = {}): ContratoCandidato {
  return {
    id: "c1",
    valorCentavos: 25_000,
    metodo: "card",
    falhas12m: 0,
    tags: [],
    temTelefone: true,
    temEmail: true,
    jaMigrado: false,
    temConviteAberto: false,
    ...over,
  };
}

describe("gerarToken", () => {
  it("produz token opaco, seguro para URL e sem colisão prática", () => {
    const tokens = new Set(Array.from({ length: 500 }, () => gerarToken()));
    expect(tokens.size).toBe(500);

    for (const t of tokens) {
      // Sem +, / ou = : esses viram %2B e %2F quando o link passa por WhatsApp.
      expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(pareceToken(t)).toBe(true);
    }
  });

  it("recusa formato inválido antes de ir ao banco", () => {
    expect(pareceToken("curto")).toBe(false);
    expect(pareceToken("a".repeat(39))).toBe(false);
    expect(pareceToken("token/com/barra/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe(false);
  });
});

describe("validade do convite", () => {
  it("expira em 14 dias, depois do último passo da régua", () => {
    const criado = new Date("2026-08-05T10:00:00");
    const expira = calcularExpiracao(criado);

    // Precisa sobreviver ao D+10, senão o último lembrete leva a um link morto.
    const ultimoPasso = agendarRegua(criado).at(-1)!;
    expect(expira.getTime()).toBeGreaterThan(ultimoPasso.quando.getTime());
  });

  it("reconhece convite vencido", () => {
    const agora = new Date("2026-08-20T10:00:00");
    expect(expirou(new Date("2026-08-19T10:00:00"), agora)).toBe(true);
    expect(expirou(new Date("2026-08-21T10:00:00"), agora)).toBe(false);
  });
});

describe("agendarRegua", () => {
  it("agenda D0, D+2, D+5 e D+10", () => {
    const inicio = new Date("2026-08-05T10:00:00");
    const passos = agendarRegua(inicio);

    expect(passos).toHaveLength(4);
    expect(passos.map((p) => p.passo)).toEqual([1, 2, 3, 4]);
    expect(passos[0].quando.getDate()).toBe(5);
    expect(passos[1].quando.getDate()).toBe(7);
    expect(passos[2].quando.getDate()).toBe(10);
    expect(passos[3].quando.getDate()).toBe(15);
  });

  it("nunca agenda fora do horário civil", () => {
    for (const hora of [3, 7, 22, 23]) {
      const inicio = new Date("2026-08-05T00:00:00");
      inicio.setHours(hora);
      for (const passo of agendarRegua(inicio)) {
        const h = passo.quando.getHours();
        expect(h).toBeGreaterThanOrEqual(REGUA_PADRAO.horaInicial);
        expect(h).toBeLessThan(REGUA_PADRAO.horaFinal);
      }
    }
  });

  it("empurra para o dia seguinte, nunca para trás", () => {
    // Antecipar um lembrete o faria chegar antes do anterior.
    const noite = new Date("2026-08-05T22:00:00");
    const ajustado = dentroDoHorarioCivil(noite);
    expect(ajustado.getDate()).toBe(6);
    expect(ajustado.getHours()).toBe(9);
  });
});

describe("deveContinuar", () => {
  const base = { expiraEm: new Date("2026-12-31T00:00:00"), agora: new Date("2026-08-05T10:00:00") };

  it("para no instante da autorização", () => {
    // Continuar cobrando quem já autorizou é o caminho mais curto para a
    // denúncia que derruba o número.
    expect(
      deveContinuar({ ...base, statusDoConvite: "pending", statusDoMandato: "authorized" }).continua,
    ).toBe(false);
  });

  it("para quando o pagador recusa ou o convite expira", () => {
    expect(deveContinuar({ ...base, statusDoConvite: "declined", statusDoMandato: null }).continua).toBe(false);
    expect(deveContinuar({ ...base, statusDoConvite: "expired", statusDoMandato: null }).continua).toBe(false);
    expect(
      deveContinuar({
        statusDoConvite: "pending",
        statusDoMandato: null,
        expiraEm: new Date("2026-08-01T00:00:00"),
        agora: base.agora,
      }).continua,
    ).toBe(false);
  });

  it("continua enquanto está pendente e dentro da validade", () => {
    const r = deveContinuar({ ...base, statusDoConvite: "pending", statusDoMandato: "pending" });
    expect(r.continua).toBe(true);
  });

  it("explica o motivo da parada, para aparecer na linha do tempo", () => {
    const r = deveContinuar({ ...base, statusDoConvite: "pending", statusDoMandato: "authorized" });
    expect(r.motivo).toContain("autoriza");
  });
});

describe("dividirEmLotesDiarios", () => {
  it("respeita o limite diário e espalha pelos dias", () => {
    const itens = Array.from({ length: 250 }, (_, i) => i);
    const lotes = dividirEmLotesDiarios(itens, 100, new Date("2026-08-05T10:00:00"));

    expect(lotes).toHaveLength(3);
    expect(lotes.map((l) => l.itens.length)).toEqual([100, 100, 50]);
    expect(lotes[0].dia.getDate()).toBe(5);
    expect(lotes[2].dia.getDate()).toBe(7);
  });

  it("cabe num dia só quando a base é menor que o limite", () => {
    const lotes = dividirEmLotesDiarios([1, 2, 3], 100, new Date("2026-08-05T10:00:00"));
    expect(lotes).toHaveLength(1);
  });
});

describe("selecionarParaOnda", () => {
  it("exclui quem já migrou, quem tem convite aberto e método não migrável", () => {
    const { elegiveis, excluidos } = selecionarParaOnda([
      contrato({ id: "ok" }),
      contrato({ id: "migrado", jaMigrado: true }),
      contrato({ id: "convidado", temConviteAberto: true }),
      contrato({ id: "ja-pix", metodo: "pix_automatico" }),
    ]);

    expect(elegiveis.map((c) => c.id)).toEqual(["ok"]);
    expect(excluidos).toHaveLength(3);
  });

  it("exclui quem não tem como ser convidado, e diz isso", () => {
    // O operador vai perguntar por que só parte da base entrou. "Sem telefone
    // e sem e-mail" é resposta que gera ação.
    const { excluidos } = selecionarParaOnda([
      contrato({ id: "sem-contato", temTelefone: false, temEmail: false }),
    ]);

    expect(excluidos[0].motivo).toContain("sem telefone");
  });

  it("aplica faixa de valor e mínimo de falhas", () => {
    const candidatos = [
      contrato({ id: "barato", valorCentavos: 5_000, falhas12m: 3 }),
      contrato({ id: "caro", valorCentavos: 100_000, falhas12m: 3 }),
      contrato({ id: "sem-falha", valorCentavos: 50_000, falhas12m: 0 }),
    ];

    const { elegiveis } = selecionarParaOnda(candidatos, {
      valorMinimoCentavos: 10_000,
      falhasMinimas: 1,
    });

    expect(elegiveis.map((c) => c.id)).toEqual(["caro"]);
  });
});

describe("ordenarParaConvite", () => {
  it("põe quem mais falha na frente, não quem paga mais", () => {
    // O critério é a falha: quem já teve cobrança quebrada está mais perto do
    // churn acidental, que é o antagonista da marca.
    const ordenados = ordenarParaConvite([
      contrato({ id: "caro-sem-falha", valorCentavos: 100_000, falhas12m: 0 }),
      contrato({ id: "barato-com-falha", valorCentavos: 10_000, falhas12m: 5 }),
    ]);

    expect(ordenados[0].id).toBe("barato-com-falha");
  });

  it("desempata pelo valor entre contratos igualmente problemáticos", () => {
    const ordenados = ordenarParaConvite([
      contrato({ id: "menor", valorCentavos: 10_000, falhas12m: 3 }),
      contrato({ id: "maior", valorCentavos: 90_000, falhas12m: 3 }),
    ]);

    expect(ordenados[0].id).toBe("maior");
  });

  it("é estável: mesma entrada, mesma ordem", () => {
    const entrada = [
      contrato({ id: "b", falhas12m: 1 }),
      contrato({ id: "a", falhas12m: 1 }),
    ];
    expect(ordenarParaConvite(entrada).map((c) => c.id)).toEqual(
      ordenarParaConvite(entrada).map((c) => c.id),
    );
  });
});

describe("resumirOnda", () => {
  it("agrupa os motivos de exclusão do mais comum para o menos", () => {
    const selecao = selecionarParaOnda([
      contrato({ id: "1", temTelefone: false, temEmail: false }),
      contrato({ id: "2", temTelefone: false, temEmail: false }),
      contrato({ id: "3", jaMigrado: true }),
      contrato({ id: "4", valorCentavos: 30_000 }),
    ]);

    const resumo = resumirOnda(selecao);

    expect(resumo.elegiveis).toBe(1);
    expect(resumo.excluidos).toBe(3);
    expect(resumo.motivos[0].quantidade).toBe(2);
    expect(resumo.valorMensalEmJogoCentavos).toBe(30_000);
  });
});
