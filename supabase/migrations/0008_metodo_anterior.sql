-- =============================================================================
-- De onde o contrato veio.
--
-- O medidor de migração mostra a economia do mês, e economia é uma diferença:
-- o que custava antes menos o que custa agora. Só que ao migrar, o
-- `current_method` vira 'pix_automatico' e a informação do método anterior se
-- perde — restaria calcular a economia contra uma média, ou contra nada.
--
-- O brand book não deixa: todo número precisa ser reproduzível pelo cliente
-- (§4.2, valor PRECISÃO). "Economia estimada" num medidor persistente é
-- exatamente o tipo de número que o operador confere uma vez, não bate, e
-- nunca mais confia.
--
-- Uma coluna resolve. Preenchida no momento da migração, pelo handler do
-- webhook.
-- =============================================================================

alter table public.contracts
  add column if not exists previous_method text;

comment on column public.contracts.previous_method is
  'Método de cobrança anterior à migração. Preenchido quando migrated_at é definido; é a base do cálculo de economia do medidor.';

-- Contratos já migrados antes desta migration não têm de onde tirar o método
-- anterior. Ficam nulos e o medidor os conta como migrados sem contabilizar
-- economia — subestimar declaradamente é melhor do que inventar.
