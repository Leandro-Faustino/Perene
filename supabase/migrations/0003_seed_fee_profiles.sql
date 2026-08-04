-- =============================================================================
-- Tarifas padrão por método (RF-31).
--
-- `org_id is null` significa "padrão do sistema": é o que o diagnóstico usa
-- enquanto o operador não informa a tarifa real dele.
--
-- IMPORTANTE — estes números são faixa de mercado, não a tarifa do cliente.
-- O brand book proíbe número sem origem verificável (§4.3, valor PRECISÃO):
-- a interface do diagnóstico precisa deixar explícito que são valores de
-- referência, mostrar a memória de cálculo, e convidar o operador a corrigir.
-- Diagnóstico rodado sobre tarifa presumida e apresentado como fato é
-- exatamente o erro que mata a credibilidade da marca inteira.
--
-- Fontes: tabelas públicas de tarifa dos gateways e faixas citadas no brand
-- book §3.1 (ECONÔMICO). Revisar a cada mudança de tabela dos provedores.
-- =============================================================================

insert into public.fee_profiles (org_id, method, provider, percent_bps, fixed_cents, source, is_default)
values
  -- Cartão recorrente: 2% a 3,5% conforme bandeira e plano. Usamos o meio da
  -- faixa como padrão, e o operador ajusta.
  (null, 'card',              null, 290, 0,   'faixa de mercado 2,0%-3,5% (brand book §3.1)', true),

  -- Boleto: tarifa fixa por documento emitido/liquidado.
  (null, 'boleto',            null, 0,   349, 'faixa de mercado R$ 2,50-R$ 4,50 por boleto', true),

  -- Pix manual: tarifa por recebimento, quando o gateway cobra.
  (null, 'pix_manual',        null, 0,   99,  'faixa de mercado R$ 0,50-R$ 1,50 por Pix', true),

  -- Débito automático bancário: R$ 0,80 a R$ 2,50, mas exige convênio banco a
  -- banco — a barreira que o Pix Automático remove.
  (null, 'debito_automatico', null, 0,   165, 'faixa de mercado R$ 0,80-R$ 2,50 (exige convênio)', true),

  -- Pix Automático: a razão de existir do produto. Tarifa na casa de centavos,
  -- sem convênio.
  (null, 'pix_automatico',    null, 0,   10,  'tarifa por transação na casa de centavos (brand book §3.1)', true);
