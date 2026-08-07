-- Fase 3B: templates por nicho.
--
-- O nicho é o único ponto de adaptação de vocabulário por segmento de mercado.
-- Ele não cria novas tabelas nem novos fluxos — só informa qual pack de
-- templates pré-escrito usar como fallback quando a org não customizou o texto.
--
-- Hierarquia de resolução do corpo da mensagem:
--   1. Template custom da org no banco (message_templates)
--   2. Pack do nicho (nichos.ts — texto genuinamente adaptado ao segmento)
--   3. Template genérico hard-coded (templates.ts — fallback universal)
--
-- O nicho também determina payer_label e service_label, que a camada de
-- resolução lê de nichos.ts — não precisam ficar no banco separadamente.

alter table public.organizations
  add column if not exists nicho text
    check (nicho in (
      'academia',
      'clinica',
      'condominio',
      'escola',
      'clube',
      'outro'
    ));

comment on column public.organizations.nicho is
  'Segmento de mercado. Determina o pack de templates padrão (Fase 3B). '
  'Null = sem nicho selecionado, usa templates genéricos.';
