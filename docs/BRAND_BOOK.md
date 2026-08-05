# PULSE — Brand Book

**Plataforma de migração e gestão de recorrência em Pix Automático**

Versão 1.0 · Agosto de 2026
Documento confidencial

---

> **Como ler este documento**
>
> As Fases 1 e 2 contêm **hipóteses estruturadas**, derivadas do documento de requisitos v0.1 e do contexto de mercado — não de pesquisa primária. Estão marcadas com `[H]`. Os instrumentos de validação (survey e roteiro de entrevista) estão preenchidos e prontos para rodar; a intenção é que cada `[H]` vire dado dentro de 30 dias.
>
> As Fases 3 a 7 são decisões de marca. Essas valem como estão.

---

## ÍNDICE

**FASE 1 — DIAGNÓSTICO** · 1.1 Briefing · 1.2 Auditoria · 1.3 Análise competitiva
**FASE 2 — PESQUISA DE PÚBLICO** · 2.1 Coleta · 2.2 Frameworks · 2.3 Personas · 2.4 Validação
**FASE 3 — ESTRATÉGIA** · 3.1 PESTEL · 3.2 Insights · 3.3 Posicionamento · 3.4 Arquitetura e naming · 3.5 Narrativa · 3.6 Experiência · 3.7 Aprovação
**FASE 4 — DNA DA MARCA** · 4.1 Origem · 4.2 Visão, missão, valores · 4.3 Personalidade e tom · 4.4 Código Primal · 4.5 Personagem Atrativo · 4.6 Storylines
**FASE 5 — IDENTIDADE VISUAL** · 5.1 Logo · 5.2 Cores · 5.3 Tipografia · 5.4 Iconografia · 5.5 Fotografia · 5.6 Motion
**FASE 6 — IMPLEMENTAÇÃO** · 6.1 Roadmap · 6.2 Papelaria · 6.3 Digital · 6.4 Redes · 6.5 Ambientes · 6.6 Identificação · 6.7 Eventos · 6.8 Veículos
**FASE 7 — GESTÃO** · 7.1 Guardiões · 7.2 Regras · 7.3 Biblioteca · 7.4 Aprovação · 7.5 Contatos
**ANEXOS** · A. Glossário · B. Histórico

---
---

# FASE 1 — DIAGNÓSTICO

## 1.1 Briefing Inicial

**Data de início:** 04/08/2026
**Responsável pelo projeto:** Leandro F.
**Prazo total:** 6 semanas (marca) · roadmap de produto em paralelo

### Tipo de projeto

- [x] Criar identidade do zero
- [x] Lançamento de novo produto/serviço
- [ ] Rebranding completo
- [ ] Refresh visual

### O que motivou este projeto

O Pix Automático entrou em produção em 16 de junho de 2025, sob a Resolução BCB 384/2024. A promessa era clara: débito em conta para as massas, sem convênio bancário, com tarifa em centavos contra os 2% a 3,5% de MDR do cartão recorrente. Um ano depois, a adoção ainda é uma fração do potencial — foram cerca de 282 mil transações até novembro de 2025, num país com 79,8 bilhões de operações Pix no ano.

O motivo do descompasso não é técnico e não é de aceitação. Os dados de mercado apontam adesão de 73% entre pagadores que efetivamente recebem a solicitação dentro do app do banco — uma taxa que o cartão recorrente leva anos para alcançar. O gargalo está exatamente no meio: **entre a API que o gateway publicou e o pagador que autorizaria se fosse convidado, não existe ninguém.**

Todo negócio de mensalidade no Brasil está nessa lacuna. A academia tem 380 alunos no cartão. A escola tem 900 boletos. O condomínio tem 220 unidades. Todos sabem que existe uma opção mais barata. Nenhum sabe como fazer 380 pessoas trocarem de método sem perder 40 delas no caminho. É uma operação de convencimento em massa, com régua, mensagem, prova social e acompanhamento — não é uma integração.

Este projeto cria a marca dessa operação.

### Resultados esperados (SMART)

1. **Reconhecimento de categoria** — que "Pulse" seja identificado como camada de migração e retenção, e nunca confundido com gateway de pagamento, em 90% das primeiras conversas comerciais até dezembro de 2026.
2. **Diagnóstico como ativo de marca** — que o relatório de diagnóstico (RF-34) seja compartilhado entre operadores sem intervenção comercial, gerando pelo menos 20% dos leads qualificados no primeiro semestre.
3. **Consistência de vocabulário** — zero jargão de gateway ("mandate", "revoked", "MDR") na superfície do produto e nas comunicações públicas, verificado em auditoria trimestral.

---

## 1.2 Auditoria de Marca Atual

Marca nova. O inventário é a lista do que precisa existir, não do que existe.

| Material | Existe? | Estado | Observações |
|---|---|---|---|
| Logo | ☐ | — | Criado nesta Fase 5 |
| Site | ☐ | — | `(marketing)` já previsto na arquitetura Next.js |
| Redes Sociais | ☐ | — | Handles a registrar antes de qualquer publicação |
| Materiais impressos | ☐ | — | Baixa prioridade; o produto é 100% digital |
| Sinalização | ☐ | — | Não aplicável no estágio atual |
| Embalagens | ☐ | — | Não aplicável |
| Apresentações | ☐ | — | Deck comercial é prioridade A |
| **Relatório de diagnóstico (PDF)** | ☐ | — | **É o material de marca mais importante do negócio** |

### Análise de consistência — linha de base

Como não há histórico, esta tabela vira o **contrato de qualidade** a ser auditado a cada trimestre.

| Aspecto | Meta | Como medir |
|---|---|---|
| Logo padronizado | 5/5 | Auditoria de assets em uso |
| Cores consistentes | 5/5 | Tokens CSS como fonte única; zero hex solto no código |
| Tom de voz uniforme | 5/5 | Amostra de 20 strings de interface + 10 mensagens de WhatsApp |
| Materiais profissionais | 5/5 | Revisão do deck e do PDF de diagnóstico |
| Experiência coerente | 5/5 | Jornada do pagador ponta a ponta (mensagem → página → confirmação) |

**Ponto de atenção que já existe:** a marca terá duas superfícies com públicos opostos — o painel do operador (denso, diário, profissional) e a página do pagador (única, mobile, uma vez na vida). A tentação será tratá-las com o mesmo sistema. Não são. Ver 3.6 e 6.3.

---

## 1.3 Análise Competitiva

O mercado se organiza em três camadas. Nenhuma delas ocupa a posição da Pulse, e é isso que torna a posição defensável — mas também frágil, porque é fácil de copiar por cima.

### Camada 1 — Gateways e adquirentes
**Asaas, Efí, Iugu, Pagar.me, Vindi, PagBrasil, Stone**

- **Porte:** de médio a muito grande; volume transacionado na casa de bilhões
- **Posicionamento:** infraestrutura de pagamento. Vendem capacidade, não resultado.
- **Forças:** relação direta com o dinheiro, escala, credibilidade regulatória, já têm o endpoint de Pix Automático publicado
- **Fraquezas:** entregam a API e encerram a responsabilidade ali. Não têm incentivo para reduzir a própria receita de MDR migrando o cliente do cartão. Não conhecem o pagador final. Documentação para desenvolvedor, não para recepcionista.
- **Identidade visual:** dominada por azul e verde-água, gradiente, ilustração isométrica, linguagem de developer relations
- **Proposta de valor:** "integre e receba"
- **Relação com a Pulse:** **parceiro, não concorrente.** A Pulse roda em cima deles. Isso precisa estar explícito na marca — ver questão em aberto nº 3 dos requisitos.

### Camada 2 — Plataformas de gestão com cobrança embutida
**Superlógica, Tecnofit, EvolluxERP, Sponte, Zeev**

- **Porte:** grandes no vertical; Superlógica é referência em condomínios e educação
- **Posicionamento:** ERP do segmento. A cobrança é um módulo do sistema de gestão.
- **Forças:** já estão dentro da operação do cliente, detêm a base de dados, contrato longo, alto custo de troca
- **Fraquezas:** verticalizados (um produto por nicho, o oposto do agnosticismo da Pulse). Cobrança é módulo, não missão — migração de método não é prioridade de roadmap. Implantação lenta, contrato pesado.
- **Identidade visual:** corporativa, azul institucional, densa, pouco memorável
- **Proposta de valor:** "gerencie tudo em um lugar"
- **Relação com a Pulse:** **concorrentes indiretos e futuros parceiros de integração.** O risco real é um deles lançar um botão "migrar para Pix Automático" em 2027.

### Camada 3 — Automação genérica e planilha
**WhatsApp na mão, Excel, n8n/Make, estagiário**

- **Porte:** invisível, e é o maior concorrente de todos
- **Posicionamento:** não existe; é o estado padrão do mercado
- **Forças:** custo zero aparente, controle total, nenhuma negociação de contrato
- **Fraquezas:** não escala, não tem trilha de auditoria, não tem conformidade LGPD, quebra quando a pessoa que fazia sai da empresa
- **Proposta de valor:** "a gente resolve aqui mesmo"
- **Relação com a Pulse:** **é contra este que a venda é ganha ou perdida.** A objeção real nunca será "prefiro o concorrente X", será "eu mesmo mando as mensagens".

### Mapa de posicionamento

```
                        RESULTADO PROVADO
                               |
                     PULSE ●   |
                               |
     Genérico  --------------- + --------------- Especializado
     (serve                    |                  (serve um
      qualquer                 |                   nicho só)
      operação)      ● Gateway | ● ERP vertical
                               |
                         ● Planilha
                               |
                       CAPACIDADE ENTREGUE
```

**Eixo vertical:** o que a marca promete — a ferramenta (capacidade) ou o número (resultado).
**Eixo horizontal:** agnosticismo de nicho.

**Posição desejada:** quadrante superior esquerdo. **Resultado provado, para qualquer operação de recorrência.** É o único quadrante vazio, e é para onde a arquitetura multi-nicho do produto já aponta (seção 2 dos requisitos).

**Vulnerabilidade da posição:** é uma posição de camada fina. Se um gateway decidir entregar a operação de migração junto com a API, o diferencial evapora. A defesa não é técnica — é ser a marca que **os operadores associam ao número**, antes que o gateway pense nisso.

---
---

# FASE 2 — PESQUISA DE PÚBLICO

> `[H]` = hipótese a validar. Todo item marcado precisa virar dado.

## 2.1 Coleta de Dados

### 2.1.1 Fontes disponíveis hoje

| Fonte | Disponível? | Dados relevantes | Prioridade |
|---|---|---|---|
| Base própria de clientes | ☐ Não | — | Existe a partir dos primeiros 10 clientes |
| Bases de clientes-piloto | ☐ A negociar | Distribuição real de método, taxa de falha, ticket | **Alta — é o dado mais valioso disponível** |
| Documentação pública de gateways | ☑ Sim | Tabelas de tarifa por método, que alimentam o RF-31 | Alta |
| Dados do Banco Central (Estatísticas Pix) | ☑ Sim | Volume e crescimento do Pix Automático | Média |
| Grupos de gestores por nicho (WhatsApp, Facebook) | ☑ Sim | Linguagem real, reclamações, objeções | **Alta** |
| Reclame Aqui — gateways e ERPs verticais | ☑ Sim | Dores sistêmicas do setor | Média |

**Ação prioritária:** conseguir **três bases-piloto reais** (uma academia, uma escola, um condomínio) e rodar o diagnóstico nelas antes de vender qualquer coisa. Isso valida simultaneamente a matemática do RF-30/31/32 e produz os três primeiros casos de "antes e depois" (Storyline 3).

### 2.1.2 Survey — instrumento pronto

**Amostra mínima:** 60 respondentes · **Público:** quem decide sobre cobrança em negócio com mensalidade · **Ferramenta:** Tally

**BLOCO 1 — Perfil da operação**
1. Qual o segmento do seu negócio? *(academia/box · escola/curso · clínica · condomínio/associação · SaaS/assinatura · salão/clube · outro)*
2. Quantos clientes pagam mensalidade hoje? *(até 50 · 51–150 · 151–400 · 401–1000 · +1000)*
3. Qual o ticket médio da mensalidade? *(faixas)*
4. Quem cuida da cobrança no dia a dia? *(dono · gerente financeiro · recepção · terceirizado · ninguém especificamente)*
5. Há quanto tempo o negócio existe? *(faixas)*

**BLOCO 2 — Método atual**
6. Como você cobra hoje? *(múltipla: cartão recorrente · boleto · Pix manual · débito em conta · dinheiro/maquininha · Pix Automático)*
7. Qual método concentra a maior parte da receita? *(escolha única)*
8. Você sabe quanto paga de taxa por mês, somando todos os métodos? *(sei o valor exato · sei aproximadamente · não faço ideia)*
9. Se sabe: qual valor aproximado? *(campo aberto)*
10. Que sistema você usa para gerenciar isso? *(campo aberto)*

**BLOCO 3 — A dor**
11. Dos seus clientes ativos, quantos atrasam ou falham no pagamento por mês? *(campo numérico)*
12. Quando uma cobrança falha, quanto tempo você leva para descobrir? *(no mesmo dia · em alguns dias · só no fechamento do mês · não descubro, o cliente some)*
13. Já perdeu cliente porque o pagamento quebrou e ninguém percebeu a tempo? *(sim, com frequência · sim, já aconteceu · não que eu saiba)*
14. Qual seu maior incômodo com a cobrança hoje? *(campo aberto)*
15. Se pudesse mudar UMA coisa na sua operação de cobrança, o que seria? *(campo aberto)*

**BLOCO 4 — Pix Automático**
16. Você já ouviu falar em Pix Automático? *(sim, conheço bem · já ouvi, não sei como funciona · nunca ouvi)*
17. Se conhece e não usa, o que impede? *(múltipla: não sei por onde começar · meu sistema não oferece · acho que meus clientes não vão aderir · dá muito trabalho migrar todo mundo · não vejo vantagem · outro)*
18. Quantos dos seus clientes você acha que aceitariam trocar? *(quase nenhum · uns 25% · uns 50% · a maioria · não faço ideia)*
19. Onde você busca solução para problemas do negócio? *(múltipla: Google · Instagram · YouTube · indicação de outro dono · grupo de WhatsApp · consultor/contador · fornecedor atual)*
20. Se alguém te mostrasse hoje, em 10 minutos, quanto você perde por mês com taxa e falha — você olharia? *(0–10 + por quê)*

**Compilação (preencher após rodar):**

| Pergunta | Resultado | Insight |
|---|---|---|
| Método dominante | | |
| % que não sabe quanto paga de taxa (Q8) | | **Métrica-chave: mede o tamanho da cegueira** |
| Tempo médio para descobrir falha (Q12) | | **Métrica-chave: justifica o alerta no mesmo dia** |
| % que já perdeu cliente por pagamento quebrado (Q13) | | **Métrica-chave: valida o antagonista da marca** |
| Barreira principal ao Pix Automático (Q17) | | Define a mensagem central de vendas |
| Interesse no diagnóstico (Q20) | | Valida o produto de entrada |

### 2.1.3 Entrevistas — roteiro

**Amostra:** 10 entrevistas de 40 min · perfis mistos por nicho e porte

**ABERTURA (5 min)**
- "Me conta como funciona o seu negócio hoje. Quantos clientes, como é a rotina."

**A OPERAÇÃO REAL (12 min)**
- "Me descreve o dia da cobrança. O que acontece, quem faz o quê, na ordem."
- "O que dá errado com mais frequência?"
- "Quando um pagamento falha, como você fica sabendo?"
- "E aí, o que você faz? Me conta o último caso que aconteceu."

**A PERDA (10 min)**
- "Você sabe quanto paga de taxa por mês?" *(observar a hesitação — ela é o insight)*
- "Já parou para somar o que deixou de receber no ano passado por cobrança que não entrou?"
- "Me conta de um cliente que você perdeu sem querer perder."

**A MIGRAÇÃO (8 min)**
- "Se eu te falasse que dá para cobrar por Pix Automático por centavos em vez de 3%, qual sua primeira reação?"
- "O que te preocuparia em pedir para todos os seus clientes trocarem de forma de pagamento?"
- "Quem você acha que aceitaria na hora? E quem daria trabalho?"

**FECHAMENTO (5 min)**
- "Se existisse alguém que fizesse essa migração para você, o que essa pessoa teria que garantir para você confiar?"
- "Mais alguma coisa que eu não perguntei e que importa?"

**Registro:**

| # | Perfil | Citação marcante | Insight |
|---|---|---|---|
| E1 | | | |
| E2 | | | |
| E3 | | | |

### 2.1.4 Social listening — onde escutar

| Fonte | O que observar | Descobertas |
|---|---|---|
| Grupos de donos de box/academia | Como falam de inadimplência e "aluno que sumiu" | |
| Grupos de síndicos e administradoras | Reclamação sobre boleto e taxa bancária | |
| Comunidades de gestores escolares | Sazonalidade da inadimplência, matrícula vs. mensalidade | |
| Reclame Aqui — gateways | Padrão de reclamação sobre webhook, conciliação, suporte | |
| Reddit r/empreendedorismo, r/brdev | Discussão técnica sobre Pix Automático e adapters | |
| Google autocomplete: "pix automático como" | O que o mercado realmente não entende | |

**Vocabulário a capturar:** este é o produto direto do social listening. A seção 4.3 (Vocabulário da Marca) precisa ser reescrita com as palavras que eles usam, não com as que nós escolhemos. `[H]` até lá.

---

## 2.2 Frameworks de Análise

### 2.2.1 Mapa de empatia — Operador `[H]`

| Quadrante | Descrição |
|---|---|
| **Pensa e sente** | "Todo mês entra menos do que deveria e eu não sei exatamente por quê." Sente que a operação financeira é uma caixa-preta que ele tolera. Tem orgulho do serviço que entrega e vergonha da bagunça da cobrança. Medo permanente de descobrir que o problema é maior do que imagina. |
| **Escuta** | O contador dizendo que a taxa é normal. O gateway dizendo que já tem a API. Outro dono dizendo que "aqui é tudo no Pix mesmo". A recepção dizendo que "fulano falou que paga semana que vem". |
| **Vê** | Extrato com valor líquido menor que o bruto. Planilha de inadimplentes que cresce. Concorrente anunciando preço mais baixo. Cliente que parou de aparecer e ele não sabe se cancelou ou se o cartão venceu. |
| **Fala e faz** | Cobra no WhatsApp, pessoalmente, com constrangimento. Adia a conversa difícil. Faz "vista grossa" para o cliente antigo. Diz que "vai organizar isso ano que vem". |
| **Dores** | Cobrar dói socialmente. Não tem visibilidade. Perde cliente sem saber. Paga taxa que não entende. Depende de uma pessoa específica que sabe fazer. |
| **Ganhos** | Receita previsível. Não precisar cobrar ninguém. Um número na tela que ele possa mostrar ao sócio. Sentir que tem controle. |

### 2.2.2 Jobs to Be Done

| Segmento | Job funcional | Job emocional | Job social |
|---|---|---|---|
| **Operador** | Quando fecho o mês e vejo que entrou menos do que o previsto, quero saber exatamente onde vazou, para conseguir corrigir em vez de só reclamar. | Quando penso na minha operação de cobrança, quero me sentir no controle e não envergonhado, para poder crescer sem medo do que vou encontrar. | Quando falo com meu sócio ou contador, quero mostrar um número que prove que a operação melhorou por decisão minha, para ser visto como gestor e não como quem toca no improviso. |
| **Pagador** | Quando chega o vencimento da mensalidade, quero que já esteja resolvido, para não precisar lembrar nem fazer nada. | Quando autorizo algo no meu banco, quero me sentir seguro sobre o valor máximo e o que estou permitindo, para não ficar com aquela sensação de ter assinado em branco. | Quando alguém me cobra, quero não ser tratado como devedor, para manter a relação com o lugar que eu escolhi frequentar. |
| **Admin da plataforma** | Quando uma integração quebra, quero saber antes do cliente, para agir em vez de responder. | — | — |

### 2.2.3 Matriz de dores × desejos

| # | Dor | Intensidade | Desejo | Resposta da Pulse |
|---|---|---|---|---|
| 1 | Não sei quanto perco por mês | ⭐⭐⭐⭐⭐ | Ver o número real, sem esforço | Diagnóstico gerado em minutos a partir da base importada (RF-30 a RF-33) |
| 2 | Migrar todo mundo é impossível na prática | ⭐⭐⭐⭐⭐ | Alguém operar a migração por mim | Onda com régua, segmentação e limite diário (RF-40 a RF-48) |
| 3 | Descubro a falha tarde demais e o cliente já foi | ⭐⭐⭐⭐⭐ | Saber no mesmo dia | Evento de risco no mesmo dia + alerta por e-mail e WhatsApp (RF-65, RF-72) |
| 4 | Cobrar constrange e desgasta a relação | ⭐⭐⭐⭐ | Que a cobrança aconteça sem virar conversa | Aviso prévio + Pix avulso automático na falha (RF-60, RF-64) |
| 5 | Taxa de cartão come a margem e parece inevitável | ⭐⭐⭐⭐ | Pagar centavos em vez de porcentagem | Migração para Pix Automático com economia mensurada e acumulada (RF-80, RF-82) |
| 6 | Reajuste anual quebra tudo | ⭐⭐⭐ | Que o sistema perceba e resolva | Detecção de estouro de teto + fluxo de reautorização (RF-66) |
| 7 | Se a pessoa que faz a cobrança sair, a operação para | ⭐⭐⭐ | Processo que não dependa de ninguém | Linha do tempo por contrato + trilha de auditoria (RF-67, RNF) |

### 2.2.4 Jornada de compra — Operador

**1. DESCOBERTA — "nem sei que preciso disso"**
- Comportamento: toca o negócio, aceita a taxa como custo fixo, nunca somou o total
- Emoções: conformismo com uma leve incômodo de fundo
- Canais: grupo de donos do mesmo nicho, Instagram, indicação
- Conteúdo ideal: o número comparativo cru. "R$ 3,20 de tarifa por mês numa base de 400 alunos, ou R$ 4.800 de MDR. A escolha existe desde junho de 2025."
- Oportunidade: **o conteúdo tem que fazer a soma que ele nunca fez.** É o gatilho inteiro.

**2. RECONHECIMENTO — "espera, isso é muito dinheiro"**
- Comportamento: procura no Google, pergunta ao contador, pergunta ao gateway atual
- Emoções: irritação retroativa ("faz um ano que eu podia estar economizando")
- Canais: Google, YouTube, o próprio gateway
- Conteúdo ideal: explicação honesta do que é o Pix Automático e por que ninguém migrou ainda
- Oportunidade: ser quem explica o gargalo real (operação, não tecnologia) antes que ele conclua sozinho que "é complicado"

**3. CONSIDERAÇÃO — "será que meus clientes aceitam?"**
- Comportamento: procura casos, pergunta em grupo, calcula risco de perder gente
- Emoções: medo específico — não de gastar, de perder cliente
- Canais: site, cases, conversa com quem já fez
- Conteúdo ideal: **antes e depois com número de adesão.** Dado de mercado: 73% autorizam quando recebem a solicitação no app do banco.
- Oportunidade: **matar a objeção do medo com dado de adesão, não com desconto.**

**4. DECISÃO — "vou testar"**
- Comportamento: quer ver o próprio número antes de assinar
- Emoções: ansiedade sobre implantação e sobre expor a bagunça da base
- Canais: site, WhatsApp, demo
- Objeções e respostas:
  - *"Vou ter que trocar de gateway?"* → Não. A Pulse roda em cima do que você já usa.
  - *"E quem não tiver banco com Pix Automático?"* → Continua como está. Ninguém fica sem cobrar.
  - *"Minha base é uma bagunça."* → É por isso que o primeiro passo é o diagnóstico, e ele é gratuito.
  - *"Vou ter que aprender um sistema novo?"* → Você aprende uma tela: quem está em risco.
- Oportunidade: **o diagnóstico gratuito é a oferta.** Não é isca — é o produto de entrada e a prova.

**5. PÓS-COMPRA — "e agora?"**
- Comportamento: acompanha o medidor de migração subindo durante a onda
- Emoções: euforia na primeira semana, e depois o teste real — o mês em que nada acontece
- Canais: painel, resumo diário, alertas
- Conteúdo ideal: relatório mensal de economia acumulada; a fila "Precisa de atenção" com zero itens
- Oportunidade: **a retenção da Pulse é o mesmo trabalho da retenção do cliente dele.** O relatório mensal é o produto de fidelização, e o RF-82 (métrica de valor comprovado) é o que sustenta o modelo de cobrança sobre economia.

---

## 2.3 Construção das Personas

### Persona 1 — MARCELO, o dono que não tem tempo de olhar `[H]`

> *"Eu sei que tem dinheiro vazando. Só não sei onde nem quanto, e no fim do dia eu tenho aula para dar."*

| Campo | Detalhe |
|---|---|
| Idade | 38 anos |
| Gênero | Masculino |
| Estado civil | Casado |
| Filhos | 2 (6 e 9 anos) |
| Profissão | Dono de box de CrossFit com 320 alunos |
| Renda mensal | R$ 14.000 de pró-labore, faturamento de R$ 68.000 |
| Escolaridade | Superior em Educação Física |
| Localização | Cidade média, bairro de classe média |

**Personalidade**

| Traço | Nível |
|---|---|
| Introvertido ←→ Extrovertido | ○○○◆○ |
| Racional ←→ Emocional | ○○◆○○ |
| Conservador ←→ Inovador | ○○○◆○ |
| Econômico ←→ Gastador | ○○◆○○ |
| Planejador ←→ Impulsivo | ○○○◆○ |

**Um dia na vida**
Abre às 5h30 para a primeira turma. Dá aula até as 9h. Entre 9h e 11h faz o que chama de "parte chata": responde WhatsApp de aluno, confere quem não pagou, manda mensagem para dois ou três com jeitinho. Almoça em casa, volta às 16h, dá aula até as 21h. Fecha o box, senta no carro e olha o app do banco. Sabe que entrou menos do que deveria. Não abre a planilha porque está cansado e porque não quer confirmar.

**Valores e crenças**
- Comunidade acima de contrato. Os alunos são amigos, e isso é o negócio.
- Trabalho duro resolve quase tudo — o que também é a raiz do problema, porque ele resolve na força em vez de resolver na estrutura.
- Desconfia de solução mágica e de vendedor com planilha de projeção.

**Objetivos**
- 6 meses: parar de perder aluno por motivo que não é o treino
- 1–2 anos: abrir a segunda unidade sem duplicar a bagunça
- 5+ anos: viver do negócio sem precisar dar todas as aulas

**Dores**

| Dor | Intensidade | Contexto |
|---|---|---|
| Cobrar amigo é constrangedor | 🔴 Alta | Todo dia 10, quando a lista de inadimplentes aparece |
| Não sabe o custo real da cobrança | 🔴 Alta | Permanente, e invisível justamente por isso |
| Aluno some e ele descobre 45 dias depois | 🔴 Alta | Quando revisa a frequência e cruza com o pagamento |
| Depende da recepcionista para tudo de financeiro | 🟡 Média | Fica exposto nas férias dela |

**Medos e objeções**
- Medo 1: pedir para 320 pessoas mudarem de forma de pagamento e 60 aproveitarem para cancelar
- Medo 2: parecer que virou "empresa" e perder o clima de comunidade
- Objeção 1: mais uma mensalidade de software para um negócio que já paga cinco
- Objeção 2: "não tenho tempo de implantar nada agora"

**Jobs to be done**
- Funcional: "Quando fecho o mês, quero saber onde vazou, para corrigir em vez de reclamar."
- Emocional: "Quando penso no financeiro, quero me sentir no controle, para não ter medo de olhar."
- Social: "Quando falo com minha esposa sobre o box, quero mostrar que virei gestor, para justificar as horas que passo lá."

**Comportamento digital**

| Canal | Frequência | Como usa | Pico |
|---|---|---|---|
| Instagram | Diário | Posta o box, consome conteúdo de gestão de academia | 21h–23h |
| WhatsApp | Constante | É o sistema de gestão dele de verdade | Manhã e noite |
| Google | Quando trava | Busca solução pontual de problema | Variável |
| YouTube | 2–3x/semana | Conteúdo de gestão e de treino | Noite |
| Grupos de donos de box | Diário | Onde confia mais que em qualquer anúncio | Noite |
| E-mail | Semanal | Abre pouco, mas lê o que vem de fornecedor | Manhã |
| LinkedIn | Raro | Não é o ambiente dele | — |

**Influenciadores de decisão**
- Pessoas: outro dono de box que ele respeita; o contador; a esposa (quando é despesa nova)
- Canais: grupo de WhatsApp de donos, perfis de gestão de academia
- Gatilhos: um mês ruim; um aluno bom que cancelou por bobagem; ver o número somado

**Relação com o segmento**
- Experiências anteriores: já testou dois sistemas de gestão, abandonou um por complexidade
- Expectativas: mínimo é funcionar sem ele; "wow" é o número aparecer sozinho
- Critérios de escolha: (1) não dá trabalho para implantar, (2) prova com número, (3) preço justificável
- Ticket: paga hoje entre R$ 200 e R$ 600/mês em software

**Como a marca se conecta**
- Mensagem ideal: "Você não perdeu 12 alunos. Você perdeu 12 pagamentos que ninguém viu quebrar."
- Tom: direto, sem infantilizar, sem jargão financeiro
- Canal prioritário: Instagram + indicação em grupo de donos
- Conteúdo que engaja: contas feitas na tela, bastidor de operação, opinião forte sobre taxa
- Oferta irresistível: **o diagnóstico da base dele, com o número dele, em 10 minutos, sem contrato**

---

### Persona 2 — SIMONE, a gestora que opera de verdade `[H]`

> *"Eu sei exatamente quem está devendo. O que eu não consigo é fazer todo mundo mudar de método sem virar uma guerra."*

| Campo | Detalhe |
|---|---|
| Idade | 46 anos |
| Gênero | Feminino |
| Estado civil | Divorciada |
| Filhos | 1 (17 anos) |
| Profissão | Gerente administrativo-financeira de escola de idiomas com 740 alunos |
| Renda mensal | R$ 8.500 |
| Escolaridade | Superior em Administração, pós em Gestão Financeira |
| Localização | Capital, zona sul |

**Personalidade**

| Traço | Nível |
|---|---|
| Introvertido ←→ Extrovertido | ○○◆○○ |
| Racional ←→ Emocional | ◆○○○○ |
| Conservador ←→ Inovador | ○◆○○○ |
| Econômico ←→ Gastador | ◆○○○○ |
| Planejador ←→ Impulsivo | ◆○○○○ |

**Um dia na vida**
Chega às 8h. Primeira coisa: conciliação do dia anterior — abre o painel do gateway, exporta CSV, cruza com o sistema acadêmico. Às 10h atende pai que quer negociar. Meio-dia, almoço na mesa. Tarde: fechamento, relatório para a diretoria, cobrança da régua de inadimplência. Sai às 18h com a sensação de que passou o dia conferindo em vez de resolvendo.

**Valores e crenças**
- Processo bem-feito é o que separa organização de improviso
- Não confia em número que ela não consegue reproduzir
- Acredita que ela é a última linha de defesa contra o caos

**Objetivos**
- 6 meses: reduzir a inadimplência de 9% para menos de 5%
- 1–2 anos: sair do trabalho de conferência e virar analista de verdade
- 5+ anos: diretoria financeira

**Dores**

| Dor | Intensidade | Contexto |
|---|---|---|
| Conciliação manual consome 2h/dia | 🔴 Alta | Todo dia útil |
| Boleto tem taxa alta e adesão baixa | 🔴 Alta | Mais da metade da base |
| Diretoria pede número que ela não tem pronto | 🟡 Média | Reunião mensal |
| Ninguém mais na escola sabe fazer o que ela faz | 🟡 Média | Latente até ela tirar férias |

**Medos e objeções**
- Medo 1: implantar algo novo e ser responsabilizada se der errado
- Medo 2: automatizar e perder o controle sobre exceções (bolsista, irmão com desconto, acordo)
- Objeção 1: "meu sistema acadêmico já faz cobrança"
- Objeção 2: LGPD — ela é quem responde se algo vazar

**Jobs to be done**
- Funcional: "Quando fecho o mês, quero um relatório pronto, para parar de montar planilha."
- Emocional: "Quando a diretoria pergunta, quero me sentir preparada, para não parecer que não domino minha área."
- Social: "Quando apresento o resultado, quero ser vista como quem trouxe a melhoria, para justificar minha promoção."

**Como a marca se conecta**
- Mensagem ideal: "O relatório que sua diretoria pede, pronto todo dia 1º. Com a economia acumulada e a inadimplência antes e depois."
- Tom: técnico, preciso, com número verificável
- Canal prioritário: LinkedIn, e-mail, indicação profissional
- Conteúdo que engaja: comparativos, planilhas de cálculo abertas, conteúdo sobre LGPD e conformidade
- Oferta irresistível: **um piloto controlado em um segmento da base**, com relatório que ela leva para a diretoria

---

### Persona 3 — RAFAEL, o parceiro de canal `[H]`

> *"Eu já implanto sistema para 40 academias. Se isso funcionar, eu levo para todas."*

| Campo | Detalhe |
|---|---|
| Idade | 33 anos |
| Profissão | Consultor/implantador de sistemas para academias e clínicas |
| Renda mensal | R$ 18.000, variável |
| Localização | Atende remoto, base em capital |

**Por que existe nesta lista**
Não é o comprador do produto, mas é o multiplicador. Ele já tem a confiança do Marcelo e o acesso à base da Simone. Uma indicação dele vale trinta anúncios.

**O que ele precisa da marca**
- Não ser passado para trás na relação com o cliente
- Material que ele possa apresentar como se fosse dele (o diagnóstico com a marca da organização, RF-34, resolve isso)
- Comissão ou modelo de parceria claro
- Não ter que virar suporte técnico

**Como a marca se conecta**
- Mensagem ideal: "Você leva o diagnóstico. A gente opera a migração. O cliente continua sendo seu."
- Risco: se a marca for arrogante ou disputar a relação, ele vira concorrente em vez de canal

---

### Anti-persona — O CAÇADOR DE GATEWAY

> Tão importante quanto saber para quem se fala é saber para quem não se fala.

**Quem é:** o desenvolvedor ou gestor técnico que chega procurando taxa de gateway, integração direta e SDK. Quer comparar MDR, negociar tarifa, integrar por conta própria.

**Por que NÃO é público:**
- Ele quer infraestrutura; a Pulse vende operação. São produtos diferentes.
- Ele tem equipe técnica — ou seja, tem exatamente o recurso que o público real não tem.
- A negociação dele é sobre preço por transação, num modelo em que a Pulse não compete e não vence.
- Atendê-lo empurra o roadmap para virar gateway, que é o que a seção 1 dos requisitos proíbe explicitamente.

**Como identificar rápido:**
- Pergunta "qual a taxa de vocês por transação?" antes de perguntar o que o produto faz
- Pergunta pela documentação da API na primeira conversa
- Fala "mandate", "webhook", "MDR" com naturalidade

**O que fazer quando aparece:**
Ser direto e útil. "A gente não é gateway — o dinheiro nunca passa por nós. Se você tem time técnico e quer integrar direto no Asaas, essa é a rota mais barata e a gente te diz isso. A Pulse existe para quem não tem esse time e precisa migrar uma base de 400 pessoas." Recusar bem constrói mais reputação do que atender mal.

---

## 2.4 Validação de Personas

- [ ] Baseadas em dados reais (não suposições) — **pendente: hoje são hipóteses derivadas dos requisitos**
- [ ] Pelo menos 2 fontes cruzadas (quanti + quali)
- [ ] Equipe de vendas reconhece esses perfis
- [ ] Personas cobrem pelo menos 80% do faturamento
- [x] Anti-persona definida
- [x] Jobs to Be Done claros por persona
- [x] Jornada de compra mapeada

**Gatilho de revisão:** ao atingir 10 clientes pagantes, este bloco inteiro é reescrito com dado. Antes disso, tratar como andaime — útil para decidir, insuficiente para investir pesado em mídia.

**Plano de atualização**

| Ação | Frequência | Responsável |
|---|---|---|
| Revisão completa das personas | Semestral | Guardião da marca |
| Análise de comportamento na base | Mensal | Produto |
| Entrevistas com clientes | Trimestral | Fundador |
| Validação com quem vende | Mensal | Comercial |

**Métricas por persona** *(preencher a partir do primeiro trimestre com base ativa)*

| Métrica | Marcelo | Simone | Rafael (canal) |
|---|---|---|---|
| % do faturamento | | | |
| CAC | | | |
| LTV | | | |
| Taxa de conversão do diagnóstico em contrato | | | |
| NPS | | | |
| Churn | | | |

---
---

# FASE 3 — ESTRATÉGIA

## 3.1 Tendências e Contexto (PESTEL)

**POLÍTICO**
Oportunidades: o Banco Central é ator ativo e interessado na adoção do Pix Automático; a agenda evolutiva do Pix trata a modalidade como substituta do débito em conta. Política pública alinhada a favor do produto é raro e vale explorar na comunicação.
Ameaças: dependência de decisão regulatória alheia; qualquer mudança de prioridade do BC muda o timing do mercado.

**ECONÔMICO**
Contexto: MDR de cartão recorrente entre 2% e 3,5% conforme bandeira e plano, mais antecipação em operações D+30. Débito automático bancário entre R$ 0,80 e R$ 2,50 por transação, mas com exigência de convênio banco a banco. Pix Automático se posiciona entre os dois: tarifa por transação na casa de centavos, sem convênio.
Impacto: **a diferença de custo é a matemática inteira do produto.** Numa base de 400 contratos de R$ 250, a diferença entre 3% de MDR e alguns centavos por transação passa de R$ 3.500 por mês. Essa conta é o argumento de venda, e é ela que o RF-31 automatiza.

**SOCIAL**
Tendências: o brasileiro já normalizou o Pix — 83,4% da população usou em 2025. A fricção cultural com autorização recorrente no app do banco é baixa, e o dado de 73% de adesão quando a solicitação chega no app confirma. O que não está normalizado é o negócio *pedir* a migração.
Oportunidade: a marca pode ocupar o papel de quem dá permissão e método para pedir.

**TECNOLÓGICO**
Emergentes: adapters de Pix Automático já publicados pelos principais gateways; WhatsApp Business API como canal de massa regulamentado; automação de régua com IA.
Ameaças: **o risco central da marca.** Se um gateway ou ERP vertical embutir a operação de migração, a camada some. O tempo de vantagem é medido em trimestres, não em anos.

**ECOLÓGICO**
Baixa relevância direta. Argumento secundário legítimo: eliminação de boleto impresso e de deslocamento para pagamento. Não construir posicionamento sobre isso — soaria oportunista num produto financeiro.

**LEGAL**
Regulamentações: Resolução BCB 384/2024 rege o Pix Automático, incluindo o requisito de aviso prévio ao pagador (que o RF-60 já contempla). LGPD rege o tratamento dos dados do pagador. As regras da Meta regem o disparo de mensagens em WhatsApp — a categoria Utility exige aprovação de template e é a rota correta para aviso de cobrança.
Riscos: disparo em massa sem opt-in registrado é o risco existencial da operação. Bloqueio de número por denúncia derruba a régua inteira e é irreversível na prática.
**Consequência para a marca:** conformidade não é rodapé jurídico, é atributo de posicionamento. Ver 3.3 e 4.2.

**Tendências do setor**
- Visual: o segmento de fintech B2B brasileiro está saturado de azul-turquesa com gradiente, ilustração isométrica e mascote. Há espaço claro para densidade sóbria e monocromia com acento único.
- Conteúdo: conta feita na tela, comparativo aberto, bastidor de operação. O formato que mais converte para este público é o cálculo demonstrado, não a promessa.
- Experiência: expectativa crescente de que a ferramenta avise em vez de esperar consulta. "Fila que me procura" venceu "relatório que eu procuro".

---

## 3.2 Síntese de Insights

**Insight 1 — O gargalo é operação, não tecnologia**
- Descoberta: a adesão ao Pix Automático foi tímida no primeiro semestre de produção, apesar de 73% de autorização entre quem recebe a solicitação no app do banco.
- Fonte: dados públicos de mercado e do BC
- Implicação: o produto não vende tecnologia. Vende a operação de convite em massa que ninguém está fazendo.
- Ação: toda a comunicação de topo se posiciona contra "a API que ninguém usou", não contra concorrentes.

**Insight 2 — A perda é invisível porque é distribuída**
- Descoberta: nenhum operador perde 4% de uma vez. Perde 3% de taxa aqui, um boleto ali, um cliente que sumiu por cartão vencido.
- Fonte: estrutura de custo do mercado + comportamento observado `[H]`
- Implicação: o inimigo da marca não é o cartão nem o gateway. É a **invisibilidade da perda.**
- Ação: o diagnóstico é o produto de entrada, o conteúdo de topo e o ato fundador da marca. Ele existe para tornar visível.

**Insight 3 — O medo real não é gastar, é perder cliente**
- Descoberta: a objeção dominante à migração não é preço da ferramenta, é risco de churn no processo `[H]`
- Fonte: hipótese a validar em entrevista (bloco "A migração")
- Implicação: prova de adesão vale mais que desconto. Case com percentual de autorização é o ativo comercial mais valioso.
- Ação: construir e publicar o banco de "antes e depois" desde o primeiro cliente (Storyline 3).

**Insight 4 — O churn involuntário é o dano maior e o menos discutido**
- Descoberta: cartão vencido, saldo insuficiente e boleto esquecido derrubam clientes que não queriam sair.
- Fonte: padrão conhecido de assinaturas; validar magnitude na base-piloto
- Implicação: a Pulse não vende economia de taxa. Vende **cliente que não some por acidente.** A economia é a prova; a retenção é o valor.
- Ação: reordenar a hierarquia da mensagem — retenção primeiro, economia como evidência.

**Insight 5 — A relação é com o pagador, e a marca quase não aparece nela**
- Descoberta: o pagador vê uma mensagem e uma página, uma vez na vida (RF-50 a RF-56).
- Implicação: a identidade dessa superfície pertence à organização, não à Pulse. A marca precisa de discrição deliberada ali.
- Ação: modelo de assinatura discreta na página de autorização; ver 3.4 e 5.1.

**Insight 6 — Conformidade é diferencial competitivo, não custo**
- Descoberta: LGPD e regras da Meta são o ponto onde soluções caseiras quebram, e é onde a Simone é pessoalmente responsabilizada.
- Implicação: registro de opt-in com timestamp e origem (RF-47) é argumento de venda, não linha de requisito.
- Ação: falar de conformidade abertamente, com clareza, sem tom jurídico.

**Insight 7 — A camada é fina e copiável**
- Descoberta: nada impede um gateway de lançar migração assistida.
- Implicação: o fosso não é técnico. É de marca e de dado acumulado de conversão por nicho.
- Ação: acumular e publicar benchmark de adesão por segmento. Quem tem o número vira referência, e referência é difícil de copiar.

**Insight 8 — O vocabulário é metade do produto**
- Descoberta: os requisitos já determinam "vocabulário do usuário, não do sistema" (seção 11).
- Implicação: o tom de voz não é camada decorativa aplicada depois. É requisito funcional.
- Ação: o glossário de tradução (4.3) é documento de engenharia, não de marketing.

### Direcionamentos

**A marca DEVE**
1. ✅ Liderar com o número da perda, não com a lista de funcionalidades
2. ✅ Assumir publicamente que não é gateway, e dizer isso antes que perguntem
3. ✅ Tratar o gateway como parceiro e nunca como inimigo — o inimigo é a perda silenciosa
4. ✅ Traduzir todo jargão técnico para a língua do operador, sempre, sem exceção
5. ✅ Publicar dado de adesão real, inclusive quando for ruim
6. ✅ Sumir na superfície do pagador e aparecer na superfície do operador

**A marca NÃO DEVE**
1. ❌ Prometer percentual de adesão antes de ter o próprio número
2. ❌ Usar linguagem de urgência artificial ou escassez fabricada num produto financeiro
3. ❌ Se posicionar como "o novo jeito de receber" — isso é promessa de gateway e cria expectativa errada
4. ❌ Falar "aluno", "paciente" ou "morador" no domínio — o produto é agnóstico e a marca também
5. ❌ Vender pelo medo do concorrente. Vender pela clareza do próprio número
6. ❌ Adotar estética de fintech genérica: gradiente, ilustração isométrica, azul-turquesa, mascote

---

## 3.3 Posicionamento

### Brand Key

```
              ESSÊNCIA DA MARCA
          Recorrência que não quebra
                     ↑
          VALORES E PERSONALIDADE
    Direta · Precisa · Vigilante · Traduzida
                     ↑
           BENEFÍCIOS EMOCIONAIS
   Controle no lugar de tolerância. O operador
   deixa de temer o próprio número e passa a usá-lo
                     ↑
           BENEFÍCIOS FUNCIONAIS
   Vê quanto perde · Migra a base sem perder cliente
   · Sabe no mesmo dia quando a autorização quebra
                     ↑
                  ATRIBUTOS
   Camada sobre gateway (não substitui) · Agnóstica
   de nicho · Diagnóstico em minutos · Régua operada
   · Alerta no mesmo dia · Multi-gateway
                     ↑
             INSIGHT DO PÚBLICO
   "Todo mês entra menos do que deveria e eu não sei
   exatamente por quê — e já desisti de descobrir."
```

### Declaração de posicionamento

> Para **negócios que vivem de mensalidade e não têm equipe técnica**,
> que **perdem receita com taxa alta e com cobrança que quebra sem ninguém ver**,
> a **Pulse** é a **camada de operação sobre o gateway que a empresa já usa**,
> que **mostra quanto se perde hoje, migra a base para Pix Automático sem perder cliente no caminho e avisa no mesmo dia quando uma autorização quebra**,
> diferentemente de **gateways, que entregam a API e encerram a responsabilidade ali, e de ERPs verticais, para quem cobrança é módulo e não missão**,
> porque **nossa única função é manter a recorrência viva — e cada funcionalidade passa pelo filtro de ajudar a migrar ou a manter a autorização viva, ou fica fora.**

### Mantra de marca

> ## "Pulso firme na recorrência."

**Significado:** *Pulso* é o batimento — a mensalidade que entra todo mês no mesmo ritmo. *Firme* é a promessa: o batimento não falha, e quando falha alguém sabe na hora. A expressão já existe em português como sinônimo de controle e autoridade, que é exatamente o estado que o operador quer alcançar e não tem hoje.

**Versão de uma palavra, para uso interno:** **Sustentar.**

---

## 3.4 Arquitetura e Naming

### Modelo de arquitetura

- [ ] Casa de Marcas
- [ ] Marca Endossada
- [x] **Monolítica**
- [ ] Híbrida

**Justificativa:** o produto tem uma promessa, um público comprador e uma superfície. Não há razão para submarca. O diagnóstico, a onda e a fila de atenção são funcionalidades nomeadas dentro do produto, não marcas.

### Estrutura

```
PULSE
  ├── Diagnóstico     — o relatório de perda (RF-30 a RF-34)
  ├── Ondas           — as campanhas de migração (RF-40 a RF-48)
  ├── Atenção         — a fila de retenção (RF-70 a RF-73)
  └── Conexões        — os gateways integrados (RF-10 a RF-16)
```

| Divisão | Nome oficial | Tagline |
|---|---|---|
| Principal | Pulse | Pulso firme na recorrência |
| Módulo | Diagnóstico Pulse | Veja onde está vazando |
| Módulo | Ondas | — |
| Módulo | Atenção | — |

**Regra:** os módulos são substantivos comuns em português e nunca recebem tratamento de marca própria (sem logo, sem cor exclusiva, sem tipografia diferente). São seções, não produtos. A única exceção é o **Diagnóstico Pulse**, que sai da plataforma como PDF e precisa carregar a assinatura.

### Avaliação do nome — PULSE

| Critério | Nota | Comentário |
|---|---|---|
| Significativo | ⭐⭐⭐⭐⭐ | Três sentidos em português, e os três são o produto: *tomar o pulso* (diagnóstico), *o batimento regular* (recorrência), *pulso firme* (controle e retenção) |
| Diferenciado | ⭐⭐⭐⭐ | Fora do padrão do setor — não usa pag/fin/pay/bank. Perde uma estrela pela adjacência com health-tech, que o contexto financeiro dissolve rápido |
| Memorável | ⭐⭐⭐⭐⭐ | Duas sílabas, palavra corrente, imagem mental imediata |
| Pronunciável | ⭐⭐⭐⭐⭐ | Soletra no telefone sem repetir |
| Disponibilidade | ⭐⭐⭐ | **A verificar antes de qualquer registro.** Palavra comum tende a ter .com.br ocupado. Rotas: `pulse.app`, `usepulse.com.br`, `pulse.finance`, `sopulse.com.br`. INPI classe 42 e 36 exigem busca. Handles sociais: `@pulse.app` ou `@usepulse` |
| Escalável | ⭐⭐⭐⭐⭐ | Não amarra ao Pix nem ao Automático. Se a categoria evoluir para outro método, o nome sobrevive intacto |

**Decisão:** ✅ **Adotar Pulse** — grafia em inglês, decidida pelo fundador em 04/08/2026. Substitui o nome de trabalho "Perene" usado no repositório e no `PLAN.md`. Continua condicionado à verificação de disponibilidade de domínio e marca (Anexo B, pendência 1).

**O que a grafia em inglês custa, e o que fazer com isso**

A avaliação acima foi escrita para a grafia portuguesa. Com "Pulse", dois dos três sentidos deixam de soletrar a marca: *tomar o pulso* e *pulso firme* continuam sendo as ideias do produto, mas não são mais a palavra do logotipo. O que sobrevive intacto é o sentido central — **o batimento** —, que é o que o símbolo de quatro barras representa e o que a Big Idea usa ("Sua receita tem um pulso"). Em compensação, a grafia em inglês melhora a disponibilidade de domínio e a leitura internacional.

Consequência prática, já aplicada neste documento:

- O **logotipo** é `pulse`, caixa baixa, Archivo Semibold.
- O **mantra continua "Pulso firme na recorrência"**, com o substantivo em português. É idiomatismo, não assinatura de marca — "Pulse firme" não existe em português e leria como erro. A marca assina *Pulse*; a frase fala *pulso*.
- A **Big Idea** ("Sua receita tem um pulso") não muda: usa o substantivo comum, e o trocadilho com o nome continua funcionando na leitura.

Se essa convivência entre a grafia inglesa da marca e o substantivo português na copy incomodar, a alternativa é trocar o mantra por uma formulação que não dependa do idiomatismo — *"Ritmo firme na recorrência"* é a candidata mais próxima. Decisão do Guardião da Marca; não bloqueia nada.

### Registro do arco de naming

Duas alternativas foram desenvolvidas e descartadas. Ficam documentadas porque a lógica pode ser reaproveitada em submarcas futuras.

**Cadência** — a metáfora do ritmo. Cobre bem migração (colocar todos no mesmo passo) e sustentação (manter o compasso), e a régua D0/D+2/D+5/D+10 é literalmente uma cadência. **Descartada** porque não cobre o diagnóstico: cadência não é um ato de medição, é um estado. E o diagnóstico é o produto de entrada — o nome precisava tocá-lo.

**Travessia** — a metáfora da migração, com peso literário e brasileiro. **Descartada** por ser um nome de evento, não de estado permanente. Travessia acaba; a operação da Pulse não. Descreveria bem a Fase 1 do produto e envelheceria mal na Fase 3.

**Pulse** venceu porque *tomar o pulso* é simultaneamente diagnóstico e monitoramento contínuo — os dois trabalhos que os outros dois nomes só cobriam pela metade.

### Questão de arquitetura em aberto

Este brand book assume **Pulse como marca independente**, sem vínculo com a Aprumo.

O motivo é estrutural: a Aprumo opera em modelo white-label, onde a marca desaparece atrás do escritório contábil e assina como ingrediente. A Pulse opera como marca direta, vendida ao operador, que precisa vê-la e lembrar dela. Endossar uma na outra criaria uma marca-mãe com dois comportamentos incompatíveis — presente aqui, invisível ali — e enfraqueceria as duas.

**Se a decisão for outra**, o impacto se concentra em 3.3, 3.4 e 5.1, e o nome precisa ser reavaliado à luz do sistema Aprumo.

### Nota sobre a superfície do pagador

Há um segundo problema de assinatura, análogo mas menor: a página de autorização (RF-50 a RF-56) carrega o logo e a cor da organização (RF-05). A Pulse precisa estar ali para credibilidade — o pagador está prestes a autorizar débito na conta e precisa saber que existe um sistema por trás — mas não pode competir.

**Solução:** assinatura discreta no rodapé, em texto, sem símbolo colorido:

> `Autorização processada com segurança por **Pulse**`

Tamanho máximo: 12px. Cor: `--pl-texto-fraco`. Nunca acima do botão. Nunca com o símbolo em cor primária.

---

## 3.5 Narrativa e Mensagens-Chave

### Mensagem central (Big Idea)

> # "Sua receita tem um pulso. A gente não deixa ele parar."

**Versão curta para bio e assinatura:** *Pulso firme na recorrência.*
**Versão funcional para SEO e anúncio:** *Migre sua base para Pix Automático sem perder cliente no caminho.*

### Pilares de mensagem

**PILAR 1 — REVELAR**
- Mensagem: você não decide sobre o que não vê. A primeira coisa que a Pulse faz é somar a perda que está distribuída e mostrar num número só.
- Proof points: diagnóstico gerado a partir da base importada em menos de 10 minutos (RF-30, fluxo 9.1); custo atual por método com tarifa parametrizável (RF-31); falha de cobrança dos últimos 12 meses em quantidade e valor (RF-32); projeção por cenário de adesão de 50%, 70% e 90% (RF-33)
- Tom: factual, quase frio. O número já é dramático o suficiente; qualquer adjetivo o enfraquece.

**PILAR 2 — MIGRAR**
- Mensagem: ninguém migra 400 pessoas sozinho. A tecnologia já existe há mais de um ano — o que não existia era a operação de convidar, lembrar, acompanhar e não desistir.
- Proof points: onda com segmentação por método, faixa de valor e histórico de falhas (RF-40); ordem sugerida priorizando quem mais falha (RF-41); régua D0/D+2/D+5/D+10 configurável, interrompida no instante da autorização (RF-43, RF-44); limite diário para não parecer spam (RF-42); página de autorização de uma tela e um botão, sem login (RF-51, RF-55); dado de mercado de 73% de adesão quando a solicitação chega no app do banco
- Tom: prático, de quem já fez. Detalhe operacional é a prova aqui.

**PILAR 3 — SUSTENTAR**
- Mensagem: autorização não é troféu, é estado. Ela quebra — por cancelamento, por reajuste que estoura o teto, por falha repetida. A diferença entre perder o cliente e recuperá-lo é saber no mesmo dia.
- Proof points: cancelamento detectado por webhook gera evento de risco no mesmo dia (RF-65); alerta ao operador por e-mail e WhatsApp, sem precisar de app (RF-72); fila "Precisa de atenção" com ação clara por item (RF-70, RF-71); Pix avulso oferecido ao pagador no momento da falha (RF-64); detecção de estouro de teto no reajuste com fluxo de reautorização (RF-66)
- Tom: vigilante, sem alarmismo. Quem cuida bem não grita.

**Hierarquia de uso:** em conteúdo de topo, REVELAR primeiro — é o que gera o clique. Em conversa comercial, MIGRAR — é onde mora a objeção. Em retenção e renovação, SUSTENTAR — é onde o valor se prova ao longo do tempo.

### Framework de storytelling

Estrutura obrigatória para landing, e-mail, vídeo e deck:

1. **SITUAÇÃO** — Você tem uma base de clientes que paga todo mês. Na teoria, receita previsível.
2. **PROBLEMA** — Na prática, uma parte não entra. Taxa que come, cobrança que falha, cliente que some sem avisar. E o pior: você não sabe o tamanho, porque a perda vem distribuída em pedaços pequenos demais para doer.
3. **SOLUÇÃO** — A Pulse soma a perda, migra sua base para Pix Automático com uma operação de convite que funciona, e vigia a autorização depois.
4. **TRANSFORMAÇÃO** — Você para de descobrir problema no fechamento do mês e passa a saber no mesmo dia. A taxa cai de porcentagem para centavos. E o cliente que ia sumir por acidente, não some.
5. **CONVITE** — Comece pelo número. Rode o diagnóstico da sua base.

**Regra de ouro da narrativa:** o herói é o operador. A Pulse é mentor, nunca protagonista. Toda peça em que a Pulse é a heroína está errada.

---

## 3.6 Experiência de Marca

### Atributos de experiência

Como queremos que as pessoas se sintam:

1. **No controle** — o oposto exato do estado inicial do Marcelo
2. **Informado antes, não depois** — a marca chega antes do problema virar prejuízo
3. **Respeitado** — nem o operador nem o pagador são tratados como leigos ou como devedores

### As duas superfícies

| | Painel do operador | Página do pagador |
|---|---|---|
| Frequência | Diária, por anos | Uma vez |
| Densidade | Alta — tabelas, números, filtros | Mínima — uma tela, um botão |
| Marca visível | Pulse, integralmente | Da organização; Pulse discreta no rodapé |
| Objetivo | Dar controle | Remover atrito |
| Erro fatal | Esconder informação | Pedir uma decisão a mais |

Tratar as duas com o mesmo sistema é o erro mais provável do projeto. Elas compartilham tokens e tipografia; não compartilham densidade nem hierarquia.

### Pontos de contato

**ANTES — descoberta**

| Ponto | Gap típico do mercado | Experiência desejada | Ação |
|---|---|---|---|
| Busca Google | Conteúdo genérico sobre "o que é Pix Automático" | Conteúdo que faz a conta com o número dele | Calculadora pública de perda, sem cadastro |
| Instagram | Fintech falando com developer | Conta feita na tela, em 40 segundos | Formato fixo de Reels: "a conta que ninguém fez" |
| Indicação em grupo | Nada compartilhável | O PDF de diagnóstico circula sozinho | RF-34 com marca da organização, feito para ser encaminhado |
| Site | Lista de funcionalidades | Um número e um botão | Landing de uma promessa só |

**DURANTE — experiência**

| Ponto | Momento | Experiência desejada | Ação |
|---|---|---|---|
| Onboarding | Cadastro até o diagnóstico | Menos de 10 minutos até o número na tela (meta do fluxo 9.1) | Cortar todo campo que não bloqueia o diagnóstico |
| Revisão de duplicados | Antes do diagnóstico | Nunca resolver silenciosamente (RF-23) | Fila de revisão com contexto, não modal de erro |
| Primeira onda | Disparo | Ver o medidor subir em tempo real (RF-48) | Realtime no painel; é o momento "aha" nº 2 |
| Falha de cobrança | Quando quebra | O pagador recebe solução, não cobrança (RF-64) | Mensagem com Pix avulso, tom sem culpa |
| Alerta de risco | Mesmo dia | O operador sabe antes do cliente sumir (RF-65, RF-72) | E-mail + WhatsApp, com ação em um toque |

**DEPOIS — pós-venda**

| Ponto | Timing | Conteúdo | Canal |
|---|---|---|---|
| Confirmação da primeira autorização | Imediato | "A primeira já entrou" — celebrar o marco | Painel + e-mail |
| Fechamento da onda | D+10 | Resultado: quantos migraram, quanto isso vale por mês | E-mail + PDF |
| Resumo diário | Diário, opcional | O que aconteceu nas últimas 24h (RF-73) | E-mail |
| Relatório mensal | Dia 1º | Economia acumulada, % migrada, inadimplência antes × depois (RF-80) | E-mail + PDF |
| Reengajamento do pool | Mensal | Contratos que não autorizaram voltam elegíveis (RF-45) | Notificação no painel |

### Momentos da verdade

**Momento 1 — O número aparece**
- O que acontece: o diagnóstico termina de calcular e o operador vê pela primeira vez quanto perde por mês.
- Por que é crítico: é o instante em que a marca prova que existe. Se demora ou se o número parece inventado, não há segunda chance.
- Como garantir: agregações em views materializadas (requisito não funcional de desempenho); número sempre acompanhado da memória de cálculo — o operador precisa poder reproduzir.

**Momento 2 — O primeiro pagador autoriza**
- O que acontece: a primeira autorização entra e o medidor sai do zero.
- Por que é crítico: dissolve o medo nº 1 (medo de perder cliente). Um único "sim" muda a psicologia do operador.
- Como garantir: notificar o primeiro imediatamente e com destaque. Depois, agregar.

**Momento 3 — A primeira cobrança falha**
- O que acontece: um débito não passa, por saldo insuficiente.
- Por que é crítico: é o teste da promessa. Se a Pulse só reporta a falha, é relatório. Se resolve, é operação.
- Como garantir: mensagem ao pagador com Pix avulso disparada no mesmo minuto, antes de o operador saber. O operador descobre o problema e a solução juntos.

**Momento 4 — Uma autorização é cancelada**
- O que acontece: o pagador cancela no app do banco.
- Por que é crítico: é o único evento que a Pulse não pode prevenir — só pode detectar rápido. É onde o Pilar 3 se prova ou desmorona.
- Como garantir: alerta no mesmo dia, com o nome, o valor e o botão de reenviar autorização. Nunca um alerta genérico.

**Momento 5 — O mês em que nada acontece**
- O que acontece: a base está migrada, tudo entra, a fila de atenção está vazia.
- Por que é crítico: é o momento de maior risco de churn da Pulse. Valor invisível parece valor inexistente. "Não está acontecendo nada, para que eu pago isso?"
- Como garantir: **o relatório mensal existe para este momento.** Ele precisa mostrar a economia acumulada e as falhas evitadas — o que não aconteceu é o produto. É também a base do RF-82 e do modelo de cobrança sobre economia comprovada.

---

## 3.7 Aprovação Estratégica

- [ ] Liderança alinhada com o posicionamento
- [ ] Mensagens testadas com amostra do público
- [ ] Naming finalizado — **bloqueado até verificação de domínio e INPI**
- [x] Jornada de experiência mapeada
- [ ] Budget e cronograma aprovados
- [ ] KPIs definidos

**KPIs propostos**

| KPI | Meta inicial |
|---|---|
| Tempo do cadastro ao diagnóstico | < 10 min |
| Taxa de autorização por onda | > 60% |
| Tempo entre cancelamento e alerta | < 24h |
| % da base migrada em 90 dias | > 50% |
| Diagnósticos compartilhados por cliente | > 1 |

| Nome | Cargo | Data | Assinatura |
|---|---|---|---|
| | | | |

---
---

# FASE 4 — DNA DA MARCA

## 4.1 História de Origem

**Ano:** 2026
**Fundador:** Leandro F.

### A motivação

Em junho de 2025 o Banco Central colocou o Pix Automático em produção. A promessa era grande: débito em conta sem convênio bancário, tarifa em centavos, disponível para qualquer empresa, inclusive MEI. Uma alternativa real ao cartão recorrente, que come entre 2% e 3,5% de cada mensalidade, e ao boleto, que ninguém paga no prazo.

Um ano depois, quase ninguém tinha migrado.

Não porque a tecnologia falhou — ela funciona. Não porque as pessoas rejeitaram — quando o pedido chega no app do banco, sete em cada dez autorizam. Ninguém migrou porque migrar uma base é um trabalho que ninguém queria fazer. O gateway publicou o endpoint e considerou o problema resolvido. Do outro lado, um dono de academia com 320 alunos olhou para aquilo e pensou: e agora, eu ligo para 320 pessoas?

### Os desafios

O primeiro desafio foi de disciplina. Todo produto que toca pagamento é puxado a virar gateway — é onde parece estar o dinheiro. Resistir a isso exigiu escrever no documento de requisitos, antes de qualquer linha de código, o que o produto **não** é: não é gateway, não é ERP, não é emissor fiscal, não é CRM. E instituir um filtro para toda funcionalidade candidata: *isso ajuda a migrar ou a manter a autorização viva?* Se não, fica fora.

O segundo foi de escopo. Cada nicho — academia, escola, clínica, condomínio — tem uma linguagem própria e pede um sistema próprio. A tentação de verticalizar era grande e teria sido mais fácil de vender. A decisão foi o contrário: o domínio nunca diz "aluno" nem "paciente". Diz Organização e Pagador. A adaptação de nicho acontece num único lugar, um rótulo configurável. Nada de schema diferente por vertical.

O terceiro é o que ainda não acabou: convencer alguém a apostar num produto que fica no meio, sem processar o dinheiro e sem gerenciar o negócio.

### O ponto de virada

A virada não foi técnica. Foi uma conta.

Uma base de 400 contratos de R$ 250 no cartão recorrente. A 3% de MDR, são R$ 3.000 por mês só de taxa — R$ 36.000 por ano. No Pix Automático, a mesma operação custa alguns centavos por transação. E o operador dessa base nunca tinha somado. Não porque não sabe fazer conta: porque a perda nunca chega junta. Chega em pedaços pequenos demais para doer.

**A perda é invisível porque é distribuída.** Foi aí que o produto ficou claro: antes de migrar qualquer coisa, é preciso tornar a perda visível. O diagnóstico deixou de ser um relatório e virou a porta de entrada.

### A epifania

Nenhum negócio de recorrência morre de uma vez. Ele vaza.

O cliente que sumiu geralmente não decidiu sair. O cartão dele venceu. O boleto ficou para depois e depois virou nunca. A cobrança falhou num mês em que ele estava sem saldo, e ninguém falou com ele a tempo. Isso não é inadimplência — é acidente. E é a maior perda silenciosa do mercado brasileiro de mensalidade.

O trabalho da Pulse não é cobrar melhor. É **manter vivo o sim que o cliente já deu.**

### O que essa história significa hoje

Que o produto tem um filtro e não vai perdê-lo. Toda vez que alguém pedir uma funcionalidade nova, a pergunta será a mesma: isso ajuda a migrar ou a manter a autorização viva?

### Versão curta

> Em junho de 2025 o Pix Automático entrou no ar prometendo substituir o cartão recorrente por centavos de tarifa. Um ano depois, quase ninguém tinha migrado — não por tecnologia, mas porque ninguém queria fazer o trabalho de convidar 400 clientes, um por um. A Pulse nasceu para fazer esse trabalho: mostrar quanto o negócio perde hoje, migrar a base sem perder cliente no caminho, e avisar no mesmo dia quando uma autorização quebra. Porque negócio de recorrência não morre de uma vez. Ele vaza.

---

## 4.2 Visão, Missão e Valores

### Visão

> **"Que nenhum negócio de recorrência no Brasil perca cliente por um pagamento que quebrou sem ninguém ver."**

### Missão

> **"Mostrar ao negócio quanto ele perde hoje, migrar sua base para Pix Automático sem perder cliente no caminho, e manter a autorização viva."**

*(É literalmente a seção 1 do documento de requisitos. Missão e escopo de produto sendo a mesma frase não é coincidência — é a garantia de que o produto não vai à deriva.)*

### Valores fundamentais

**1. RECUSA**
- Definição: a força do produto vem do que ele se recusa a fazer. Não somos gateway, não somos ERP, não somos emissor fiscal, não somos CRM.
- Como vivemos: toda funcionalidade candidata passa pelo filtro — ajuda a migrar ou a manter a autorização viva? Se não, fica fora. Documentado, aplicado em reunião de roadmap, e defendido mesmo quando o cliente pede.

**2. TRADUÇÃO**
- Definição: quem opera não é técnico e não precisa virar. Falamos a língua de quem usa.
- Como vivemos: "autorização cancelada", não "mandate revoked". "Enviar convite", não "disparar campanha". Todo erro diz o que houve e o que fazer. Todo estado vazio propõe a próxima ação. Esta é uma regra de código, não de copy.

**3. VIGILÂNCIA**
- Definição: quem cuida avisa antes. Descobrir no fechamento do mês é descobrir tarde.
- Como vivemos: cancelamento vira evento de risco no mesmo dia. Falha vira mensagem imediata ao pagador com solução. Nunca esperamos o operador perguntar.

**4. PRECISÃO**
- Definição: todo número que mostramos precisa ser reproduzível pelo cliente. Se ele não consegue refazer a conta, o número não vale.
- Como vivemos: memória de cálculo exposta no diagnóstico. Tarifas parametrizáveis e visíveis. Nenhuma projeção sem cenário declarado. Quando não sabemos, dizemos que não sabemos.

**5. DISCRIÇÃO**
- Definição: na frente do pagador, quem aparece é o cliente. Não competimos por atenção que não é nossa.
- Como vivemos: página de autorização com a marca da organização; a Pulse assina no rodapé, em texto, sem cor. Nunca acima do botão.

**6. CONFORMIDADE**
- Definição: opt-in registrado, base legal declarada, template aprovado. Não é burocracia — é o que separa operação de risco.
- Como vivemos: timestamp e origem em todo opt-in. Resposta a titular em 15 dias, com exportação e exclusão em um clique. Nunca disparamos para quem não consentiu, mesmo quando o cliente insiste.

---

## 4.3 Personalidade e Tom de Voz

### Se a marca fosse uma pessoa

O contador que você confia — não o que faz a declaração, o que te liga em março para dizer que percebeu uma coisa nos seus números e acha que você deveria olhar.

| Atributo | Descrição | O que NÃO somos |
|---|---|---|
| **Direta** | Diz o número antes de dizer a opinião. Não constrói suspense em cima de dinheiro alheio. | Não somos dramáticos. Nada de "você não vai acreditar no que descobrimos" |
| **Precisa** | Cada afirmação tem origem verificável. "3,2% em 412 contratos", não "muito dinheiro" | Não somos vagos. Nada de "milhares de empresas já economizam" |
| **Vigilante** | Avisa antes de virar prejuízo. Chega primeiro. | Não somos alarmistas. Nada de vermelho piscando em coisa que pode esperar |
| **Traduzida** | Fala a língua de quem opera, sempre. | Não somos técnicos. Nada de "mandate", "MDR", "soft decline" na superfície |

### Tom de voz

**Característica 1 — Conversacional com autoridade**
- Soa como: "Sua base tem 412 contratos. 340 no cartão. Isso está custando R$ 2.890 por mês em taxa. Dá R$ 34.680 por ano."
- Não soa como: "Nossa solução inovadora otimiza sua gestão de recebíveis." Nem como: "E aí, galera, bora economizar?"

**Característica 2 — Concreta**
- Soa como: "12 autorizações canceladas neste mês. Todas notificadas no mesmo dia. 9 foram recuperadas."
- Não soa como: "Aumente significativamente sua taxa de retenção."

**Característica 3 — Sem culpa**
- Soa como (ao pagador, após falha): "Sua mensalidade da Academia X não passou hoje — o valor não estava disponível na conta. Você pode pagar por Pix aqui, e a próxima volta ao normal automaticamente."
- Não soa como: "Você está inadimplente." Nem: "Regularize sua situação."

**Característica 4 — Honesta sobre limite**
- Soa como: "Seu banco ainda não oferece Pix Automático. Vamos manter sua cobrança como está." *(RF-54, tal como escrito nos requisitos)*
- Não soa como: "Ops! Algo deu errado."

### Vocabulário da marca

| Usamos | Não usamos |
|---|---|
| Autorização | Mandato, mandate |
| Autorização cancelada | Mandate revoked |
| Convite | Disparo, campanha *(internamente pode; na interface não)* |
| Cobrança que falhou | Transação declinada, soft decline |
| Taxa | MDR, spread, deságio |
| Pagador *(ou o rótulo da organização)* | Devedor, inadimplente |
| Migrar | Onboardear, converter |
| Precisa de atenção | Pendências, alertas críticos |
| Economia | ROI, savings |
| Base | Carteira, portfólio |

**Regra de tradução:** o time técnico usa o vocabulário técnico entre si e nos eventos normalizados do adapter (`mandate.authorized`, `charge.failed`). **Nada disso atravessa para a superfície.** A fronteira é o adapter — do lado de dentro, jargão; do lado de fora, português.

### Termos proprietários

| Termo | Significado | Quando usar |
|---|---|---|
| **Onda** | Um lote de contratos convidados a migrar, com regra de segmentação e régua | Interface, conteúdo, venda |
| **Medidor de migração** | A barra persistente no topo do painel com % migrada e economia do mês | Interface e material comercial. É o elemento de assinatura |
| **Perda silenciosa** | A soma distribuída de taxa, falha e churn involuntário que o operador não enxerga | Conteúdo e venda. **É o nome do inimigo** |
| **Autorização viva** | Mandato ativo, dentro do teto, sem falhas consecutivas | Interface e conteúdo |
| **Churn acidental** | Cliente perdido por pagamento quebrado, não por decisão | Conteúdo e venda |

---

## 4.4 O Código Primal

| Elemento | Definição |
|---|---|
| **História de criação** | O Pix Automático entrou no ar em junho de 2025 prometendo trocar 3% de taxa por centavos. Um ano depois, quase ninguém tinha migrado — não por tecnologia, mas porque ninguém queria fazer o trabalho de convidar 400 pessoas, uma por uma. A Pulse nasceu para fazer esse trabalho. |
| **Credo** | "Acreditamos que nenhum negócio deveria perder um cliente por causa de um pagamento que quebrou. Acreditamos que a maior perda do mercado brasileiro de recorrência não é a inadimplência — é o acidente. Acreditamos que o que você não vê, você não corrige. E acreditamos que a força de uma ferramenta está no que ela se recusa a fazer." |
| **Ícones** | **Visual:** o símbolo de quatro barras — três cheias e uma subindo — que é ao mesmo tempo batimento, ritmo e medidor de migração. **Sonoro:** um único pulso curto e grave, sem melodia, para a confirmação de autorização. Nunca um jingle. **Sensorial:** o PDF do diagnóstico. É o objeto físico da marca, o que passa de mão em mão. |
| **Rituais** | **O primeiro número** — o momento em que o diagnóstico termina e o valor aparece. **A onda** — o dia em que o operador aperta o botão e assiste o medidor subir em tempo real. **O dia 1º** — o relatório mensal com a economia acumulada, que chega sem ser pedido. **A fila vazia** — quando "Precisa de atenção" não tem nenhum item, e o painel diz isso com todas as letras em vez de deixar em branco. |
| **Antagonistas** | **Nos opomos a:** a perda silenciosa. O churn acidental. A taxa aceita como destino. O gateway que entrega o endpoint e chama de solução. A operação que depende de uma pessoa lembrar. **Não somos:** gateway, ERP, emissor fiscal, CRM. Não somos o dono do dinheiro nem o dono do negócio. |
| **Palavras sagradas** | Perda silenciosa · Autorização viva · Churn acidental · Onda · Medidor de migração · "Ajuda a migrar ou a manter a autorização viva?" |
| **Líder** | Leandro F. — fundador. Visão: *"Negócio de recorrência não morre de uma vez. Ele vaza. Meu trabalho é tapar o vazamento e mostrar o número que ninguém somou."* |

---

## 4.5 O Personagem Atrativo

### Definição

**Nome:** Leandro F.
**Papel no negócio:** Fundador e responsável pelo produto
**Papel na comunicação:** Voz principal em Instagram, LinkedIn e e-mail. Aparece em vídeo curto fazendo conta na tela; escreve em formato longo sobre a lógica da operação.
**Por que essa pessoa:** é quem construiu o produto e sabe explicar por que cada coisa está lá — e, mais importante, por que várias coisas não estão. A recusa é a parte mais interessante da história, e só quem tomou a decisão consegue contar com convicção.

### Tipo de personagem

- [ ] O Líder
- [x] **O AVENTUREIRO** — está construindo em tempo real e compartilha a jornada
- [x] **O REPÓRTER** *(secundário)* — apura os dados do mercado que ninguém compilou
- [ ] O Herói Relutante

**Justificativa:** o tipo Líder ("eu fiz, funcionou, vou te ensinar") exige um histórico de resultado que ainda não existe — usá-lo agora seria mentir e o público percebe. O Aventureiro é a posição honesta e, no lançamento de um produto numa categoria nova, é também a mais forte: a audiência acompanha a construção e chega no lançamento já investida.

O Repórter entra como camada secundária e é onde mora a maior oportunidade de curto prazo: **ninguém está compilando os dados de adesão do Pix Automático por segmento.** Quem publicar esse benchmark primeiro vira a referência da categoria — e referência é a defesa contra o risco do Insight 7.

**Migração de tipo:** ao acumular casos com número, migrar gradualmente para Líder. Meta: 12 a 18 meses.

| Situação | Como se comporta | Exemplo concreto |
|---|---|---|
| Ao ensinar | Mostra a conta na tela, não a conclusão | Vídeo de 60s abrindo a planilha e somando MDR de uma base fictícia de 400 contratos |
| Ao errar publicamente | Publica o erro e a correção com a mesma prioridade | "A onda 3 teve 41% de adesão, bem abaixo das outras. Descobri o motivo e mudei a régua. Segue o que mudou." |
| Ao lançar algo | Explica o problema que resolveu antes de mostrar a tela | Post começa pela dor observada em cliente real, termina no recurso |
| Ao receber crítica | Separa crítica técnica de ataque; responde a primeira em público | Se apontarem falha no cálculo do diagnóstico, corrige e publica a correção |
| Nas redes | Bastidor de construção + opinião forte sobre o mercado | Stories de decisão de produto; feed de conta feita e posição |

### ELEMENTO 1 — Backstory

**Modelo aplicado:**

> "Eu estava construindo produto financeiro e olhando para o mesmo problema em todo cliente: a receita recorrente entrava sempre menor do que deveria, e ninguém sabia dizer quanto exatamente. Tentei resolver com relatório melhor e continuava a mesma coisa — o operador via o número e não fazia nada, porque não tinha o que fazer com ele. Até que o Pix Automático entrou no ar e ficou óbvio que a alternativa existia há um ano e quase ninguém tinha usado. Foi quando descobri que o problema nunca foi tecnologia: era que ninguém queria fazer o trabalho de convidar 400 pessoas, uma por uma. Desde então parei de construir relatório e comecei a construir a operação. E agora minha missão é fazer com que nenhum negócio de recorrência no Brasil perca cliente por um pagamento que quebrou sem ninguém ver."

**Versão curta (para bio, abertura de vídeo, apresentação):**

> Construo produto financeiro e passei anos vendo a mesma coisa: negócio de mensalidade perde receita todo mês e não sabe quanto. Quando o Pix Automático entrou no ar e quase ninguém migrou, ficou claro que o gargalo não era técnico — era que ninguém queria fazer o trabalho de convite. Hoje construo a Pulse, que faz esse trabalho.

**Versão longa:** ver 4.1, adaptada para primeira pessoa.

### ELEMENTO 2 — Parábolas

**Parábola 1 — A conta que ninguém tinha feito**
- O que aconteceu: pedi para um dono de academia estimar quanto pagava de taxa por mês. Ele chutou R$ 400. Somamos: R$ 2.890.
- A lição: a perda não some porque é grande. Some porque é distribuída.
- Conexão com a marca: é o argumento inteiro do Pilar REVELAR.
- Onde usar: abertura de conteúdo de topo, primeiro e-mail da sequência SOAP, primeiro slide do deck.

**Parábola 2 — O aluno que não tinha cancelado**
- O que aconteceu: um aluno "cancelou" e voltou seis semanas depois. Nunca tinha cancelado — o cartão venceu, a cobrança falhou, ninguém falou com ele, e ele achou que tinha sido desligado.
- A lição: churn acidental é maior que churn por decisão, e é o único 100% evitável.
- Conexão com a marca: é o Pilar SUSTENTAR e a razão do alerta no mesmo dia.
- Onde usar: e-mail 2 da SOAP, conteúdo sobre retenção, resposta à objeção de preço.

**Parábola 3 — O endpoint que ninguém usou**
- O que aconteceu: o Pix Automático entrou no ar em junho de 2025. Um ano depois, a adoção ainda era uma fração do potencial. A API estava lá o tempo todo.
- A lição: tecnologia disponível não é solução entregue. Entre as duas existe o trabalho — e é o trabalho que ninguém quer fazer.
- Conexão com a marca: define a categoria inteira.
- Onde usar: post de posicionamento, palestra, página "Sobre".

**Parábola 4 — A funcionalidade que eu recusei**
- O que aconteceu: um cliente pediu controle de frequência dentro da Pulse. Fazia sentido para ele, era fácil de fazer, e eu disse não.
- A lição: o filtro protege o cliente de um produto que faz tudo mal.
- Conexão com a marca: valor RECUSA, e o antagonista "ferramenta que faz tudo".
- Onde usar: conteúdo de polarização, LinkedIn, bastidor de produto.

**Parábola 5 — Sete em cada dez**
- O que aconteceu: o operador tinha certeza de que seus clientes não aceitariam trocar de método. O dado de mercado dizia 73% de adesão quando o pedido chega no app do banco.
- A lição: o medo do operador é maior que a resistência do cliente. Quase sempre.
- Conexão com a marca: mata a objeção nº 1 do Pilar MIGRAR.
- Onde usar: conteúdo de consideração, resposta a objeção, e-mail 3 da SOAP.

**Temas recorrentes**

| Tema | Crença que reforça |
|---|---|
| A conta não feita | O que você não vê, você não corrige |
| O acidente vs. a decisão | A maior perda não é a que dói, é a que passa despercebida |
| A recusa | A força de uma ferramenta está no que ela não faz |
| O trabalho no meio | Tecnologia disponível não é problema resolvido |
| O medo desproporcional | O operador teme mais do que o cliente resiste |

### ELEMENTO 3 — Falhas de caráter

| Falha | Como mostra | Por que conecta |
|---|---|---|
| Excesso de rigor com escopo — recusa coisas que dariam dinheiro | Bastidores de decisão de roadmap, incluindo os pedidos que negou e o que perdeu com isso | O público-alvo é feito de gente que faz demais e queria conseguir dizer não |
| Prefere construir a vender — evita a conversa comercial | Conta desconforto real com prospecção e o que fez para superar | Todo dono de negócio de serviço se reconhece: gosta do ofício, sofre com a venda |
| Otimismo de prazo — sempre acha que vai levar metade do tempo | Compara a estimativa com o que aconteceu, publicamente | Universal entre quem constrói qualquer coisa |

**Regras**
- ✅ Compartilhar falhas que geram identificação, mostram crescimento ou têm humor
- ❌ Nunca compartilhar falhas que destruam credibilidade no que se vende — em produto financeiro, isso significa: **nunca sugerir descuido com número, com dado de cliente ou com conformidade.** Errar uma conta em público mata a marca inteira.
- ❌ Nunca humildebrag ("meu maior defeito é trabalhar demais")

**Tom ao compartilhar falhas:** leve, factual, sem autoflagelo. Conta o erro, conta o que aprendeu, segue.

### ELEMENTO 4 — Polarização

| Posição | Por que acredita | Quem concorda | Quem discorda |
|---|---|---|---|
| **Taxa de cartão em mensalidade recorrente é escolha, não destino** | A alternativa existe desde junho de 2025 e custa centavos | Operadores que já somaram; consultores de gestão | Adquirentes; quem vive de MDR |
| **Ferramenta que faz tudo não faz nada bem** | O filtro de escopo é o que garante que a coisa funcione | Operadores queimados por ERP genérico | Vendedores de suíte completa |
| **A maior perda de um negócio de recorrência é o cliente que não quis sair** | Churn acidental supera churn por decisão e é o único totalmente evitável | Quem já viu cliente voltar dizendo que nunca cancelou | Quem trata inadimplência como problema moral |
| **Publicar o endpoint não é entregar a solução** | Um ano de adoção tímida com a API disponível prova o ponto | Operadores não-técnicos | Times de produto de gateway |
| **Cobrança que constrange é falha de sistema, não de caráter** | Se o operador precisa cobrar no WhatsApp, o sistema falhou antes | Quem odeia cobrar; e os pagadores | Quem acredita em régua agressiva de inadimplência |

**O que combatemos no mercado**
1. A ideia de que a taxa do cartão é custo fixo do negócio
2. O gateway que publica a API e considera o problema resolvido
3. A cobrança que trata o cliente como devedor antes de saber o que aconteceu
4. A ferramenta que promete gerenciar tudo e não resolve nada até o fim
5. A automação de cobrança sem opt-in registrado, que funciona até o número ser bloqueado

**Frases de polarização**
1. > "Você não perdeu 12 clientes. Você perdeu 12 pagamentos que ninguém viu quebrar."
2. > "A API está no ar desde junho de 2025. O problema nunca foi tecnologia. Foi que ninguém quis ligar para 400 pessoas."
3. > "Se você precisa cobrar seu cliente no WhatsApp, o sistema já falhou antes."
4. > "Sua taxa de 3% não é custo de operar. É o preço de não ter migrado ainda."
5. > "A parte mais importante do nosso roadmap é a lista do que a gente se recusa a fazer."

**O que NUNCA vai falar ou fazer**
- Nunca dar conselho jurídico, contábil ou tributário. Explicamos como o produto opera dentro da regra; não interpretamos a regra pelo cliente.
- Nunca prometer percentual de adesão sem dado próprio. Enquanto for dado de mercado, dizer que é dado de mercado.
- Nunca atacar gateway específico pelo nome. O antagonista é a perda silenciosa, e os gateways são parceiros de operação.
- Nunca expor dado de cliente, nem anonimizado, sem autorização escrita.
- Nunca usar caso de sucesso sem número verificável.
- Nunca entrar em pauta política, ideológica ou de costumes na voz da marca.

### Identidade visual do personagem

- Vestuário: monocromático, sem estampa, sem logo de terceiro. Preto ou cinza-grafite.
- Cenário de gravação: mesa com monitor visível — a tela é parte do argumento, porque a conta acontece nela.
- Paleta pessoal: neutros do sistema; nada que brigue com o cobalto quando entra em vinheta.
- Elementos recorrentes: a tela, a planilha aberta, o número em destaque. **Nunca falar de dinheiro sem mostrar dinheiro.**

### Assinatura de conteúdo

- Abertura padrão: **"Deixa eu te mostrar uma conta."**
- Encerramento padrão: **"Se sua base é parecida com essa, o número é seu. É só rodar."**
- Bordão: **"O que você não vê, você não corrige."**
- Hashtags: `#PerdaSilenciosa` `#PulseFirme`

---

## 4.6 Storylines e Comunicação

### Storyline 1 — Perda e Redenção

- O que tinha: a certeza de que relatório melhor resolvia o problema
- O que perdeu: tempo construindo dashboard que o operador olhava e não agia
- Como reconstruiu: parou de construir informação e começou a construir operação
- A lição: número sem ação é entretenimento caro
- **Quando usar:** lançamento, página "Sobre", palestra, e-mail 2 da SOAP

### Storyline 2 — Nós contra Eles

- **"Eles":** entregam a capacidade e chamam de solução. Publicam o endpoint, escrevem a documentação, encerram a responsabilidade. Do outro lado da API tem um dono de academia com 320 alunos e nenhum desenvolvedor.
- **"Nós":** fazemos o trabalho do meio. Convidamos, lembramos, acompanhamos, e avisamos quando quebra.
- O contraste: capacidade entregue × resultado operado
- O convite: você não precisa aprender a integrar. Precisa de alguém que opere.
- **Quando usar:** posicionamento, LinkedIn, deck comercial, conteúdo de topo

**Cuidado obrigatório:** "eles" é uma **postura do mercado**, nunca uma empresa nomeada. Os gateways são parceiros de operação, e o produto depende deles. Atacar por nome é erro estratégico, não só de tom.

### Storyline 3 — Antes e Depois

- Antes: 340 contratos no cartão, R$ 2.890/mês de taxa, 22 falhas por mês, 4 clientes perdidos por acidente no trimestre
- O processo: diagnóstico → onda com régua → migração acompanhada → autorização vigiada
- Depois: 71% migrados, taxa de R$ 2.890 para R$ 89/mês, falha caiu para 6/mês, zero perda por cancelamento não detectado
- **Quando usar:** consideração, resposta a objeção, case, e-mail 4 da SOAP

**Banco de Antes e Depois** *(preencher a partir do primeiro cliente — é o ativo comercial mais valioso do negócio)*

| Cliente | Nicho | Antes | Depois | Prova |
|---|---|---|---|---|
| | | | | |

**Regra:** nenhum case publicado sem número verificável e autorização escrita. Case sem número é anúncio, e este público não acredita em anúncio.

### Storyline 4 — Descoberta Surpreendente

- O que acreditava antes: que o operador não migrava porque tinha medo de perder cliente
- O que descobriu: o cliente aceita — o dado de mercado aponta 73% de adesão quando o pedido chega no app do banco. Quem não migra é o operador, e o motivo é o trabalho, não o risco.
- Como descobriu: comparando a resistência declarada com a taxa real de autorização
- O que mudou: o produto deixou de ser sobre convencer o pagador e virou sobre remover o trabalho do operador
- **Quando usar:** quebra de objeção, conteúdo educativo, e-mail 3 da SOAP

### Sequência SOAP — novos leads

| # | Função | Gancho | CTA |
|---|---|---|---|
| 1 — Preparar o palco | Curiosidade | "Perguntei a um dono de academia quanto ele pagava de taxa por mês. Ele errou por R$ 2.400. Amanhã te conto a conta inteira." | "Amanhã eu mando a conta" |
| 2 — O drama | Backstory + dor | A conta completa. A perda distribuída. O aluno que nunca tinha cancelado. | Cliffhanger: "existe uma alternativa no ar desde junho de 2025. Amanhã eu explico por que quase ninguém usou." |
| 3 — A epifania | A descoberta | O gargalo não é tecnologia nem aceitação — 73% autorizam quando são convidados. O gargalo é o trabalho de convidar. | Conexão com a oferta |
| 4 — Benefício oculto | Resultado inesperado | Quem migra não economiza só taxa. Para de perder cliente por acidente, porque a falha vira aviso no mesmo dia. | Oferta suave: rode seu diagnóstico |
| 5 — Convite | Converter | Prova social + o número dele | CTA direto |

**Nota sobre urgência:** a régua SOAP clássica fecha com escassez. Aqui, não. Produto financeiro vendido com deadline artificial perde a credibilidade que a marca inteira depende. A urgência real já existe e basta nomeá-la: **cada mês sem migrar é o valor do diagnóstico saindo da conta.**

### Sequência Seinfeld — engajamento contínuo

**Estrutura:** gancho do dia a dia → conexão → lição → CTA

| # | Tema | Conexão | Lição |
|---|---|---|---|
| 1 | A assinatura de streaming que eu pago há 8 meses sem usar | Recorrência funciona bem demais quando está do outro lado | O sistema que não pede nada é o que sobrevive |
| 2 | O encanador que achou o vazamento no cano errado | Diagnóstico antes de intervenção | Você não conserta o que não localizou |
| 3 | O aviso de manutenção do carro que eu ignorei por 3 meses | Alerta que não gera ação é ruído | Alerta bom diz o que fazer, não só o que houve |
| 4 | O grupo de WhatsApp do condomínio cobrando taxa | Cobrança que constrange todo mundo | Se precisa constranger, o sistema falhou antes |
| 5 | A academia que me ligou 6 semanas depois de eu "sumir" | Churn acidental na pele | 6 semanas é tarde. 1 dia é a diferença |
| 6 | O app do banco que me pediu autorização e eu autorizei sem pensar | A fricção que a gente imagina é maior que a real | O medo do operador é maior que a resistência do cliente |
| 7 | O restaurante que tirou 80% do cardápio e melhorou | Filtro de escopo | A força está no que se recusa a fazer |

**Frequência:** semanal (e-mail) · **Tom:** conversacional, como e-mail de alguém que entende do assunto e não está vendendo naquele momento

### Presença por canal

| Canal | Formato | Frequência | Tom | Conteúdo |
|---|---|---|---|---|
| **Instagram (Feed)** | Carrossel + Reels | 3x/semana | Direto, visual, conta na tela | Parábolas, contas feitas, posições |
| **Instagram (Stories)** | Vídeo + enquete | Diário | Solto, bastidor | Construção do produto, decisões, falhas |
| **LinkedIn** | Texto longo + carrossel | 2x/semana | Analítico, com dado | Cases, benchmark de adesão, posicionamento de categoria |
| **YouTube** | Vídeo de 8–15 min | Quinzenal | Didático, tela compartilhada | "Como calcular sua perda", demonstração do diagnóstico |
| **E-mail** | Newsletter | Semanal | Conversacional | Seinfeld, antes e depois, dado de mercado |
| **Blog / SEO** | Artigo | 2x/mês | Técnico e traduzido | "Pix Automático para [nicho]", comparativos de custo |
| **TikTok** | Vídeo curto | Testar | Polarização | Frases fortes, contas de 30s |

**Canal prioritário no lançamento:** LinkedIn para a Simone e para o Rafael (canal), Instagram para o Marcelo. **O benchmark de adesão por nicho é a peça que abre porta nos dois** — é o conteúdo que nenhum concorrente tem.

### Checklist do Personagem Atrativo

- [x] Personagem definido
- [x] Backstory (curta e longa)
- [x] Tipo escolhido — Aventureiro + Repórter
- [x] 5 parábolas documentadas
- [x] Falhas de caráter com regras
- [x] Posições de polarização
- [x] 4 storylines escritas
- [x] Presença por canal
- [x] Identidade visual pessoal
- [x] Assinatura de conteúdo
- [x] Sequência SOAP rascunhada
- [x] Banco Seinfeld com 7 temas
- [ ] **Banco de "antes e depois" — depende do primeiro cliente**

---
---

# FASE 5 — IDENTIDADE VISUAL

## 5.1 Assinaturas Visuais

### Conceito

O símbolo é uma **cadência**: quatro barras verticais sobre uma linha de base comum. As três primeiras estão cheias; a quarta está em 70% da altura, em tom mais claro, subindo.

Ele lê como três coisas ao mesmo tempo, e as três são o produto:

1. **Um batimento** — o ritmo regular da mensalidade
2. **Um medidor** — a barra que enche, que é o elemento de assinatura pedido na seção 11 dos requisitos
3. **Colunas de dado** — a natureza tabular e financeira da ferramenta

**A altura de 70% não é arbitrária.** É o cenário intermediário de adesão do RF-33 (50% / 70% / 90%) — a meta realista de migração. O símbolo carrega a promessa numérica do produto na própria geometria, do mesmo modo que a barra do painel carrega. Quando o medidor de migração aparece no topo do painel, ele é o logo em escala funcional.

### Construção

```
Grid 24 × 24 · linha de base em y = 20 · topo em y = 4

  ▮  ▮  ▮  ▯      barra 1  x=1,5   altura 16   (100%)
  ▮  ▮  ▮  ▮      barra 2  x=7,5   altura 16   (100%)
  ▮  ▮  ▮  ▮      barra 3  x=13,5  altura 16   (100%)
  ▮  ▮  ▮  ▮      barra 4  x=19,5  altura 11,2 (70%)

  largura da barra: 3    ·    intervalo: 3
  extremidades: raio 1,5 (semicircular)
```

- Barras 1 a 3: `--pl-grafite` (ou `--pl-cobalto` na versão de acento)
- Barra 4: `--pl-cobalto` a 100% quando o fundo é claro; nunca em cinza — ela é o elemento vivo

### Logotipo

**pulse** — Archivo Semibold, caixa baixa, entreletra −2%.

Caixa baixa por decisão de tom: a marca fala como pessoa, não como instituição. Caixa alta seria a estética do gateway, que é justamente o que 3.2 manda evitar.

### Versões

| # | Versão | Composição | Uso |
|---|---|---|---|
| 1 | **Horizontal** | Símbolo à esquerda + logotipo, separados por 1× a largura da barra | Padrão. Cabeçalho, deck, assinatura de e-mail |
| 2 | **Vertical** | Símbolo centralizado sobre o logotipo | Perfis sociais, espaços estreitos |
| 3 | **Símbolo isolado** | Só as quatro barras | Favicon, ícone de app, avatar, medidor no painel |
| 4 | **Monocromática** | Tudo em uma cor, incluindo a quarta barra | Gravação, fundo colorido, uma cor só |

**Regra da versão monocromática:** quando a cor se perde, a distinção da quarta barra some. Ela continua legível porque a **altura** já diferencia — o que confirma que o símbolo não depende da cor, requisito de qualquer marca que vai aparecer sobre fundo alheio.

### Área de proteção

X = largura de uma barra (3 unidades do grid, ou 12,5% da largura do símbolo).
Espaço livre mínimo de 1X em todos os lados. Nada invade — nem texto, nem borda, nem imagem.

### Tamanhos mínimos

| Meio | Símbolo | Assinatura horizontal |
|---|---|---|
| Digital | 16 px | 88 px de largura |
| Impressão | 6 mm | 30 mm de largura |

Abaixo de 16px o símbolo perde a quarta barra visualmente. Use sempre o símbolo isolado nesse tamanho, nunca a versão horizontal.

---

## 5.2 Paleta de Cores

### Princípio

O documento de requisitos determina: paleta contida, com cor reservada para significado. Isso cria uma regra rígida e não negociável:

> **A cor primária da marca não pode ser confundida com nenhum estado do sistema.**

Por isso o cobalto é azul: os estados ocupam verde, âmbar e vermelho, e o azul fica livre para significar "marca e ação" sem ambiguidade. Um botão azul nunca será lido como "ativo"; um badge verde nunca será lido como "clique aqui".

### Cores primárias

**COBALTO** — a cor da marca e da ação

| Sistema | Código |
|---|---|
| HEX | `#2B50F5` |
| RGB | R43 G80 B245 |
| CMYK | C82 M67 Y0 K4 |
| Pantone (aprox.) | 2728 C |

**Significado:** azul de instrumento, não de banco. Saturado o bastante para ser um acento único num sistema quase monocromático, e distante do turquesa que domina a categoria.
**Uso:** símbolo (quarta barra), botão primário, link, medidor de migração, gráfico de destaque. **Nunca** para comunicar estado.

**GRAFITE** — a cor do texto e da estrutura

| Sistema | Código |
|---|---|
| HEX | `#12161C` |
| RGB | R18 G22 B28 |
| CMYK | C78 M67 Y58 K72 |

**Significado:** preto com leve viés frio, para não brigar com o cobalto. É o que sustenta a densidade das tabelas.
**Uso:** títulos, símbolo em versão neutra, fundo de superfícies escuras.

### Cores neutras

| Nome | HEX | Uso | Contraste sobre branco |
|---|---|---|---|
| Grafite | `#12161C` | Títulos, texto forte | 18,1:1 ✅ AAA |
| Texto | `#475467` | Corpo, texto de tabela | 7,7:1 ✅ AAA |
| Texto fraco | `#98A2B3` | Legenda, placeholder, assinatura no rodapé | 2,6:1 ⚠️ ver nota |
| Borda | `#E4E7EC` | Divisórias, borda de campo, linha de tabela | — não textual |
| Superfície | `#F7F8FA` | Fundo de painel, cabeçalho de tabela, estado vazio | — |
| Branco | `#FFFFFF` | Fundo base | — |

> ⚠️ **`--pl-texto-fraco` (#98A2B3) reprova em WCAG AA para texto.** Contraste de 2,6:1 sobre branco, contra o mínimo de 4,5:1.
>
> **Está permitido apenas para:** placeholder de campo, ícone decorativo, e a assinatura "processada por Pulse" no rodapé da página de autorização — este último por ser assinatura de marca, não conteúdo.
>
> **Está proibido para:** qualquer legenda que carregue informação, rótulo de coluna, texto de ajuda, e — especialmente — **qualquer aviso legal ou texto de conformidade.** Aviso prévio de cobrança, base legal de opt-in e informação de valor-teto são conteúdo, não letra miúda. Use `--pl-texto` (#475467) para todos eles.
>
> Para legenda que precisa parecer secundária mas continuar acessível, use **`#667085`** (contraste 5,0:1 ✅ AA).

### Cores semânticas

Cada estado tem **dois valores**: um de superfície (fundo de badge, ponto indicador) e um de texto (que precisa passar em AA sobre fundo claro). Usar o tom de superfície como texto é o erro de acessibilidade mais provável do sistema.

| Estado | Superfície | Texto | Contraste do texto | Onde |
|---|---|---|---|---|
| **Ativo** — autorização viva, cobrança liquidada | `#0E9F6E` | `#047857` | 5,5:1 ✅ AA | Badge de mandato ativo, cobrança paga |
| **Pendente** — convite enviado, cobrança agendada | `#D9880A` | `#B45309` | 5,0:1 ✅ AA | Convite aguardando, aguardo de autorização |
| **Risco** — cancelamento, falha, expiração | `#D92D20` | `#D92D20` | 4,7:1 ✅ AA | Fila "Precisa de atenção", evento de risco |
| **Neutro** — encerrado, arquivado, no pool | `#98A2B3` | `#475467` | 7,7:1 ✅ AA | Contrato que voltou ao pool |

### Combinações aprovadas

| Combinação | Uso | Contraste |
|---|---|---|
| Grafite sobre Branco | Texto padrão | 18,1:1 ✅ |
| Texto sobre Branco | Corpo e tabela | 7,7:1 ✅ |
| Branco sobre Cobalto | Botão primário | 5,9:1 ✅ |
| Cobalto sobre Branco | Link, valor em destaque | 5,9:1 ✅ |
| Branco sobre Grafite | Superfície escura, deck | 18,1:1 ✅ |
| Cobalto sobre Grafite | ❌ **Proibido** | 3,0:1 ❌ |

> ⚠️ **Cobalto sobre Grafite reprova.** Em superfície escura (deck, cabeçalho escuro, dark mode), o cobalto precisa ser clareado para **`#7B93FF`**, que alcança 6,5:1 sobre grafite. Token: `--pl-cobalto-claro`. Isso vale também para a quarta barra do símbolo em fundo escuro.

### Tokens

```css
:root {
  /* Marca */
  --pl-cobalto:        #2B50F5;
  --pl-cobalto-escuro: #1E3ACC;  /* hover de botão */
  --pl-cobalto-claro:  #7B93FF;  /* uso sobre fundo escuro */
  --pl-grafite:        #12161C;

  /* Neutros */
  --pl-texto:          #475467;
  --pl-texto-medio:    #667085;  /* legenda acessível */
  --pl-texto-fraco:    #98A2B3;  /* NÃO textual — ver regra */
  --pl-borda:          #E4E7EC;
  --pl-superficie:     #F7F8FA;
  --pl-branco:         #FFFFFF;

  /* Estados — superfície */
  --pl-ativo:          #0E9F6E;
  --pl-pendente:       #D9880A;
  --pl-risco:          #D92D20;

  /* Estados — texto acessível */
  --pl-ativo-texto:    #047857;
  --pl-pendente-texto: #B45309;
  --pl-risco-texto:    #D92D20;

  /* Estados — fundo de badge */
  --pl-ativo-bg:       #ECFDF5;
  --pl-pendente-bg:    #FFFBEB;
  --pl-risco-bg:       #FEF3F2;
}
```

### Cor na página do pagador

A página de autorização usa a cor da organização (RF-05), não o cobalto. **Consequência obrigatória:** o botão principal recebe cor arbitrária, escolhida pelo cliente, e pode reprovar em contraste.

**Regra de implementação:** calcular o contraste da cor recebida contra branco no momento do render. Se for inferior a 4,5:1, o texto do botão vira grafite automaticamente em vez de branco. Nunca confiar na cor que o cliente subiu.

---

## 5.3 Tipografia

### Fonte de marca e títulos — ARCHIVO

```
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789  R$ % ↑ ↓
```

Grotesca americana com boa presença em peso alto e desenho suficientemente particular para não ser confundida com a fonte padrão de sistema. Tem versão Expanded, útil para o logotipo e para números grandes de destaque.

**Pesos:** Regular 400 · Medium 500 · Semibold 600 · Bold 700
**Obter:** Google Fonts — `fonts.google.com/specimen/Archivo`
**Licença:** SIL Open Font License

### Fonte de interface e corpo — INTER

Desenhada para tela, com altura de x generosa, boa legibilidade em corpo pequeno e — o requisito decisivo — **algarismos tabulares nativos.**

**Pesos:** Regular 400 · Medium 500 · Semibold 600
**Obter:** Google Fonts — `fonts.google.com/specimen/Inter`
**Licença:** SIL Open Font License

> **Regra não negociável:** todo valor monetário, percentual e contagem usa `font-variant-numeric: tabular-nums` e alinhamento à direita. Numeral proporcional em coluna de tabela faz a vírgula dançar entre as linhas, e num produto que existe para dar credibilidade a números, isso sozinho destrói a confiança.

```css
.pl-numero {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
  text-align: right;
}
```

### Fonte técnica — JETBRAINS MONO

Para o que é identificador e não número: token de convite, ID de cobrança, referência de ciclo, ID de evento de webhook, chave de gateway mascarada. Sinaliza "isto é um código, não um valor" e evita confusão entre 0/O e 1/l/I.

**Peso:** Regular 400 · **Obter:** Google Fonts · **Licença:** Apache 2.0

### Hierarquia

| Elemento | Fonte | Peso | Tamanho | Entrelinha | Uso |
|---|---|---|---|---|---|
| Display | Archivo | Bold | 48 px | 1,1 | Número do diagnóstico, hero |
| H1 | Archivo | Semibold | 32 px | 1,2 | Título de página |
| H2 | Archivo | Semibold | 24 px | 1,3 | Seção |
| H3 | Archivo | Medium | 18 px | 1,4 | Subtítulo, título de card |
| Corpo | Inter | Regular | 15 px | 1,6 | Texto corrido |
| Corpo forte | Inter | Medium | 15 px | 1,6 | Ênfase |
| Tabela | Inter | Regular | 14 px | 1,5 | Célula |
| Número em tabela | Inter | Medium | 14 px | 1,5 | Valor · tabular · à direita |
| Rótulo | Inter | Medium | 12 px | 1,4 | Cabeçalho de coluna, badge · +2% de entreletra |
| Legenda | Inter | Regular | 13 px | 1,5 | Nota · cor `--pl-texto-medio` |
| Código | JetBrains Mono | Regular | 13 px | 1,5 | Token, ID, referência |

### Tipografia na página do pagador

Escala maior, hierarquia mais simples — é uma tela, uma decisão, provavelmente no celular, provavelmente às pressas.

| Elemento | Tamanho | Nota |
|---|---|---|
| Nome da organização | 20 px | |
| Valor da cobrança | 40 px, Archivo Bold, tabular | **É o número que a pessoa precisa conferir antes de autorizar** |
| Periodicidade e dia | 16 px | |
| Valor-teto do mandato | 16 px, cor `--pl-texto` | **Nunca em texto fraco.** É informação de consentimento |
| Botão | 17 px, Medium | Altura mínima 52 px |

---

## 5.4 Iconografia e Elementos Gráficos

### Estilo

- **Sistema base:** Lucide (aberto, coerente, cobre o vocabulário necessário)
- **Traço:** 1,5 px em 24 px · 2 px em 16 px
- **Cantos:** arredondados, raio 2
- **Grid:** 24 px · **Preenchimento:** nenhum. Só contorno.

### Ícones do domínio

| Ícone | Conceito | Uso |
|---|---|---|
| Barras da marca | Migração | Medidor, dashboard |
| Seta circular | Recorrência | Contrato, ciclo |
| Escudo com check | Autorização viva | Mandato ativo |
| Escudo com traço | Autorização quebrada | Evento de risco |
| Triângulo com "!" | Precisa de atenção | Fila de retenção |
| Papel com lupa | Diagnóstico | Relatório |
| Ondulação | Onda | Campanha de migração |
| Balão | Convite | Mensagem ao pagador |
| Plugue | Conexão | Gateway |

### Elemento gráfico de assinatura — O MEDIDOR

É o único elemento gráfico proprietário do sistema, e é o mesmo objeto do logo em escala funcional.

```
┌─────────────────────────────────────────────────────┐
│  MIGRAÇÃO                              ECONOMIA/MÊS │
│  ████████████████████░░░░░░░░░  71%      R$ 2.801   │
│  292 de 412 contratos                               │
└─────────────────────────────────────────────────────┘
```

- Barra preenchida: `--pl-cobalto` · trilho: `--pl-borda`
- Altura 8 px, cantos totalmente arredondados
- Números em `tabular-nums`, alinhados à direita
- Transição de largura: 400 ms `cubic-bezier(0.4, 0, 0.2, 1)`
- **Persistente no topo do painel.** Nunca colapsa, nunca some, não vira card entre outros cards.

**Por que persistente:** os requisitos definem esse número como aquele pelo qual o operador julga o produto. Ele precisa estar visível toda vez que o operador abre a tela, inclusive — e principalmente — nos meses em que não muda. É a resposta visual ao Momento da Verdade nº 5.

### Padrão gráfico

Repetição do motivo de barras, em `--pl-borda` a 40%, para fundo de estado vazio e capa de PDF. **Nunca atrás de texto** e nunca em mais de um elemento por tela.

---

## 5.5 Fotografia e Imagens

### Princípio

A Pulse é uma ferramenta de operação financeira. **A imagem mais importante da marca é uma tela com números, não uma foto de pessoa sorrindo.** Fotografia entra como contexto humano; nunca como argumento.

### Estilo

- Iluminação: natural, direcional, sombra presente. Nada de estúdio uniforme.
- Temperatura: neutra a levemente fria
- Composição: espaço negativo generoso; a pessoa raramente ocupa o centro
- Pessoas: operadores reais em ambientes reais — recepção de academia, secretaria de escola, sala de administradora. Expressão concentrada, não celebratória.
- Cenários: mesa com computador, balcão de recepção, sala pequena. Brasil sem estilização.

### Proibições

- ❌ Aperto de mão corporativo
- ❌ Gráfico de barras subindo em stock photo
- ❌ Pessoa apontando para tela vazia
- ❌ Moeda, cofrinho, porco, cifrão como imagem
- ❌ Ilustração isométrica de fintech
- ❌ Mascote

### Tratamento

- Contraste: +8% · Saturação: −12% · Temperatura: −4 (leve frio)
- Objetivo: a foto recua um passo para que os elementos de interface avancem

### Categorias

1. **Operação real** — pessoas trabalhando, tela visível ao fundo
2. **Interface** — capturas reais do produto, com dados fictícios porém plausíveis. **É a categoria principal.**
3. **Ambiente de nicho** — box, escola, clínica, portaria; genéricos o suficiente para não parecer endosso
4. **Retrato** — o Personagem Atrativo, fundo neutro, sem sorriso forçado

### Bancos aprovados

- Unsplash e Pexels, filtrando por "Brasil" e por autenticidade
- Acervo próprio a partir dos primeiros clientes — **é a fonte a priorizar**
- Stock pago apenas quando não houver alternativa

**Regra sobre captura de tela:** nunca publicar dado real de cliente, nem parcialmente anonimizado. Manter um conjunto fixo de dados fictícios coerentes, com os mesmos nomes e números em todas as peças. Consistência aqui lê como produto maduro.

---

## 5.6 Motion e Animação

### Princípio

Movimento serve a duas funções e nenhuma outra: **mostrar mudança de estado** e **guiar atenção**. Numa ferramenta usada oito horas por dia, animação decorativa vira irritação na terceira semana.

### Parâmetros

- Duração: 150 ms (micro) · 250 ms (transição) · 400 ms (medidor)
- Curva: `cubic-bezier(0.4, 0, 0.2, 1)`
- Estilo: linear e contido. Sem quique, sem elástico, sem rotação.

### Aplicações

| Elemento | Movimento | Duração |
|---|---|---|
| Medidor de migração | Largura cresce da esquerda | 400 ms |
| Nova autorização confirmada | Linha entra com fade + 8 px de deslocamento | 250 ms |
| Badge muda de estado | Transição de cor, sem movimento | 150 ms |
| Item entra em "Precisa de atenção" | Fade + realce de fundo que desvanece em 2 s | 250 ms + 2 s |
| Espera na página do pagador | Pulse lento do símbolo — opacidade 1 → 0,6 → 1 | 1,6 s, contínuo |
| Autorização confirmada (pagador) | Barras preenchem em sequência, esquerda → direita | 600 ms, uma vez |

**A animação de espera do pagador é a peça mais importante do sistema de motion.** É o único momento em que a marca fica visível por vários segundos seguidos, enquanto a pessoa aguarda o polling de status (RF-53). O símbolo pulsando literalmente encena o nome. Um único uso, no momento exato.

### Vinheta de logo

2 segundos. As quatro barras sobem da linha de base em sequência, com atraso de 80 ms entre elas; a quarta para em 70%. Sem som, ou com um pulso grave único. Uso: abertura de vídeo institucional apenas — nunca em Reels ou conteúdo curto, onde consome os primeiros segundos que definem a retenção.

### Acessibilidade

Respeitar `prefers-reduced-motion: reduce`. Com a preferência ativa, todas as transições caem para 0 ms e o pulso de espera vira estático. A informação nunca depende de movimento.

---
---

# FASE 6 — IMPLEMENTAÇÃO

## 6.1 Roadmap

Ordenado por proximidade com a venda, não por completude do sistema.

**FASE A (mês 1) — Fundação**
- [ ] Verificação de domínio e busca no INPI *(bloqueia todo o resto)*
- [ ] Logo nas 4 versões, em SVG
- [ ] Tokens CSS implementados
- [ ] Fontes carregadas e hierarquia aplicada
- [ ] **Template do PDF de diagnóstico** — prioridade máxima

**FASE B (mês 2) — Comercial**
- [ ] Landing de uma promessa só
- [ ] Deck comercial
- [ ] Perfis sociais com identidade aplicada
- [ ] Templates de mensagem de WhatsApp *(aprovação Meta na categoria Utility começa aqui — o prazo é externo e não controlável)*
- [ ] Assinatura de e-mail

**FASE C (mês 3–4) — Produto**
- [ ] UI kit completo do painel
- [ ] Medidor de migração implementado com realtime
- [ ] Página de autorização, com teste de contraste dinâmico da cor do cliente
- [ ] E-mails transacionais e resumo diário
- [ ] Relatório mensal em PDF

**FASE D (mês 5–6) — Escala**
- [ ] Biblioteca de templates de conteúdo social
- [ ] Material do parceiro de canal
- [ ] Templates de mensagem por nicho
- [ ] Documentação pública de marca

---

## 6.2 Papelaria Institucional

Prioridade baixa. Negócio 100% digital, comprador que decide por WhatsApp e videochamada. Manter o mínimo e não investir.

**Cartão de visita** — 90 × 50 mm, couché fosco 300g, 4x0
Frente: símbolo, nome, cargo. Verso: branco.
Uso: evento de nicho e reunião presencial com parceiro de canal.

**Papel timbrado** — apenas versão digital, em template de documento. Sem impressão.

**Não produzir:** envelope, pasta institucional, bloco de anotação. Custo sem retorno neste estágio.

---

## 6.3 Digital e Website

### Estrutura

```
├── Home                     uma promessa, um número, um botão
├── Como funciona            os três pilares, nesta ordem
├── Para quem                blocos por nicho, mesmo produto
├── Calculadora              perda estimada sem cadastro
├── Preços                   transparente, com nota sobre o modelo de economia
├── Conteúdo                 blog + benchmark de adesão
├── Sobre                    a história de origem
└── Entrar                   Clerk
```

**A calculadora pública é a peça central do site.** Não é acessório de conteúdo — é a versão de topo de funil do diagnóstico. O visitante informa número de contratos, ticket médio e método dominante, e vê a estimativa de perda mensal sem entregar e-mail. Só depois vem o convite para o diagnóstico real com a base dele.

Pedir cadastro antes de mostrar o número inverte a lógica da marca inteira: a Pulse existe para revelar primeiro.

### Especificações

- Largura máxima: 1200 px · painel: 1440 px
- Grade: 12 colunas, medianiz de 24 px
- Raio de canto: 6 px em componentes, 8 px em card
- Sombra: uma só — `0 1px 2px rgba(18,22,28,0.06)`. Elevação se resolve por borda, não por sombra.
- Links: `--pl-cobalto`, sublinhado no hover
- Botão primário: fundo cobalto, texto branco, raio 6 px, altura 40 px (painel) / 48 px (site)

### UI kit

**Botões:** primário (cobalto sólido) · secundário (borda + texto grafite) · fantasma (só texto) · destrutivo (borda vermelha, nunca vermelho sólido — em ferramenta financeira, botão vermelho cheio provoca clique acidental)

**Campo:** borda `--pl-borda` · foco com anel cobalto de 2 px · erro com borda vermelha **e** texto explicativo. Nunca só cor: daltônicos não veem borda vermelha.

**Card:** fundo branco, borda `--pl-borda`, raio 8 px, padding 20 px

**Tabela:** cabeçalho em `--pl-superficie`, rótulo 12 px medium com +2% de entreletra · linha com borda inferior · valores tabulares à direita · hover em `--pl-superficie`

**Badge de estado:** fundo do estado + texto do estado + ponto de 6 px. Sempre com texto — nunca ponto colorido sozinho.

**Estado vazio:** padrão de barras em 40%, uma frase que diz o que aconteceria ali, e o botão da próxima ação. Estado vazio sem ação proposta é bug de interface segundo a seção 11 dos requisitos.

---

## 6.4 Redes Sociais

### Dimensões

| Plataforma | Tipo | Dimensão |
|---|---|---|
| Instagram | Feed | 1080 × 1350 |
| | Stories / Reels | 1080 × 1920 |
| LinkedIn | Post | 1200 × 1200 |
| | Capa | 1584 × 396 |
| YouTube | Thumbnail | 1280 × 720 |
| TikTok | Vídeo | 1080 × 1920 |

### Templates por categoria

O código de cor é **de categoria de conteúdo**, e usa apenas os neutros mais o cobalto — nunca as cores semânticas, que pertencem ao sistema.

| Categoria | Fundo | Acento | Conteúdo |
|---|---|---|---|
| **A conta** | Branco | Cobalto no número | O cálculo demonstrado. Formato principal |
| **Posição** | Grafite | Cobalto claro | Frase de polarização |
| **Bastidor** | Superfície | Cobalto discreto | Construção, decisão, falha |
| **Case** | Branco | Cobalto no delta | Antes e depois com número |
| **Dado de mercado** | Grafite | Cobalto claro | Benchmark de adesão |

**Regra de composição:** todo post da categoria "A conta" tem o número em Archivo Bold, tabular, ocupando pelo menos 30% da altura. O número é o criativo. Texto explicativo entra em Inter, abaixo, em corpo pequeno.

---

## 6.5 Sinalização e Ambientes

Não aplicável no estágio atual. Reavaliar se houver escritório com atendimento presencial.

Para presença em evento de nicho, ver 6.7.

---

## 6.6 Uniformes e Identificação

**Camiseta de evento:** algodão preto, símbolo em cobalto no peito esquerdo, 60 mm. Sem frase nas costas.

**Crachá:** produzido pelo organizador do evento. Fornecer o símbolo em SVG e a versão horizontal.

Nada além disso neste estágio.

---

## 6.7 Materiais de Evento e Brindes

O canal de evento é relevante para esta marca — feiras de nicho (academia, educação, condomínio) reúnem exatamente o Marcelo, a Simone e o Rafael no mesmo lugar.

**Roll-up** — 80 × 200 cm
Composição: fundo grafite · símbolo no topo · uma frase de polarização em Archivo Bold ocupando o terço central · QR code para a calculadora no rodapé. **Sem lista de funcionalidades.** A conversa acontece ao vivo; o banner só precisa parar a pessoa.

**One-pager** — A4, frente e verso
Frente: a conta feita, com o número grande. Verso: os três pilares e o QR da calculadora.

**Brindes**

| Item | Especificação | Aplicação |
|---|---|---|
| Caderno A5 | Capa dura preta | Símbolo em baixo-relevo, sem cor |
| Caneta | Metal preto fosco | Símbolo gravado |

**Não produzir:** caneca, ecobag, chaveiro, adesivo. Não conversam com o público nem com o tom da marca.

---

## 6.8 Veículos

Não aplicável.

---
---

# FASE 7 — GESTÃO E GOVERNANÇA

## 7.1 Guardiões da Marca

| Função | Nome | Responsabilidade |
|---|---|---|
| Guardião Principal | Leandro F. | Decisão final sobre marca, posicionamento e uso |
| Produto | Leandro F. | Aplicação de tokens e vocabulário na interface |
| Conteúdo | [a definir] | Voz do Personagem Atrativo, calendário editorial |
| Design | [a definir] | Execução e qualidade visual |

**Enquanto as funções estiverem concentradas:** o risco não é conflito de decisão, é ausência de revisão. Adotar uma **auditoria trimestral de consistência** com terceiro — alguém de fora percorrendo painel, site, redes e mensagens de WhatsApp contra o checklist de 7.4.

---

## 7.2 Regras de Uso e Usos Incorretos

### ✅ Uso correto

- Versão horizontal como padrão
- Símbolo isolado abaixo de 88 px de largura
- Quarta barra em cobalto sobre fundo claro; em `--pl-cobalto-claro` sobre fundo escuro
- Área de proteção de 1X respeitada
- Versão monocromática quando houver limitação de cor

### ❌ Não fazer

- Distorcer a proporção das barras — a relação 70% carrega significado
- Alterar a altura da quarta barra
- Inverter a ordem (barra curta à esquerda)
- Trocar a cor da quarta barra por verde, âmbar ou vermelho — **colide com o sistema de estados**
- Usar cobalto sobre grafite sem clarear
- Aplicar gradiente, sombra ou brilho no símbolo
- Rotacionar
- Usar o logotipo em caixa alta
- Substituir a tipografia do logotipo
- Colocar o símbolo dentro de forma geométrica (círculo, quadrado, hexágono)
- **Usar cor de estado como cor decorativa em qualquer lugar do sistema**
- **Usar `--pl-texto-fraco` em texto legal, aviso de cobrança ou informação de consentimento**

### A regra que mais será quebrada

> **Cor de estado é vocabulário, não paleta.**

Verde, âmbar e vermelho significam ativo, pendente e risco. Usá-los para colorir um gráfico, um ícone de menu ou um template de post ensina o operador que a cor não quer dizer nada — e no dia em que ela precisar dizer, ele não vai ver.

---

## 7.3 Biblioteca de Ativos

```
📁 Pulse-Marca/
├── 📁 01_Logo/
│   ├── SVG/          horizontal · vertical · simbolo · mono
│   ├── PNG/          @1x @2x @3x, fundo transparente
│   └── Favicon/      16 · 32 · 180 · 512
├── 📁 02_Cores/
│   ├── pulse-tokens.css
│   ├── paleta.ase
│   └── contraste.html          verificação WCAG viva
├── 📁 03_Tipografia/
│   └── Archivo · Inter · JetBrains Mono
├── 📁 04_Templates/
│   ├── Social/       por categoria
│   ├── Deck/
│   ├── Diagnóstico/  o template do PDF
│   └── Documentos/
├── 📁 05_Ícones/     conjunto Lucide + ícones de domínio
├── 📁 06_Imagens/    acervo próprio · capturas com dados fictícios
├── 📁 07_Motion/     vinheta · animação de espera
└── 📁 08_Brand_Book/ este documento
```

**Formatos:** SVG (vetorial, padrão) · PNG (transparente) · PDF (impressão) · CSS (tokens)

**Fonte única de verdade:** o arquivo `pulse-tokens.css` é a origem de toda cor. Nenhum hexadecimal solto no código, em template de e-mail ou em template de post. Cor definida fora do arquivo de tokens é dívida técnica de marca.

---

## 7.4 Processo de Aprovação

```
Solicitação → Briefing → Criação → Revisão → Aprovação → Publicação
```

### Checklist

**Visual**
- [ ] Versão correta do logo para o contexto e o tamanho
- [ ] Cores vindas dos tokens, sem hexadecimal solto
- [ ] Cor de estado usada apenas para estado
- [ ] Tipografia conforme a hierarquia
- [ ] Números em tabular, alinhados à direita
- [ ] Contraste verificado — inclusive texto legal
- [ ] Área de proteção respeitada

**Verbal**
- [ ] Vocabulário traduzido, sem jargão de gateway
- [ ] Nenhum número sem origem verificável
- [ ] Nenhuma promessa de adesão sem dado próprio ou fonte declarada
- [ ] Estado vazio propõe ação; erro diz o que fazer
- [ ] Nenhum gateway citado nominalmente em peça de polarização

**Conformidade**
- [ ] Nenhum dado real de cliente exposto
- [ ] Case com autorização escrita
- [ ] Template de WhatsApp aprovado na categoria correta
- [ ] Texto de consentimento legível e com contraste adequado

### Alçadas

| Tipo | Aprova |
|---|---|
| Post de rotina | Conteúdo |
| Peça com número de cliente | Guardião Principal |
| Alteração de token ou de logo | Guardião Principal |
| Novo template de WhatsApp | Guardião Principal + verificação Meta |
| Case público | Guardião Principal + cliente por escrito |

---

## 7.5 Contatos e Fornecedores

### Equipe

| Função | Nome | E-mail | Telefone |
|---|---|---|---|
| Guardião da Marca | Leandro F. | | |
| Conteúdo | | | |
| Design | | | |

### Fornecedores

| Tipo | Empresa | Contato | Observações |
|---|---|---|---|
| Gráfica | | | Baixa frequência |
| Audiovisual | | | Vinheta e institucional |
| Fotografia | | | Acervo próprio em cliente |
| Assessoria de marca (INPI) | | | **Prioridade — bloqueia a Fase A** |

---
---

# ANEXOS

## A. Glossário

### Termos de marca

| Termo | Definição |
|---|---|
| Perda silenciosa | A soma distribuída de taxa, falha de cobrança e churn involuntário que o operador não enxerga porque nunca chega junta. O antagonista da marca |
| Churn acidental | Cliente perdido por pagamento quebrado, não por decisão de sair |
| Autorização viva | Mandato ativo, dentro do valor-teto, sem falhas consecutivas |
| Medidor de migração | A barra persistente no topo do painel com % migrada e economia do mês. Elemento de assinatura |
| Onda | Lote de contratos convidados a migrar, com regra de segmentação e régua |
| Cadência (símbolo) | As quatro barras do logo: três cheias e uma em 70% |

### Termos do domínio

| Termo | Definição |
|---|---|
| Organização | O cliente pagante do SaaS. Unidade de isolamento de dados |
| Pagador | Pessoa física que paga a mensalidade à organização |
| Contrato | Vínculo de cobrança recorrente: pagador + valor + periodicidade + dia de vencimento |
| Autorização (mandato) | Consentimento do pagador no app do banco, com valor-teto e ciclo |
| Convite | Tentativa de migração dirigida a um contrato, com link único |
| Cobrança | Tentativa de débito de um ciclo específico |
| Evento de risco | Autorização cancelada, expirada ou com falhas consecutivas |
| Régua | Sequência temporal de mensagens de uma onda (D0 / D+2 / D+5 / D+10) |
| Adapter | Interface que isola o produto do gateway específico |

### Termos técnicos e de marca (geral)

| Termo | Definição |
|---|---|
| Brand Book | Manual de identidade estratégica e visual da marca |
| Big Idea | A mensagem central que resume o posicionamento em uma frase |
| Persona | Representação semifictícia do cliente ideal |
| Anti-persona | Perfil que a marca deliberadamente não atende |
| JTBD | Jobs to Be Done — framework de necessidades do cliente |
| Personagem Atrativo | Pessoa que representa a marca na comunicação (*DotCom Secrets*) |
| Código Primal | Framework de sete elementos de significado de marca (*Primal Branding*) |
| SOAP | Soap Opera Sequence — sequência narrativa de e-mails |
| PESTEL | Análise de contexto: político, econômico, social, tecnológico, ecológico, legal |
| WCAG AA | Padrão de acessibilidade; exige contraste mínimo de 4,5:1 para texto |
| Tabular-nums | Recurso tipográfico de algarismos de largura fixa |
| MDR | *Merchant Discount Rate* — a taxa percentual do cartão. **Termo interno; nunca aparece na superfície** |
| Token (design) | Variável que armazena um valor de estilo, como cor ou espaçamento |
| Token (convite) | Identificador opaco na URL do convite |

---

## B. Histórico de Versões

| Versão | Data | Alterações | Responsável |
|---|---|---|---|
| 1.0 | 04/08/2026 | Versão inicial. 7 fases completas. Naming definido (Pulse). Fases 1 e 2 marcadas como hipótese pendente de validação | Leandro F. |
| 1.2 | 05/08/2026 | Corrigidas três razões de contraste que estavam superestimadas em §5.2 — grafite sobre branco (17,4 → 18,1), `--pl-texto-medio` (5,3 → 5,0) e cobalto claro sobre grafite (7,1 → 6,5). Nenhuma muda decisão: todas continuam passando no limiar. Valores agora calculados por `src/lib/contraste.ts` e travados por teste | Leandro F. |
| 1.1 | 04/08/2026 | Grafia do nome fixada em **Pulse** (inglês), substituindo o nome de trabalho "Perene". Registrado em §3.4 o que a grafia inglesa custa ao trocadilho português e por que o mantra mantém o substantivo *pulso*. Domínios e handles atualizados. Fase A executada em parte: logo nas 4 versões (SVG + componente), tokens implementados como fonte única, três famílias tipográficas carregadas | Leandro F. |

### Pendências abertas

| # | Pendência | Bloqueia | Prazo |
|---|---|---|---|
| 1 | Verificar domínio e INPI para "Pulse" | Toda a Fase A | Imediato |
| 2 | Confirmar arquitetura — Pulse independente ou vinculada à Aprumo | 3.3, 3.4, 5.1 | Antes do registro |
| 3 | Rodar survey e entrevistas | Fase 2 inteira | 30 dias |
| 4 | Obter 3 bases-piloto e rodar o diagnóstico | Insights 2, 3 e 4; primeiro case | 45 dias |
| 5 | Iniciar aprovação de template Meta (Utility) | Régua de mensagem | Iniciar já — prazo externo |
| 6 | Definir a fórmula de cobrança sobre economia comprovada | Modelo de preço (questão nº 1 dos requisitos) | Antes da primeira venda |
| 7 | Confirmar na documentação vigente do Asaas quais jornadas de autorização existem | Página do pagador (questão nº 4 dos requisitos) | Antes da Fase C |

---

**FIM DO BRAND BOOK**

© 2026 Pulse. Todos os direitos reservados.
Documento confidencial e de uso exclusivo da organização.
