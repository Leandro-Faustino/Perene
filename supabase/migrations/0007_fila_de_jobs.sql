-- =============================================================================
-- A fila.
--
-- `pegar_jobs` é o coração do worker e precisa ser SQL, não TypeScript: a
-- seleção e o travamento têm que acontecer numa transação só. Fazer
-- "select depois update" da aplicação abre a janela em que dois ticks pegam o
-- mesmo job — e neste produto isso significa a mesma pessoa recebendo o mesmo
-- convite duas vezes, que é o caminho para a denúncia que derruba o número.
--
-- `for update skip locked` resolve: cada worker leva um lote diferente, sem
-- espera e sem sobreposição, mesmo com vários ticks concorrentes.
-- =============================================================================

create or replace function pulse.pegar_jobs(p_lote integer, p_worker text)
returns setof public.jobs
language sql
volatile
security definer
set search_path = public, pg_temp
as $$
  with proximos as (
    select id
      from public.jobs
     where status = 'pending'
       and run_at <= now()
     order by run_at
     limit p_lote
     for update skip locked
  )
  update public.jobs j
     set status    = 'running',
         locked_by = p_worker,
         locked_at = now(),
         attempts  = j.attempts + 1
    from proximos
   where j.id = proximos.id
  returning j.*;
$$;

-- Só o service_role executa: a fila é interna e nenhum usuário a enxerga.
revoke all on function pulse.pegar_jobs(integer, text) from public, anon, authenticated;
grant execute on function pulse.pegar_jobs(integer, text) to service_role;

-- =============================================================================
-- Encerra a régua de um convite.
--
-- Chamada quando a autorização entra. Precisa ser uma operação só: se ficasse
-- na aplicação como "buscar jobs, marcar um a um", um webhook que chega no meio
-- do tick deixaria passar exatamente o lembrete que não deveria sair.
-- =============================================================================
create or replace function pulse.cancelar_regua(p_invitation_id uuid)
returns integer
language sql
volatile
security definer
set search_path = public, pg_temp
as $$
  with cancelados as (
    update public.jobs
       set status = 'done',
           last_error = 'régua encerrada: autorização concedida'
     where status = 'pending'
       and kind = 'send_cadence_step'
       and payload->>'invitationId' = p_invitation_id::text
    returning 1
  )
  select coalesce(count(*), 0)::integer from cancelados;
$$;

revoke all on function pulse.cancelar_regua(uuid) from public, anon, authenticated;
grant execute on function pulse.cancelar_regua(uuid) to service_role;

-- Índice para o `payload->>'invitationId'` usado acima.
create index if not exists jobs_por_convite
  on public.jobs ((payload->>'invitationId'))
  where kind = 'send_cadence_step';
