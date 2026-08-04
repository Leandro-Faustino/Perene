# Pulse

Plataforma de migração e gestão de recorrência em **Pix Automático**.

> O repositório ainda se chama `Perene`, que era o nome de trabalho. O produto
> se chama **Pulse** desde 04/08/2026.

Pulse faz três coisas e apenas três:

1. Mostra ao negócio quanto ele perde hoje em taxas de cartão/boleto.
2. Migra a base recorrente para Pix Automático sem perder cliente no caminho.
3. Mantém a autorização (mandato) viva — avisa no mesmo dia quando quebra.

Toda funcionalidade candidata passa pelo filtro: *isso ajuda a migrar ou a
manter a autorização viva?* Se não, fica fora.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Clerk · Supabase (Postgres +
RLS) · Tailwind v4 · Archivo/Inter/JetBrains Mono · Asaas (primeiro adapter) ·
Z-API (WhatsApp).

## Status

Em desenvolvimento — Fase 1 (MVP). O scaffold e a fundação de marca estão de pé;
o adapter de gateway, o diagnóstico e as ondas ainda não.

Ver [PLAN.md](./PLAN.md) para o plano completo, incluindo a tabela de **desvios
confirmados** entre o plano original e o que a stack instalada realmente exige.

## Marca

O brand book está em [docs/BRAND_BOOK.md](./docs/BRAND_BOOK.md); o mapa da
biblioteca de ativos, em [docs/brand/](./docs/brand/).

Os tokens de cor vivem em
[`src/styles/pulse-tokens.css`](./src/styles/pulse-tokens.css) e são a **fonte
única de verdade**: nenhum hexadecimal solto em componente, template de e-mail
ou template de post.

O confronto entre marca e plano — conflitos, lacunas da Fase 1 e ordem de
decisão — está em [docs/ANALISE-MARCA-PLANO.md](./docs/ANALISE-MARCA-PLANO.md).

**Pendente:** verificação de domínio e busca no INPI para "Pulse" (classes 36 e
42). Bloqueia registro, domínio e handles — não bloqueia o desenvolvimento.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # e preencher
npm run dev
```

```bash
npm run build       # produção
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

### Banco

As migrations estão em `supabase/migrations/`, na ordem. O isolamento
multi-tenant é RLS puro: toda policy usa `pulse.org_atual()`, que resolve a
organização a partir do token da sessão Clerk. Nenhuma consulta de página
consegue ver dado de outra organização, mesmo esquecendo o filtro.
