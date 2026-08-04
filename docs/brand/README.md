# Biblioteca de ativos — Pulse

Mapa entre a estrutura descrita no brand book §7.3 e onde as coisas realmente
vivem neste repositório.

| Brand book §7.3 | Aqui | Observação |
|---|---|---|
| `01_Logo/SVG/` | [`docs/brand/logo/`](./logo/) | 4 versões. Ver o README de lá antes de usar em impressão. |
| `02_Cores/pulse-tokens.css` | [`src/styles/pulse-tokens.css`](../../src/styles/pulse-tokens.css) | **Arquivo canônico.** Vive no app de propósito — ver abaixo. |
| `02_Cores/contraste.html` | — | Pendente. |
| `03_Tipografia/` | `src/app/layout.tsx` | Archivo · Inter · JetBrains Mono, carregadas por `next/font/google`. Nada de arquivo de fonte no repositório. |
| `05_Ícones/` | `lucide-react` | Contorno, traço 1,5. Ícones de domínio ainda não desenhados. |
| `08_Brand_Book/` | [`docs/BRAND_BOOK.md`](../BRAND_BOOK.md) | |

## Por que os tokens não estão nesta pasta

O brand book §7.3 determina que `pulse-tokens.css` é a **fonte única de verdade**
de cor, e que cor definida fora dele é dívida técnica de marca.

Uma cópia em `docs/` e outra em `src/` garantiria divergência — e a divergência
apareceria primeiro justamente onde dói: um verde de "ativo" ligeiramente
diferente entre o painel e o PDF do diagnóstico. Então existe **um** arquivo,
dentro do app, e esta tabela aponta para ele.

O `globals.css` faz a ponte: as variáveis do Tailwind e do shadcn (`--primary`,
`--border`, `--ring`…) só recebem `var(--pl-*)`, nunca hexadecimal. Se um
componente precisa de uma cor que não existe nos tokens, a cor entra nos tokens
primeiro.

## Como auditar (§1.2, contrato de qualidade)

```bash
# Nenhum hexadecimal fora do arquivo de tokens.
# Exceções legítimas: SVGs standalone em docs/brand/logo/ (ativos entregues a
# terceiros, que precisam ser autocontidos) e o par branco/preto puro do
# globals.css.
grep -rnE '#[0-9a-fA-F]{3,8}\b' src/ --include='*.tsx' --include='*.ts'
```
