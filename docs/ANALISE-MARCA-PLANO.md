# Análise — brand book × plano de implementação

Confronto entre `docs/BRAND_BOOK.md` (v1.0, 04/08/2026) e `PLAN.md` (Fase 1 — MVP vendável).
Objetivo: listar o que os dois documentos discordam e o que a marca exige e o plano ainda não cobre.

Este documento **não altera decisões** — as marcadas como "decisão pendente" são do Guardião da Marca.

---

## 1. Conflitos entre os documentos

### 1.1 Nome do produto — decisão pendente, bloqueia o resto

| Onde | Nome |
|---|---|
| Repositório, `PLAN.md`, `README.md`, path do projeto | **Perene** |
| Brand book inteiro, tokens (`--pl-*`), domínio sugerido, handles | **Pulso** |

O brand book §3.4 registra "Pulso" como decisão de naming, mas **condicionada** à verificação de domínio e INPI (Anexo B, pendência 1), que ainda não foi feita. Ou seja: hoje o projeto tem dois nomes e nenhum dos dois está confirmado.

Impacto se virar Pulso: `README.md`, `PLAN.md`, nome do repositório, prefixo dos tokens, textos de UI, assinatura da página do pagador, favicon, domínio, handles. Impacto se ficar Perene: reescrever §3.4, §3.5, §5.1 e o mantra do brand book — "Pulso firme na recorrência" e o símbolo de batimento não sobrevivem à troca de nome, porque a metáfora inteira depende dele.

**Recomendação:** resolver a pendência 1 (domínio + INPI classes 36 e 42) antes de qualquer trabalho de identidade visual ou de escrever string de UI. É o item mais barato de resolver agora e o mais caro de resolver depois.

### 1.2 Tipografia

| `PLAN.md` | Brand book §5.3 |
|---|---|
| Geist (fonte única, padrão do scaffold shadcn) | Archivo (títulos) · Inter (interface e corpo) · JetBrains Mono (identificadores) |

O brand book justifica a escolha por um requisito funcional, não estético: **Inter tem algarismos tabulares nativos**, e §5.3 marca `tabular-nums` como regra não negociável para todo valor monetário. Geist também suporta `tabular-nums`, então o conflito é de identidade, não de capacidade — mas a decisão precisa ser explícita, porque o logotipo é Archivo Semibold e a hierarquia inteira (§5.3) está especificada nessas três famílias.

**Recomendação:** adotar o par Archivo + Inter. O custo é uma linha em `layout.tsx`, e adiar isso significa refazer toda a hierarquia depois.

### 1.3 Tema e paleta do scaffold

`PLAN.md` especifica shadcn `new-york` + base color `neutral`, que instala a paleta padrão do shadcn em variáveis `--primary`, `--muted`, etc. O brand book §7.3 determina `pulso-tokens.css` como **fonte única de verdade**, com prefixo `--pl-`.

Os dois sistemas coexistem mal: se os componentes shadcn lerem `--primary` e a marca definir `--pl-cobalto`, existem duas fontes de cor e a auditoria de §1.2 do brand book ("zero hex solto") não tem como passar.

**Recomendação:** mapear as variáveis do shadcn para os tokens da marca no `globals.css` (`--primary: var(--pl-cobalto)`), em vez de manter as duas paletas em paralelo. Os tokens já estão em `docs/brand/pulso-tokens.css`.

### 1.4 WhatsApp — Z-API × Meta Cloud API

Este é o conflito mais sério, porque não é estético.

- `PLAN.md`: Z-API como primeira implementação; Meta Cloud API fica para a Fase 3. Risco nº 2 do plano diz "Z-API contorna no MVP".
- Brand book §3.1 (LEGAL): "disparo em massa sem opt-in registrado é o **risco existencial** da operação. Bloqueio de número por denúncia derruba a régua inteira e é irreversível na prática." §4.2 eleva CONFORMIDADE a valor fundamental. §6.1 coloca o início da aprovação de template Meta (categoria Utility) na Fase B — mês 2 — justamente porque o prazo é externo.

Z-API é uma ponte não-oficial: o número não tem a proteção da categoria Utility e é exatamente o vetor de bloqueio que o brand book descreve como irreversível. A régua D0/D+2/D+5/D+10 disparada em massa por um número não-oficial é o cenário de risco literal.

**Recomendação:** manter Z-API como implementação do `MessagingProvider` para o MVP (a interface já isola isso, e a troca é barata), mas **iniciar a aprovação de template Meta agora**, em paralelo com a Semana 1 — não na Fase 3. O prazo é externo e não controlável; começar tarde é o que transforma isso em bloqueio. E registrar opt-in com timestamp e origem desde a primeira migration (ver 2.3 abaixo).

### 1.5 Vocabulário nas rotas

O brand book §3.4 nomeia os módulos: **Diagnóstico · Ondas · Atenção · Conexões**. O plano usa `/migracao`, `/migracao/nova`, `/migracao/[waveId]`, `/atencao`, `/configuracoes/gateway`.

Não é conflito grave — o plano e o brand book concordam na regra de fronteira (§4.3: "do lado de dentro, jargão; do lado de fora, português"), e `waveId` é identificador interno, portanto correto. Mas a URL é superfície: `/migracao` e "Ondas" ensinam nomes diferentes para a mesma coisa.

**Recomendação:** alinhar rota e rótulo. Se o módulo se chama Ondas, a rota é `/ondas`.

---

## 2. O que a marca exige e o plano não cobre

### 2.1 PDF do diagnóstico — ausente da Fase 1

O brand book chama o PDF de diagnóstico de "**o material de marca mais importante do negócio**" (§1.2), o ativo sensorial da marca (§4.4), o objeto que circula sozinho e deve gerar 20% dos leads qualificados (§1.1, resultado SMART nº 2), e prioridade máxima da Fase A (§6.1).

O `PLAN.md` gera o diagnóstico na tela (Semana 2) e não menciona exportação em PDF em nenhuma fase.

**Impacto:** sem o PDF, o Rafael (persona 3 — parceiro de canal) não tem o que apresentar como material dele, e o mecanismo de distribuição orgânica desenhado no brand book simplesmente não existe.

**Recomendação:** adicionar geração do PDF à Fase 1, logo após o diagnóstico em tela. Requisito de marca associado: o PDF carrega a marca da **organização**, não a nossa (§2.3, persona Rafael).

### 2.2 Calculadora pública — ausente

§6.3: "**A calculadora pública é a peça central do site.** Não é acessório de conteúdo — é a versão de topo de funil do diagnóstico." Sem cadastro, sem e-mail. §3.6 repete: pedir cadastro antes de mostrar o número inverte a lógica da marca inteira.

O plano tem `(marketing)` como "landing pública", sem calculadora.

**Recomendação:** incluir na rota `(marketing)`. É estática, sem banco, sem auth — custo baixo, e é o gatilho de descoberta descrito em §2.2.4.

### 2.3 Registro de opt-in — não aparece no schema

§4.2 (valor CONFORMIDADE) e §3.2 (Insight 6) exigem **timestamp e origem em todo opt-in**, e tratam isso como argumento de venda, não como linha de requisito. §2.3 registra que a Simone responde pessoalmente por LGPD e que essa é a objeção nº 2 dela.

O schema de 13 tabelas no `PLAN.md` não lista campo nem tabela de consentimento.

**Recomendação:** incluir em `0001_init.sql`, antes de qualquer disparo. Retroagir consentimento é impossível; a alternativa é reimportar a base.

### 2.4 Direitos do titular (LGPD) — não previsto

§4.2: "Resposta a titular em 15 dias, com exportação e exclusão em um clique." Não há nada equivalente no plano, em nenhuma fase.

**Recomendação:** Fase 2 é aceitável, desde que o schema da Fase 1 não impeça (evitar dado de pagador desnormalizado e espalhado, que torna a exclusão cara).

### 2.5 Medidor de migração — escopo menor que o especificado

O plano coloca o medidor dentro de `/dashboard`. §5.4 do brand book: "**Persistente no topo do painel.** Nunca colapsa, nunca some, não vira card entre outros cards" — e justifica: é a resposta ao Momento da Verdade nº 5 (o mês em que nada acontece, maior risco de churn do produto).

**Recomendação:** o medidor pertence ao layout de `(app)`, não à página `/dashboard`.

### 2.6 Contraste dinâmico na página do pagador — não previsto

§5.2, regra de implementação: a página de autorização usa a cor da organização; é obrigatório calcular o contraste da cor recebida contra branco no render e, abaixo de 4,5:1, trocar o texto do botão para grafite. "Nunca confiar na cor que o cliente subiu."

O plano descreve a página com "logo · cor" da organização, sem essa verificação. É uma função pura de ~15 linhas e evita um botão ilegível na única tela que o pagador vai ver na vida.

### 2.7 Duas superfícies, um sistema — risco declarado

§1.2 e §3.6 avisam que tratar o painel do operador e a página do pagador com o mesmo sistema de densidade "é o erro mais provável do projeto". Compartilham tokens e tipografia; **não** compartilham densidade nem hierarquia (§5.3 especifica uma escala tipográfica própria para o pagador: valor em 40px, botão de 52px de altura mínima).

O plano não distingue as duas superfícies no UI kit.

### 2.8 Itens menores, mas com regra explícita no brand book

| Item | Regra | Onde |
|---|---|---|
| `tabular-nums` em todo valor monetário | Não negociável | §5.3 |
| Estado vazio sem ação proposta = bug de interface | Regra de código | §6.3, §4.2 |
| Badge de estado sempre com texto — nunca ponto colorido sozinho | §6.3 |
| Botão destrutivo com borda vermelha, nunca vermelho sólido | §6.3 |
| Erro de campo com borda **e** texto — nunca só cor | §6.3 |
| `prefers-reduced-motion` respeitado | §5.6 |
| Assinatura "processada com segurança por Pulso" no rodapé do pagador, máx. 12px, nunca acima do botão | §3.4 |
| Ícones: Lucide, só contorno, sem preenchimento | §5.4 |

---

## 3. Onde os dois documentos já concordam

Vale registrar, porque é o que não precisa ser discutido:

- **Filtro de escopo** — "ajuda a migrar ou a manter a autorização viva?" é idêntico nos dois (`PLAN.md` contexto § / brand book §4.2).
- **Domínio agnóstico** — Organização e Pagador, rótulo configurável por org, sem schema por vertical.
- **Fronteira de vocabulário** — o adapter é a fronteira: `mandate.authorized` do lado de dentro, "autorização" do lado de fora. O plano já implementa isso na normalização de eventos.
- **Não somos gateway** — o dinheiro nunca passa por nós; a Pulso roda sobre o gateway do cliente.
- **Alerta no mesmo dia** — `risk_events` + webhook no plano atendem o Pilar SUSTENTAR.
- **Realtime na onda** — §3.6 chama de momento "aha" nº 2; o plano prevê painel da wave em tempo real na Semana 4.
- **Meta de <10 min até o diagnóstico** — igual nos dois.

---

## 4. Ordem sugerida de decisão

1. **Domínio + INPI** — bloqueia nome, tokens, logo, README, repositório. Decisão de fora, prazo externo: começar hoje.
2. **Aprovação de template Meta (Utility)** — prazo externo, não controlável. Começar em paralelo, independente da decisão de Z-API.
3. **Tipografia e mapeamento de tokens** — barato agora, caro depois de 40 componentes construídos.
4. **PDF do diagnóstico e calculadora pública** — entram no escopo da Fase 1 ou ficam declaradamente fora, com a consequência aceita (sem canal de distribuição orgânica).
5. **Opt-in no schema** — antes da primeira migration rodar em produção.
