-- =============================================================================
-- Pulse — schema inicial
--
-- Convenções:
-- - Dinheiro SEMPRE em centavos, como inteiro. Ponto flutuante em valor
--   financeiro é erro de arredondamento esperando acontecer, e o produto existe
--   para dar credibilidade a número (valor PRECISÃO, brand book §4.2).
-- - Identificadores em inglês; rótulos de interface em português. A fronteira
--   é o adapter: do lado de dentro, jargão; do lado de fora, português (§4.3).
-- - `org_id` referencia `organizations.id` (uuid interno), não o id do Clerk.
-- =============================================================================

create extension if not exists "pgcrypto";

create schema if not exists pulse;

-- -----------------------------------------------------------------------------
-- Identidade da organização na sessão
--
-- Um único lugar decide de onde sai o id da organização no token. Se o formato
-- do claim mudar (integração nativa Clerk↔Supabase vs. JWT template legado),
-- muda aqui e nada mais.
-- -----------------------------------------------------------------------------
create or replace function pulse.clerk_org_id()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'o' ->> 'id',   -- token de sessão Clerk (integração de terceiros)
    auth.jwt() ->> 'org_id'       -- JWT template legado
  );
$$;

create or replace function pulse.org_atual()
returns uuid
language sql
stable
as $$
  select id from public.organizations
  where clerk_org_id = pulse.clerk_org_id();
$$;

-- =============================================================================
-- 1. organizations — o cliente pagante do SaaS. Unidade de isolamento.
-- =============================================================================
create table public.organizations (
  id                uuid primary key default gen_random_uuid(),
  clerk_org_id      text not null unique,
  name              text not null,
  -- Rótulo do pagador por nicho ("aluno", "paciente", "morador", "assinante").
  -- É o ÚNICO ponto de adaptação de nicho no sistema: nada de schema por
  -- vertical (§4.1).
  payer_label       text not null default 'pagador',
  -- Marca da organização na página de autorização (RF-05). A Pulse assina
  -- discreta no rodapé; quem aparece ali é o cliente (§3.4, valor DISCRIÇÃO).
  logo_url          text,
  brand_color       text,
  timezone          text not null default 'America/Sao_Paulo',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- =============================================================================
-- 2. gateway_connections — credenciais do gateway, cifradas
-- =============================================================================
create table public.gateway_connections (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  provider           text not null,
  environment        text not null default 'sandbox'
                       check (environment in ('sandbox', 'production')),
  -- AES-256-GCM; o selo de autenticação vai concatenado ao fim do texto
  -- cifrado. A chave mestra vive em APP_ENCRYPTION_KEY, fora do banco.
  api_key_encrypted  text not null,
  api_key_iv         text not null,
  webhook_secret     text,
  is_primary         boolean not null default false,
  status             text not null default 'pending'
                       check (status in ('pending', 'connected', 'error')),
  last_checked_at    timestamptz,
  last_error         text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index gateway_connections_primaria_por_org
  on public.gateway_connections (org_id) where is_primary;

-- =============================================================================
-- 3. fee_profiles — tarifas por método, parametrizáveis (RF-31)
--
-- Precisam ser visíveis e editáveis pelo operador: se ele não consegue refazer
-- a conta do diagnóstico, o número não vale (valor PRECISÃO).
-- =============================================================================
create table public.fee_profiles (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid references public.organizations(id) on delete cascade,
  method            text not null
                      check (method in ('card', 'boleto', 'pix_manual',
                                        'debito_automatico', 'pix_automatico')),
  provider          text,
  percent_bps       integer not null default 0,   -- pontos-base: 300 = 3,00%
  fixed_cents       integer not null default 0,
  source            text,                         -- de onde veio a tarifa
  is_default        boolean not null default false,
  created_at        timestamptz not null default now()
);

-- =============================================================================
-- 4. payers — a pessoa física que paga
-- =============================================================================
create table public.payers (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  external_id       text,
  name              text not null,
  email             text,
  phone_e164        text,
  tax_id            text,                          -- CPF, só dígitos
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- =============================================================================
-- 5. consents — registro de opt-in (LGPD + regras da Meta)
--
-- NÃO está no PLAN.md. Entra aqui porque o brand book trata opt-in registrado
-- como valor fundamental e como argumento de venda (§4.2 CONFORMIDADE,
-- Insight 6), e porque consentimento não retroage: sem esta tabela desde a
-- primeira migration, a alternativa é reimportar a base inteira.
--
-- Disparo em massa sem opt-in registrado é descrito em §3.1 como risco
-- existencial da operação — bloqueio de número é irreversível na prática.
-- =============================================================================
create table public.consents (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  payer_id          uuid not null references public.payers(id) on delete cascade,
  channel           text not null check (channel in ('whatsapp', 'email', 'sms')),
  granted           boolean not null,
  -- De onde veio o consentimento: 'import_csv', 'gateway_sync', 'formulario',
  -- 'contrato_assinado'. Sem origem, o registro não serve de prova.
  source            text not null,
  legal_basis       text not null default 'legitimo_interesse',
  granted_at        timestamptz not null default now(),
  revoked_at        timestamptz,
  created_at        timestamptz not null default now()
);

create index consents_por_pagador on public.consents (org_id, payer_id, channel);

-- =============================================================================
-- 6. contracts — pagador + valor + periodicidade + dia de vencimento
-- =============================================================================
create table public.contracts (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  payer_id           uuid not null references public.payers(id) on delete cascade,
  external_id        text,
  description        text,
  amount_cents       integer not null check (amount_cents > 0),
  frequency          text not null default 'monthly'
                       check (frequency in ('weekly', 'monthly', 'quarterly',
                                            'semiannual', 'annual')),
  due_day            smallint check (due_day between 1 and 31),
  current_method     text not null
                       check (current_method in ('card', 'boleto', 'pix_manual',
                                                 'debito_automatico',
                                                 'pix_automatico', 'other')),
  status             text not null default 'active'
                       check (status in ('active', 'paused', 'cancelled')),
  migrated_at        timestamptz,
  failure_count_12m  integer not null default 0,
  tags               text[] not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- =============================================================================
-- 7. mandates — a autorização do pagador no app do banco
-- =============================================================================
create table public.mandates (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid not null references public.organizations(id) on delete cascade,
  contract_id          uuid not null references public.contracts(id) on delete cascade,
  provider             text not null,
  external_mandate_id  text,
  status               text not null default 'pending'
                         check (status in ('pending', 'authorized', 'rejected',
                                           'cancelled', 'expired')),
  -- Valor-teto: o que o pagador autorizou como máximo. Reajuste que estoura o
  -- teto exige reautorização (RF-66), e o teto é informação de consentimento —
  -- nunca exibido em texto fraco (§5.3).
  ceiling_cents        integer,
  authorized_at        timestamptz,
  cancelled_at         timestamptz,
  expires_at           timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create unique index mandates_externo_por_provider
  on public.mandates (provider, external_mandate_id)
  where external_mandate_id is not null;

-- =============================================================================
-- 8. waves — "Ondas": lote de contratos convidados a migrar
-- =============================================================================
create table public.waves (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  name               text not null,
  status             text not null default 'draft'
                       check (status in ('draft', 'running', 'paused', 'done')),
  -- Filtro de segmentação (método, faixa de valor, histórico de falhas, tags).
  segment            jsonb not null default '{}'::jsonb,
  -- Régua D0/D+2/D+5/D+10, configurável.
  cadence            jsonb not null default '[]'::jsonb,
  -- Limite diário de convites: existe para a onda não parecer spam (RF-42) e
  -- para não queimar o número do WhatsApp.
  daily_limit        integer not null default 100 check (daily_limit > 0),
  started_at         timestamptz,
  finished_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- =============================================================================
-- 9. invitations — um convite dirigido a um contrato, com link único
-- =============================================================================
create table public.invitations (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  wave_id            uuid references public.waves(id) on delete set null,
  contract_id        uuid not null references public.contracts(id) on delete cascade,
  mandate_id         uuid references public.mandates(id) on delete set null,
  -- Token opaco na URL pública. Não deriva de nada adivinhável.
  token              text not null unique,
  status             text not null default 'pending'
                       check (status in ('pending', 'opened', 'authorized',
                                         'declined', 'expired')),
  attempt_n          smallint not null default 1,
  opened_at          timestamptz,
  expires_at         timestamptz not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- =============================================================================
-- 10. charges — tentativa de débito de um ciclo
-- =============================================================================
create table public.charges (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.organizations(id) on delete cascade,
  contract_id         uuid not null references public.contracts(id) on delete cascade,
  mandate_id          uuid references public.mandates(id) on delete set null,
  provider            text not null,
  external_charge_id  text,
  cycle_ref           text not null,               -- 'AAAA-MM' do ciclo
  amount_cents        integer not null check (amount_cents > 0),
  due_date            date not null,
  status              text not null default 'scheduled'
                        check (status in ('scheduled', 'succeeded', 'failed',
                                          'retrying', 'cancelled')),
  failure_reason      text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index charges_externo_por_provider
  on public.charges (provider, external_charge_id)
  where external_charge_id is not null;

create unique index charges_um_por_ciclo
  on public.charges (contract_id, cycle_ref)
  where status <> 'cancelled';

-- =============================================================================
-- 11. message_templates — o que se manda, com o texto aprovado
-- =============================================================================
create table public.message_templates (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid references public.organizations(id) on delete cascade,
  key                text not null,
  channel            text not null check (channel in ('whatsapp', 'email', 'sms')),
  -- Categoria da Meta. 'utility' é a rota correta para aviso de cobrança e a
  -- única que sobrevive a uma denúncia (§3.1 LEGAL).
  meta_category      text check (meta_category in ('utility', 'marketing', 'authentication')),
  meta_template_name text,
  meta_status        text default 'nao_enviado'
                       check (meta_status in ('nao_enviado', 'em_analise',
                                              'aprovado', 'rejeitado')),
  body               text not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- =============================================================================
-- 12. messages — histórico do que foi enviado
-- =============================================================================
create table public.messages (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  payer_id           uuid references public.payers(id) on delete set null,
  invitation_id      uuid references public.invitations(id) on delete set null,
  charge_id          uuid references public.charges(id) on delete set null,
  template_key       text,
  channel            text not null check (channel in ('whatsapp', 'email', 'sms')),
  to_address         text not null,
  body               text not null,
  status             text not null default 'queued'
                       check (status in ('queued', 'sent', 'delivered',
                                         'read', 'failed')),
  provider_message_id text,
  error              text,
  sent_at            timestamptz,
  created_at         timestamptz not null default now()
);

-- =============================================================================
-- 13. risk_events — a fila "Precisa de atenção"
--
-- O nome da tabela é técnico; o rótulo na interface é "Precisa de atenção",
-- nunca "pendências" nem "alertas críticos" (§4.3).
-- =============================================================================
create table public.risk_events (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  contract_id        uuid references public.contracts(id) on delete cascade,
  mandate_id         uuid references public.mandates(id) on delete set null,
  charge_id          uuid references public.charges(id) on delete set null,
  kind               text not null
                       check (kind in ('mandate_cancelled', 'mandate_expired',
                                       'charge_failed_repeated', 'ceiling_exceeded',
                                       'integration_error')),
  severity           text not null default 'attention'
                       check (severity in ('attention', 'critical')),
  detail             text,
  resolved_at        timestamptz,
  notified_at        timestamptz,
  created_at         timestamptz not null default now()
);

create index risk_events_abertos on public.risk_events (org_id, created_at desc)
  where resolved_at is null;

-- =============================================================================
-- 14. webhook_events — entrada crua do gateway, deduplicada
-- =============================================================================
create table public.webhook_events (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid references public.organizations(id) on delete cascade,
  provider           text not null,
  external_event_id  text not null,
  event_type         text,
  raw                jsonb not null,
  processed_at       timestamptz,
  error              text,
  created_at         timestamptz not null default now()
);

-- A dedupe é aqui: reenviar o mesmo webhook 3x grava uma linha só. O handler
-- trata o código 23505 como "já vi este evento" e devolve 200.
create unique index webhook_events_unicos
  on public.webhook_events (provider, external_event_id);

-- =============================================================================
-- 15. jobs — a fila
-- =============================================================================
create table public.jobs (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid references public.organizations(id) on delete cascade,
  kind               text not null,
  payload            jsonb not null default '{}'::jsonb,
  run_at             timestamptz not null default now(),
  status             text not null default 'pending'
                       check (status in ('pending', 'running', 'done', 'failed')),
  attempts           smallint not null default 0,
  max_attempts       smallint not null default 5,
  idempotency_key    text unique,
  locked_by          text,
  locked_at          timestamptz,
  last_error         text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- =============================================================================
-- RLS
--
-- Três tabelas ficam FORA do alcance do usuário e só o service-role acessa:
-- `gateway_connections` (guarda credencial cifrada), `webhook_events` (entrada
-- não confiável) e `jobs` (fila interna). Elas têm RLS ligado e nenhuma policy
-- permissiva — o que nega tudo por padrão.
-- =============================================================================

alter table public.organizations       enable row level security;
alter table public.gateway_connections enable row level security;
alter table public.fee_profiles        enable row level security;
alter table public.payers              enable row level security;
alter table public.consents            enable row level security;
alter table public.contracts           enable row level security;
alter table public.mandates            enable row level security;
alter table public.waves               enable row level security;
alter table public.invitations         enable row level security;
alter table public.charges             enable row level security;
alter table public.message_templates   enable row level security;
alter table public.messages            enable row level security;
alter table public.risk_events         enable row level security;
alter table public.webhook_events      enable row level security;
alter table public.jobs                enable row level security;

create policy org_isolation on public.organizations
  using      (clerk_org_id = pulse.clerk_org_id())
  with check (clerk_org_id = pulse.clerk_org_id());

do $$
declare
  t text;
begin
  foreach t in array array[
    'fee_profiles', 'payers', 'consents', 'contracts', 'mandates', 'waves',
    'invitations', 'charges', 'message_templates', 'messages', 'risk_events'
  ]
  loop
    execute format(
      'create policy org_isolation on public.%I
         using      (org_id = pulse.org_atual())
         with check (org_id = pulse.org_atual())', t);
  end loop;
end $$;

-- =============================================================================
-- updated_at
-- =============================================================================
create or replace function pulse.tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations', 'gateway_connections', 'payers', 'contracts', 'mandates',
    'waves', 'invitations', 'charges', 'message_templates', 'jobs'
  ]
  loop
    execute format(
      'create trigger %I_updated_at before update on public.%I
         for each row execute function pulse.tocar_updated_at()', t, t);
  end loop;
end $$;
