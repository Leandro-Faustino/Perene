-- =============================================================================
-- Telefone/e-mail de notificação por organização.
--
-- O operador pode informar um WhatsApp para receber alertas críticos e o
-- resumo diário. Separado de `payer_label` e outros campos de identidade
-- porque muda com frequência diferente — e porque algumas orgs vão querer
-- um número de operação distinto do número de atendimento.
-- =============================================================================

alter table public.organizations
  add column if not exists notification_phone text,
  add column if not exists notification_email text;
