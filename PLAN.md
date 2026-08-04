# Pulse — Plano de implementação

> **Nome:** o produto se chama **Pulse** (decisão de 04/08/2026). "Perene" era
> nome de trabalho e sobrevive apenas no nome do repositório. Ver
> [`docs/BRAND_BOOK.md`](./docs/BRAND_BOOK.md) §3.4.

---

## Desvios confirmados durante a implementação

Escritos aqui, e não corrigidos silenciosamente no corpo do plano, porque cada
um foi verificado contra a versão realmente instalada — e porque o plano ainda
descreve a rota antiga em alguns pontos.

| Plano dizia | Realidade | Motivo |
|---|---|---|
| `src/middleware.ts` com `clerkMiddleware` | **`src/proxy.ts`, exportando `proxy`** | Next.js 16 renomeou a convenção. Mesma responsabilidade, arquivo e nome de função novos. Verificado em `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`. |
| JWT template no Clerk assinado com o segredo do Supabase | **`accessToken` no cliente Supabase** | `@supabase/supabase-js` 2.112 expõe `accessToken?: () => Promise<string \| null>` para auth de terceiros. Sem segredo compartilhado entre os dois sistemas e sem template para configurar. |
| RLS lê `auth.jwt()->>'org_id'` | **`pulse.clerk_org_id()`**, que aceita `o.id` (token de sessão) e `org_id` (template legado) | O formato do claim depende de qual integração está ativa. Centralizar numa função deixa a troca em uma linha de migration em vez de uma varredura por todas as policies. |
| `npx shadcn init` com `new-york` + `neutral` | **`components.json` escrito à mão; primitivos próprios** | O CLI atual não tem mais essas flags e o `init` sobrescreve `globals.css` — o que instalaria uma segunda paleta ao lado dos tokens da marca. `shadcn add` continua funcionando para componentes específicos. |
| Fonte Geist | **Archivo · Inter · JetBrains Mono** | Brand book §5.3. Inter tem algarismos tabulares nativos, requisito para todo valor monetário. |
| Rota `/migracao` | **`/ondas`** | O módulo se chama "Ondas" na arquitetura de marca (§3.4) e a URL é superfície. |
| 13 tabelas | **15** | Entraram `consents` (opt-in com timestamp e origem — §4.2, valor CONFORMIDADE) e `message_templates` (rastreio do status de aprovação Meta). |
| Cron diário às 05h | **`0 8 * * *`** | Cron da Vercel roda em UTC; 05h em `America/Sao_Paulo` é 08h UTC. |

Continuam **em aberto** e valem como estavam: modelo de cobrança sobre economia
e timing da aprovação Meta.

### Questão nº 4 — jornada de autorização do Asaas

**Parcialmente resolvida, e o resultado contraria um pressuposto do produto.**

O fluxo do Pix Automático no Asaas **não é "clicar em autorizar e pronto"**:

1. `POST /pixAutomaticRecurringAuthorizations` cria a autorização e devolve um
   **QR Code imediato**;
2. o pagador **paga a primeira cobrança** por esse QR — é esse pagamento que
   registra o consentimento;
3. a autorização só fica **ativa depois que esse primeiro pagamento liquida**;
4. daí em diante, a aplicação continua responsável por criar cada nova
   instrução de cobrança — não é débito que acontece sozinho.

Sequência de webhook observada na documentação:
`PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CREATED` → `PAYMENT_CREATED` →
`PAYMENT_RECEIVED` → `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED`.

**O que isso muda:**

- A página do pagador não pode dizer só "Autorize no seu banco". Há um
  **pagamento agora**, e o valor precisa estar visível antes do QR — o brand
  book proíbe esconder movimento de dinheiro de quem vai autorizá-lo.
- `mandates.status = 'pending'` passa a significar "criada, aguardando o
  primeiro pagamento liquidar", e não "convite enviado". O mapeamento está em
  `mappers.ts` e coberto por teste.
- O Momento da Verdade nº 2 ("o primeiro pagador autoriza") acontece na
  liquidação, não no clique. É prova melhor, porém mais lenta — a régua da onda
  precisa contar com isso.

**Confiança:** derivado da documentação pública do Asaas via busca; o acesso
direto a `docs.asaas.com` retorna 403 para ferramenta automatizada. Os nomes de
campo do corpo da requisição (`maximumValue`, `frequency`) são a parte menos
confirmada. **Confirmar contra conta sandbox antes de a página do pagador ir ao
ar** — é a primeira coisa a fazer na Semana 4.

---

## Contexto

Pulse é um SaaS multi-tenant que faz **três coisas e apenas três**:
1. Mostra ao negócio quanto ele perde hoje em taxas de cartão/boleto (diagnóstico).
2. Migra a base recorrente para **Pix Automático** sem perder cliente no caminho.
3. Mantém a autorização (mandato) viva — avisa no mesmo dia quando quebra.

O produto **não é gateway, não é ERP, não é CRM, não é emissor fiscal**. Toda funcionalidade candidata passa pelo filtro: *"isso ajuda a migrar ou a manter a autorização viva?"* — se não, fica fora.

O domínio é agnóstico de nicho: fala sempre em **Organização** e **Pagador** (rótulo configurável por org: "aluno", "paciente", "morador", "assinante").

Este plano cobre a **Fase 1 (MVP vendável)** com estrutura pronta para as Fases 2 e 3.

---

## Decisões arquiteturais (confirmadas)

| Área | Escolha |
|---|---|
| Multi-tenancy | **Supabase RLS puro** com JWT do Clerk. Políticas leem `auth.jwt()->>'org_id'`. Sem Prisma. |
| Fila de jobs | Tabela `jobs` no Postgres + **Vercel Cron** a cada 1 min. Suficiente para o MVP. |
| Scaffold | **Projeto novo** em `/home/leandro/projetos/Next/Pulse`. Copia `middleware.ts`, `layout.tsx`, `components.json`, `user-service.ts` do `replyin` como referência. |
| WhatsApp | Interface `MessagingProvider` + **Z-API** como primeira impl. Meta Cloud fica para Fase 3. |
| Gateway | Interface `GatewayAdapter` + **Asaas** como primeira impl. Segundo adapter valida a interface na Fase 3. |
| Idioma | UI e mensagens em **português**; identificadores no código em **inglês**. |
| Stack | Next.js 16 (App Router) · React 19 · Clerk · Supabase · Tailwind v4 · shadcn/ui (new-york, neutral) · Geist · next-themes · sonner · Vitest · ESLint v9 · TypeScript strict · npm |

---

## Estrutura de pastas

```
Perene/
├── components.json                      # shadcn (copiado do replyin)
├── vercel.json                          # cron * * * * * → /api/cron/tick
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql                # 13 tabelas + jobs + RLS
│       ├── 0002_indexes.sql
│       └── 0003_seed_fee_profiles.sql
└── src/
    ├── middleware.ts                    # clerkMiddleware + rotas públicas
    ├── app/
    │   ├── layout.tsx                   # ClerkProvider ptBR + Geist + Theme + Toaster
    │   ├── (marketing)/                 # landing pública
    │   ├── (auth)/entrar, cadastrar     # Clerk SignIn/SignUp
    │   ├── (onboarding)/
    │   │   ├── organizacao              # cria Clerk org + row em organizations
    │   │   ├── conectar-gateway         # cola API key Asaas + testConnection
    │   │   └── importar-base            # CSV ou sync do gateway
    │   ├── (app)/                       # painel autenticado (AppSidebar + SiteHeader)
    │   │   ├── dashboard                # diagnóstico + medidor de migração
    │   │   ├── pagadores, pagadores/[id]
    │   │   ├── migracao, migracao/nova, migracao/[waveId]
    │   │   ├── atencao                  # (Fase 2) fila de risco
    │   │   ├── mensagens                # templates + histórico
    │   │   ├── configuracoes/{organizacao,gateway,whatsapp,membros}
    │   │   └── acoes.ts                 # Server Actions
    │   ├── autorizar/[token]/           # PÚBLICO — página do pagador
    │   │   ├── page.tsx
    │   │   ├── acoes.ts                 # startAuthorization
    │   │   └── status/route.ts          # polling de status
    │   └── api/
    │       ├── webhooks/[provider]/route.ts
    │       ├── webhooks/clerk/route.ts
    │       ├── webhooks/zapi/route.ts
    │       ├── cron/tick/route.ts       # worker (1 min)
    │       ├── cron/daily/route.ts      # jobs pesados (05h)
    │       └── health/route.ts
    ├── components/
    │   ├── ui/                          # shadcn
    │   ├── app-sidebar.tsx, site-header.tsx, nav-main.tsx, nav-user.tsx
    │   ├── theme-provider.tsx, theme-toggle.tsx
    │   ├── onboarding/, pagadores/, migracao/, autorizar/
    │   └── shared/
    ├── hooks/                           # use-org, use-mobile
    ├── lib/
    │   ├── utils.ts, logger.ts, crypto.ts   # AES-GCM p/ credenciais
    │   ├── clerk/user-service.ts            # getCurrentUser + getCurrentOrgId
    │   ├── supabase/
    │   │   ├── server.ts                    # RSC/Action — Clerk token no header
    │   │   ├── client.ts                    # browser — Clerk token no fetch
    │   │   └── admin.ts                     # service-role (webhooks/jobs)
    │   ├── gateways/
    │   │   ├── types.ts                     # GatewayAdapter + NormalizedEvent
    │   │   ├── index.ts                     # getAdapterForOrg(orgId) — factory
    │   │   └── asaas/{index,client,mappers,webhook}.ts
    │   ├── messaging/
    │   │   ├── types.ts, index.ts, templates.ts
    │   │   └── zapi/{index,client}.ts
    │   ├── jobs/
    │   │   ├── types.ts                     # JobKind discriminado
    │   │   ├── enqueue.ts                   # com idempotency_key
    │   │   ├── worker.ts                    # runTick() atômico com SKIP LOCKED
    │   │   └── handlers/{send-message,send-cadence-step,schedule-charge,charge-status-poll,expire-invitation,process-webhook-event}.ts
    │   ├── domain/{diagnostico,waves,cadence,tokens}.ts
    │   └── validators/                      # Zod
    └── types/{db,domain}.ts
```

---

## Configuração Clerk ↔ Supabase (RLS via JWT)

**1. JWT template no Clerk** (nome `supabase`):
```json
{
  "aud": "authenticated", "role": "authenticated",
  "sub": "{{user.id}}", "email": "{{user.primary_email_address}}",
  "org_id": "{{org.id}}", "org_role": "{{org.role}}"
}
```
Assinatura: mesmo segredo JWT do Supabase (colar em Auth → JWT Secret).

**2. Três clientes Supabase distintos:**
- `server.ts`: RSC/Server Action. Pega token via `auth().getToken({ template: 'supabase' })` e passa no header `Authorization`.
- `client.ts`: browser. Interceptor de `fetch` refresca token via Clerk `useSession`.
- `admin.ts`: service-role. **Apenas em webhooks e handlers de job.** Toda query DEVE filtrar `.eq('org_id', orgId)` explícito — org sempre carregada de FK do evento, nunca do input do webhook.

**3. Política RLS padrão** (aplicada a `payers`, `contracts`, `mandates`, `waves`, `invitations`, `charges`, `messages`, `risk_events`, `fee_profiles`):
```sql
alter table <tabela> enable row level security;
create policy org_isolation on <tabela>
  using  (org_id::text = auth.jwt()->>'org_id')
  with check (org_id::text = auth.jwt()->>'org_id');
```
`organizations` tem policy baseada em `clerk_org_id`. `webhook_events`, `jobs` e `gateway_connections` **não têm policy pública** — só service-role acessa.

---

## Schema (13 tabelas + `jobs`)

Colunas conforme seção 7 do requisito. Colunas críticas para o motor:

- `gateway_connections`: `api_key_encrypted`, `api_key_iv`, `webhook_secret`, `is_primary`, `status`
- `mandates`: `status ∈ {pending, authorized, rejected, cancelled, expired}`, `ceiling_cents`, `external_mandate_id` único por provider
- `invitations`: `token` único opaco, `expires_at`, `attempt_n`
- `charges`: `status ∈ {scheduled, succeeded, failed, retrying}`, `cycle_ref`, `external_charge_id` único por provider
- `webhook_events`: `(provider, external_event_id)` UNIQUE + `raw jsonb`
- `jobs`: `kind`, `payload jsonb`, `run_at`, `status`, `attempts`, `max_attempts`, `idempotency_key` UNIQUE, `locked_by`, `locked_at`

**Índices críticos:** `(org_id, status)` em `contracts`, `mandates`, `charges`; `(status, run_at)` e `(org_id, status)` em `jobs`; `(due_date, status)` em `charges`; `(status, expires_at)` em `invitations`; `(org_id, phone_e164)` em `payers`.

---

## Adapter de gateway

Interface exata conforme seção 8 do requisito. Implementação:

**`src/lib/gateways/index.ts`** — factory por org:
```ts
export async function getAdapterForOrg(orgId: string): Promise<GatewayAdapter> {
  const supa = adminClient()
  const { data } = await supa.from('gateway_connections')
    .select('*').eq('org_id', orgId).eq('is_primary', true).single()
  const apiKey = decrypt(data.api_key_encrypted, data.api_key_iv)  // AES-GCM
  const Impl = await registry[data.provider]()
  return new Impl({ apiKey, environment: data.environment, webhookSecret: data.webhook_secret })
}
```

Descriptografia acontece **apenas dentro** de `getAdapterForOrg` (server-only). Chave mestre em `APP_ENCRYPTION_KEY` (32 bytes base64) fora do banco.

**Eventos normalizados** (vocabulário interno): `mandate.authorized|rejected|cancelled|expired`, `charge.scheduled|succeeded|failed|retrying`.

Nenhum código fora de `src/lib/gateways/*` conhece o nome do provedor.

---

## Fila de jobs

**Discriminated union** em `src/lib/jobs/types.ts`:
```ts
type JobPayload =
  | { kind:'send_message'; messageId:string }
  | { kind:'send_cadence_step'; invitationId:string; step:1|2|3|4 }
  | { kind:'schedule_charge'; contractId:string; dueDate:string }
  | { kind:'charge_status_poll'; chargeId:string }
  | { kind:'expire_invitation'; invitationId:string }
  | { kind:'process_webhook_event'; webhookEventId:string }
```

**Worker** (`worker.ts`) roda com CTE atômico:
```sql
with next as (
  select id from jobs where status='pending' and run_at <= now()
  order by run_at limit 20 for update skip locked
)
update jobs set status='running', locked_by=$1, locked_at=now(),
                attempts=attempts+1
from next where jobs.id=next.id returning jobs.*;
```
Falha recuperável → `status='pending'` com `run_at = now() + backoff(attempts)`; ao esgotar `max_attempts` → `status='failed'` + `risk_events`.

**Cron**: `vercel.json` schedule `* * * * *` → `/api/cron/tick`; `0 5 * * *` → `/api/cron/daily` (D-3 avisos, geração de charges do dia).

**Idempotência**: convenções de key — `cadence:{invitationId}:step2`, `poll:{chargeId}:{dueDate}`, `expire:{invitationId}`, `whev:{webhookEventId}` — com `on conflict do nothing`.

---

## Webhooks

Padrão único em `src/app/api/webhooks/[provider]/route.ts`:
1. Lê `raw`, chama `adapter.verifyWebhook(raw, headers)` — 401 se falhar.
2. `adapter.parseWebhook(raw)` retorna eventos normalizados.
3. Insere em `webhook_events` (`external_event_id` UNIQUE); código de erro `23505` = duplicado → ignora.
4. Enfileira job `process_webhook_event` com `idempotency_key=whev:{id}`.
5. Retorna 200 em <200ms.

**Zero lógica no handler** — tudo em `handlers/process-webhook-event.ts`, que faz o lookup do org via `external_id` (nunca do payload cru).

---

## Página de autorização pública

`src/app/autorizar/[token]/page.tsx` (RSC, fora do middleware Clerk):

1. `adminClient()` busca `invitations` por `token`, joins com `payers`, `contracts`, `organizations` (logo, cor, nome).
2. Valida `status='pending'` e `expires_at > now()`. Token expirado → tela oferece gerar novo.
3. Renderiza card: logo · nome do pagador · valor · teto · frequência · botão único "Autorizar no meu banco".
4. Client component chama Server Action `startAuthorization(invitationId)`:
   - Carrega adapter por `getAdapterForOrg(inv.org_id)`
   - `adapter.createMandate(...)` → `{ mandateId, authUrl, qrCode, expiresAt }`
   - Cria linha em `mandates` (`status='pending'`) e atualiza `invitations.mandate_id`
   - Retorna URL/QR
5. Mobile → deep link direto no app do banco. Desktop → QR + instrução.
6. Polling a cada 3s em `GET /autorizar/[token]/status` até `authorized`; ao chegar, tela de sucesso.
7. Webhook `mandate.authorized` cancela jobs de cadência: `update jobs set status='done' where idempotency_key like 'cadence:{invId}:%' and status='pending'`.

---

## Fluxos-chave (referência rápida)

**Onboarding → diagnóstico (meta <10 min):** cadastro Clerk → cria org → conecta Asaas → sync ou CSV → dedup por CPF/celular → diagnóstico gerado (contratos ativos, MRR, custo por método, projeção 50%/70%/90%).

**Migração:** cria wave com filtro (método, valor, falhas, tags) e régua (D0/D+2/D+5/D+10) → dispara → cada convite gera token único → régua interrompe ao chegar `mandate.authorized` → contrato marcado migrado → medidor de migração atualiza.

**Ciclo mensal (Fase 2):** D-3 aviso → D0 `schedule_charge` → sucesso ou falha; falha → mensagem imediata com Pix avulso → política de retentativa → esgotou = `risk_event`.

**Reajuste (Fase 2):** operador altera valor → se ≤ teto do mandato: cobra normal. Se > teto: gera novo `invitation` de reautorização.

---

## Fases de entrega

**Fase 1 — MVP vendável (4 semanas, caminho crítico):**
- Semana 1: scaffold, Clerk+Supabase RLS, migrations, `crypto.ts`, `admin.ts`, `user-service.ts`, layout+sidebar
- Semana 2: adapter Asaas (`testConnection`, `listCustomers`, `listSubscriptions`, `listPaymentHistory`, `createMandate`, `getMandate`, `verifyWebhook`, `parseWebhook` só de mandato); onboarding completo; diagnóstico
- Semana 3: `waves`, `invitations`, jobs de cadência (`send_cadence_step`, `expire_invitation`), Z-API mínima (send text), templates básicos
- Semana 4: página `/autorizar/[token]`, webhook `/api/webhooks/asaas` (eventos `mandate.*`), painel da wave em tempo real, deploy Vercel + cron

**Fase 2 — operação completa:** `scheduleCharge`, `getCharge`, `cancelMandate`, `createOneOffPix`, eventos `charge.*`, cron mensal (D-3, D0, D+1 fallback), `/atencao`, retentativa, reajuste com reautorização, templates editáveis + histórico `/mensagens`, alertas por e-mail+WhatsApp, resumo diário.

**Fase 3 — escala:** segundo adapter (Efí ou Stripe) — validação real da interface; templates por nicho; cobrança sobre economia comprovada; API pública; auditoria refinada.

---

## Verificação

- **Asaas sandbox**: conta sandbox própria, API key colada no onboarding; usar CPFs e cartões de teste para criar assinaturas fake antes do import.
- **Webhooks locais**: `ngrok http 3000` → colar URL `https://xxx.ngrok.app/api/webhooks/asaas` no dashboard sandbox; disparar eventos via botão "simular webhook".
- **Seed**: `supabase/seed.sql` com 1 org, 1 gateway_connection dummy, 20 payers, 20 contracts. `supabase db reset` carrega.
- **Cron local**: `watch -n 60 'curl -H "x-cron-secret: xxx" localhost:3000/api/cron/tick'`.
- **Página do pagador**: teste manual em mobile (deep link só abre no celular real); Playwright smoke para o happy path da UI.
- **RLS**: script `scripts/test-rls.ts` faz login como user de org A e tenta ler dados de org B — deve retornar zero linhas em toda tabela com policy.
- **Idempotência**: reenviar mesmo webhook 3× → só 1 linha em `webhook_events` e 1 job.
- **Vitest**: unit em `mappers.ts` (Asaas → Normalized), `cadence.ts`, `diagnostico.ts`, `crypto.ts`, `tokens.ts`.

---

## Arquivos críticos (primeiras 2 semanas)

- `supabase/migrations/0001_init.sql` — 13 tabelas + `jobs` + policies RLS
- `src/middleware.ts` — clerkMiddleware, marca `/autorizar/*`, `/api/webhooks/*`, `/api/cron/*` como públicas
- `src/lib/crypto.ts` — AES-GCM encrypt/decrypt
- `src/lib/supabase/server.ts` e `src/lib/supabase/admin.ts`
- `src/lib/clerk/user-service.ts` — `getCurrentUser` + `getCurrentOrgId`
- `src/lib/gateways/types.ts` + `src/lib/gateways/index.ts`
- `src/lib/gateways/asaas/index.ts`
- `src/lib/jobs/worker.ts` e `src/lib/jobs/enqueue.ts`
- `src/app/api/cron/tick/route.ts`
- `src/app/api/webhooks/[provider]/route.ts`
- `src/app/autorizar/[token]/page.tsx` e `src/app/autorizar/[token]/acoes.ts`
- `src/app/(onboarding)/conectar-gateway/page.tsx`
- `src/app/(app)/migracao/nova/page.tsx`

---

## Riscos e questões abertas (do requisito §13)

1. Fórmula de cobrança sobre economia — definir antes de vender (Fase 3).
2. Aprovação de templates Utility na Meta — Z-API contorna no MVP; validar timing antes de mover para Cloud API oficial.
3. Posicionamento vs gateways (parceiro de canal ou concorrente) — decisão de go-to-market, não bloqueia o build.
4. Confirmar jornadas de autorização Asaas na doc vigente — impacta layout da página do pagador; validar na Semana 2 durante a integração do adapter.
