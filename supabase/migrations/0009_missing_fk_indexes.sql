-- =============================================================================
-- Índices ausentes em FKs.
--
-- O Postgres não cria índice automaticamente em colunas de FK — só na PK
-- referenciada. Sem estes índices, qualquer JOIN ou DELETE em cascata que
-- parta da tabela-pai faz seq scan na tabela-filha.
--
-- Os índices abaixo foram identificados pelo advisor do Supabase.
-- =============================================================================

-- charges
create index if not exists charges_por_mandate
  on public.charges (mandate_id);

-- consents
create index if not exists consents_por_payer
  on public.consents (payer_id);

-- contracts
create index if not exists contracts_por_payer
  on public.contracts (payer_id);

-- fee_profiles
create index if not exists fee_profiles_por_org
  on public.fee_profiles (org_id);

-- invitations
create index if not exists invitations_por_org
  on public.invitations (org_id);

create index if not exists invitations_por_contract
  on public.invitations (contract_id);

create index if not exists invitations_por_mandate
  on public.invitations (mandate_id);

-- mandates
create index if not exists mandates_por_contract
  on public.mandates (contract_id);

-- message_templates
create index if not exists message_templates_por_org
  on public.message_templates (org_id);

-- messages
create index if not exists messages_por_payer
  on public.messages (payer_id);

create index if not exists messages_por_invitation
  on public.messages (invitation_id);

create index if not exists messages_por_charge
  on public.messages (charge_id);

-- risk_events
create index if not exists risk_events_por_contract
  on public.risk_events (contract_id);

create index if not exists risk_events_por_mandate
  on public.risk_events (mandate_id);

create index if not exists risk_events_por_charge
  on public.risk_events (charge_id);

-- waves
create index if not exists waves_por_org
  on public.waves (org_id);

-- webhook_events
create index if not exists webhook_events_por_org
  on public.webhook_events (org_id);
