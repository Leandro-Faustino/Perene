# Perene

Plataforma de migração e gestão de recorrência em **Pix Automático**.

Perene faz três coisas e apenas três:

1. Mostra ao negócio quanto ele perde hoje em taxas de cartão/boleto.
2. Migra a base recorrente para Pix Automático sem perder cliente no caminho.
3. Mantém a autorização (mandato) viva — avisa no mesmo dia quando quebra.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Clerk · Supabase (Postgres + RLS) · Tailwind v4 · shadcn/ui · Asaas (primeiro adapter) · Z-API (WhatsApp).

## Status

Em desenvolvimento — Fase 1 (MVP). Ver [PLAN.md](./PLAN.md) para o plano completo de implementação, arquitetura e fases.

## Desenvolvimento

```bash
npm install
npm run dev
```

Variáveis de ambiente necessárias estão listadas em `.env.example` (a ser criado no scaffold).
