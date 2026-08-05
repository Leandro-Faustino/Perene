-- =============================================================================
-- Permissões no schema `pulse`.
--
-- Descoberto rodando contra um Postgres real, e não aparecia de outro jeito:
-- expressão de policy roda com as permissões de QUEM CONSULTA. As policies
-- chamam `pulse.org_atual()`, e sem USAGE no schema toda leitura de todo
-- usuário logado morria com:
--
--   ERROR: 42501: permission denied for schema pulse
--   CONTEXT: SQL function "org_atual" during inlining
--
-- Ou seja: o app inteiro ficava inacessível para quem estivesse autenticado.
-- A migration 0001 cria o schema e as funções, mas criar não concede acesso.
-- =============================================================================

grant usage on schema pulse to authenticated, anon, service_role;

grant execute on all functions in schema pulse to authenticated, anon, service_role;

alter default privileges in schema pulse
  grant execute on functions to authenticated, anon, service_role;

-- search_path fixo. Função STABLE avaliada dentro de policy não pode depender
-- do search_path de quem chama — é vetor de escalonamento e é o que o linter
-- do Supabase sinaliza como `function_search_path_mutable`.
alter function pulse.clerk_org_id()      set search_path = public, pg_temp;
alter function pulse.org_atual()         set search_path = public, pg_temp;
alter function pulse.tocar_updated_at()  set search_path = public, pg_temp;
