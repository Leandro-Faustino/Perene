-- =============================================================================
-- Leitura das tarifas de referência do sistema.
--
-- Segundo achado do teste contra Postgres real, e o mais perigoso dos dois —
-- porque não dava erro.
--
-- As tarifas padrão têm `org_id is null` (migration 0003). A policy original
-- exigia `org_id = pulse.org_atual()`, então elas ficavam INVISÍVEIS para o
-- usuário logado. Resultado: `carregarDiagnostico` lia zero tarifas, o cálculo
-- caía no ramo "tarifa não informada" para todo método, e o diagnóstico
-- apresentava custo R$ 0,00 — em silêncio, sem exceção, sem log.
--
-- Num produto cuja promessa inteira é o número estar certo e ser reproduzível
-- (valor PRECISÃO, brand book §4.2), mostrar zero com ar de fato é pior do que
-- quebrar.
--
-- Leitura: padrões do sistema + os da própria organização.
-- Escrita: apenas os da própria organização — ninguém edita o padrão.
-- =============================================================================

drop policy org_isolation on public.fee_profiles;

create policy fee_profiles_leitura on public.fee_profiles
  for select
  using (org_id is null or org_id = pulse.org_atual());

create policy fee_profiles_insercao on public.fee_profiles
  for insert
  with check (org_id = pulse.org_atual());

create policy fee_profiles_atualizacao on public.fee_profiles
  for update
  using      (org_id = pulse.org_atual())
  with check (org_id = pulse.org_atual());

create policy fee_profiles_exclusao on public.fee_profiles
  for delete
  using (org_id = pulse.org_atual());
