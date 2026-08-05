-- =============================================================================
-- Leitura pública do convite, por token.
--
-- A página do pagador (`/autorizar/{token}`) não tem sessão: o pagador não faz
-- login, e não deve fazer — é uma tela e um botão (§3.6). Isso cria um
-- problema, porque RLS depende do token da sessão e não há nenhum.
--
-- A saída óbvia seria usar a service_role no servidor. Recusada: essa chave
-- ignora RLS em TODAS as tabelas, e passaria a ser carregada por uma rota
-- pública, que é a superfície mais exposta do sistema. Um bug ali deixaria de
-- ser "mostrou o convite errado" e viraria "leu a base inteira de todo mundo".
--
-- Em vez disso, uma função SECURITY DEFINER que faz uma coisa só: dado um
-- token exato, devolver os campos que aquela tela precisa. Sem listagem, sem
-- filtro parcial, sem como enumerar. O token tem 256 bits de entropia, então
-- adivinhar não é rota.
--
-- Repare no que ela NÃO devolve: e-mail, CPF, telefone, id interno da
-- organização. A tela mostra nome, valor, periodicidade e teto — é o que o
-- pagador precisa conferir antes de autorizar, e nada além.
-- =============================================================================

create or replace function pulse.convite_por_token(p_token text)
returns table (
  invitation_id     uuid,
  status            text,
  expires_at        timestamptz,
  mandate_id        uuid,
  mandate_status    text,
  payer_name        text,
  contract_amount_cents integer,
  contract_frequency    text,
  contract_due_day      smallint,
  contract_description  text,
  ceiling_cents     integer,
  org_name          text,
  org_logo_url      text,
  org_brand_color   text,
  org_payer_label   text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    i.id,
    i.status,
    i.expires_at,
    m.id,
    m.status,
    p.name,
    c.amount_cents,
    c.frequency,
    c.due_day,
    c.description,
    m.ceiling_cents,
    o.name,
    o.logo_url,
    o.brand_color,
    o.payer_label
  from public.invitations i
  join public.contracts     c on c.id = i.contract_id
  join public.payers        p on p.id = c.payer_id
  join public.organizations o on o.id = i.org_id
  left join public.mandates m on m.id = i.mandate_id
  where i.token = p_token
  limit 1;
$$;

-- `anon` é o papel de quem chega sem sessão — o pagador.
grant execute on function pulse.convite_por_token(text) to anon, authenticated;

-- =============================================================================
-- Marca o convite como aberto.
--
-- Serve à linha do tempo do contrato: o operador precisa saber a diferença
-- entre "não recebeu" e "recebeu, abriu e não autorizou". São dois problemas
-- diferentes, com duas ações diferentes.
--
-- Só avança de `pending` para `opened`. Nunca retrocede um convite já
-- autorizado nem ressuscita um expirado.
-- =============================================================================
create or replace function pulse.marcar_convite_aberto(p_token text)
returns void
language sql
volatile
security definer
set search_path = public, pg_temp
as $$
  update public.invitations
     set status = 'opened',
         opened_at = coalesce(opened_at, now())
   where token = p_token
     and status = 'pending'
     and expires_at > now();
$$;

grant execute on function pulse.marcar_convite_aberto(text) to anon, authenticated;
