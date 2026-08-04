-- =============================================================================
-- Índices críticos.
--
-- Os três primeiros grupos existem para o desempenho do diagnóstico e do
-- medidor de migração: o brand book trata "o número aparece" como Momento da
-- Verdade nº 1 (§3.6) — se demora, não há segunda chance.
--
-- O grupo de `jobs` existe para o worker: o CTE com SKIP LOCKED roda a cada
-- minuto e não pode fazer seq scan numa tabela que só cresce.
-- =============================================================================

-- Diagnóstico e medidor
create index contracts_por_org_status   on public.contracts (org_id, status);
create index contracts_por_metodo       on public.contracts (org_id, current_method, status);
create index contracts_migrados         on public.contracts (org_id) where migrated_at is not null;
create index mandates_por_org_status    on public.mandates (org_id, status);
create index charges_por_org_status     on public.charges (org_id, status);
create index charges_por_vencimento     on public.charges (due_date, status);
create index charges_falhas_por_org     on public.charges (org_id, created_at desc) where status = 'failed';

-- Worker: a consulta é `status='pending' and run_at <= now() order by run_at`
create index jobs_prontos               on public.jobs (status, run_at);
create index jobs_por_org_status        on public.jobs (org_id, status);

-- Régua e expiração de convite
create index invitations_por_expiracao  on public.invitations (status, expires_at);
create index invitations_por_onda       on public.invitations (wave_id, status);

-- Dedupe de pagador na importação (CPF e celular são as chaves reais de
-- deduplicação; e-mail repete em família)
create index payers_por_telefone        on public.payers (org_id, phone_e164);
create index payers_por_cpf             on public.payers (org_id, tax_id);
create index payers_por_externo         on public.payers (org_id, external_id);

-- Histórico de mensagem por pagador
create index messages_por_pagador       on public.messages (org_id, payer_id, created_at desc);

-- Webhook ainda não processado
create index webhook_events_pendentes   on public.webhook_events (provider, created_at)
  where processed_at is null;
