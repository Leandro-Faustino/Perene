# Logo — Pulse

Quatro versões, conforme brand book §5.1.

| Arquivo | Versão | Uso |
|---|---|---|
| `horizontal.svg` | Símbolo + logotipo | **Padrão.** Cabeçalho, deck, assinatura de e-mail |
| `vertical.svg` | Símbolo sobre o logotipo | Perfis sociais, espaços estreitos |
| `simbolo.svg` | Só as quatro barras | Favicon, ícone de app, avatar, medidor |
| `mono.svg` | Uma cor (`currentColor`) | Gravação, fundo colorido, uma cor só |

Para uso **dentro do app**, não consuma estes arquivos: use
[`src/components/marca/logo.tsx`](../../../src/components/marca/logo.tsx). O
componente lê os tokens, troca a quarta barra para `--pl-cobalto-claro` em fundo
escuro e não deixa a proporção de 70% ser alterada por engano.

## O que estes arquivos ainda não são

**O texto é `<text>`, não contorno.** Renderiza certo no app (Archivo é
carregada por `next/font`) e em qualquer máquina com a fonte instalada. Em
qualquer outro lugar — gráfica, brinde, arquivo enviado a terceiro, roll-up de
evento — o `pulse` vai sair na fonte de fallback.

Antes de mandar para impressão ou entregar a um fornecedor, converter o texto
para path. Só o símbolo (`simbolo.svg`, `mono.svg`) está pronto para qualquer
meio, porque é geometria pura.

**Falta o PNG e o favicon** em `@1x/@2x/@3x` e `16/32/180/512` (§7.3). Derivar
do SVG quando houver necessidade real.

## As regras que mais serão quebradas

- A quarta barra está em **70%** e essa altura carrega significado: é o cenário
  intermediário de adesão do RF-33. Não é ajuste ótico.
- A quarta barra **nunca** vira verde, âmbar ou vermelho — colide com o sistema
  de estados, onde essas cores são vocabulário, não paleta (§7.2).
- Cobalto sobre grafite reprova em contraste (3,0:1). Em fundo escuro, use
  `--pl-cobalto-claro` (7,1:1).
- Abaixo de 88px de largura, use o símbolo isolado — nunca a horizontal.
