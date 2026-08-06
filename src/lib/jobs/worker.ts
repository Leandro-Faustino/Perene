import { randomUUID } from "node:crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { esperaAntesDeRetentar, type Job, type PayloadDeJob, type ResultadoDoJob } from "./types";
import { enviarPassoDaRegua } from "./handlers/send-cadence-step";
import { expirarConvite } from "./handlers/expire-invitation";
import { processarEventoDeWebhook } from "./handlers/process-webhook-event";
import { enviarMensagem } from "./handlers/send-message";
import { agendarCobranca } from "./handlers/schedule-charge";
import { sondarCobranca } from "./handlers/charge-status-poll";

import "server-only";

const TAMANHO_DO_LOTE = 20;

export interface ResumoDoTick {
  pegos: number;
  feitos: number;
  reagendados: number;
  falhados: number;
  esgotados: number;
}

/**
 * Um tick do worker.
 *
 * Roda a cada minuto pelo Vercel Cron. A seleção e o travamento acontecem numa
 * transação só, no banco (`pulse.pegar_jobs`, com `for update skip locked`):
 * fazer "select depois update" daqui abriria a janela em que dois ticks pegam
 * o mesmo job — e neste produto isso é a mesma pessoa recebendo o mesmo
 * convite duas vezes.
 */
export async function rodarTick(): Promise<ResumoDoTick> {
  const supa = supabaseAdmin();
  const identificacao = `worker-${randomUUID().slice(0, 8)}`;

  const { data, error } = await supa.rpc("pegar_jobs", {
    p_lote: TAMANHO_DO_LOTE,
    p_worker: identificacao,
  });

  if (error) {
    throw new Error(`Não conseguimos pegar trabalhos da fila: ${error.message}`);
  }

  const jobs = (data ?? []) as Job[];
  const resumo: ResumoDoTick = {
    pegos: jobs.length,
    feitos: 0,
    reagendados: 0,
    falhados: 0,
    esgotados: 0,
  };

  // Sequencial de propósito. Paralelizar aqui multiplicaria a taxa de disparo
  // de WhatsApp, que é exatamente o que o limite diário existe para conter.
  for (const job of jobs) {
    let resultado: ResultadoDoJob;

    try {
      resultado = await executar(job);
    } catch (causa) {
      resultado = {
        estado: "falhou",
        erro: causa instanceof Error ? causa.message : String(causa),
        recuperavel: true,
      };
    }

    if (resultado.estado === "feito") {
      await supa
        .from("jobs")
        .update({ status: "done", last_error: resultado.detalhe ?? null })
        .eq("id", job.id);
      resumo.feitos++;
      continue;
    }

    if (resultado.estado === "reagendar") {
      // Reagendar não consome tentativa: não houve falha, só não era hora.
      await supa
        .from("jobs")
        .update({
          status: "pending",
          run_at: resultado.quando.toISOString(),
          attempts: Math.max(0, job.attempts - 1),
          locked_by: null,
          locked_at: null,
          last_error: resultado.detalhe ?? null,
        })
        .eq("id", job.id);
      resumo.reagendados++;
      continue;
    }

    const esgotou = !resultado.recuperavel || job.attempts >= job.max_attempts;

    if (esgotou) {
      await supa
        .from("jobs")
        .update({ status: "failed", last_error: resultado.erro })
        .eq("id", job.id);

      // Trabalho que morreu vira evento de risco: o operador precisa saber que
      // uma mensagem não foi enviada, e não descobrir no fechamento do mês.
      if (job.org_id) {
        await supa.from("risk_events").insert({
          org_id: job.org_id,
          kind: "integration_error",
          severity: "attention",
          detail: `Trabalho "${job.kind}" não foi concluído: ${resultado.erro}`,
        });
      }

      resumo.esgotados++;
      continue;
    }

    await supa
      .from("jobs")
      .update({
        status: "pending",
        run_at: new Date(Date.now() + esperaAntesDeRetentar(job.attempts)).toISOString(),
        locked_by: null,
        locked_at: null,
        last_error: resultado.erro,
      })
      .eq("id", job.id);
    resumo.falhados++;
  }

  return resumo;
}

/**
 * O `switch` é exaustivo por construção: acrescentar um tipo em `PayloadDeJob`
 * sem tratá-lo aqui não compila.
 */
async function executar(job: Job): Promise<ResultadoDoJob> {
  const payload = job.payload as unknown as PayloadDeJob;

  switch (payload.kind) {
    case "send_cadence_step":
      return enviarPassoDaRegua(payload);
    case "expire_invitation":
      return expirarConvite(payload);
    case "process_webhook_event":
      return processarEventoDeWebhook(payload);
    case "send_message":
      return enviarMensagem(payload);
    case "schedule_charge":
      return agendarCobranca(payload);
    case "charge_status_poll":
      return sondarCobranca(payload);
    default: {
      const nunca: never = payload;
      return {
        estado: "falhou",
        erro: `tipo de trabalho desconhecido: ${JSON.stringify(nunca)}`,
        recuperavel: false,
      };
    }
  }
}
