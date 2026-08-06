-- =============================================================================
-- Método de pagamento original do contrato (antes da migração para Pix Automático).
--
-- Quando o pagador autoriza o mandato, o handler de webhook sobrescreve
-- `current_method` com 'pix_automatico'. Sem guardar o que havia antes, não
-- é possível calcular a economia real (custo_antes - custo_depois), e o Medidor
-- de Migração ficaria zerado para sempre.
--
-- A coluna é nullable porque:
--   - contratos antigos já migrados não têm como recuperar o método original
--     (seria inventar um número, violando o valor PRECISÃO — §4.2)
--   - contratos que nunca migraram não precisam do campo
--
-- Para contratos com original_method NULL no cálculo de economia: a Pulse
-- declara que não sabe e contribui R$ 0 para o total — subestimação honesta
-- é sempre preferível a estimativa inventada.
-- =============================================================================

alter table public.contracts
  add column if not exists original_method text
    check (original_method in (
      'card', 'boleto', 'pix_manual', 'debito_automatico', 'pix_automatico', 'other'
    ));
