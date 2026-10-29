# Design system — v7

Fonte única: `src/styles/tokens.css`. Os nomes dos tokens são os mesmos do protótipo
`prototipos/portfolio-v7-dennis.html`, para que o CSS dos componentes possa ser copiado dele.

## Tema

- Atributo: `data-tema` no `<html>`, valores `escuro` | `claro` (só esse; não existe `data-theme`).
- Chave no `localStorage`: `tema`.
- Padrão: **escuro**. Sem escolha salva (ou com storage bloqueado / sem JS), vale o escuro; `prefers-color-scheme` não é mais consultado.
- `public/tema.js` (script externo, a CSP proíbe inline) aplica a escolha salva antes do primeiro paint; `src/scripts/tema.ts` alterna pelo botão `[data-tema-botao]` (com `aria-pressed="true"` no claro) e reaplica após `astro:after-swap`.

## Cores

| Token            | Escuro (padrão)                  | Claro                           |
| ---------------- | -------------------------------- | ------------------------------- |
| `--fundo`        | `#0C1717`                        | `#F3F3EF`                       |
| `--fundo-2`      | `#112223`                        | `#FFFFFF`                       |
| `--fundo-3`      | `#1F3A3E`                        | `#1F3A3E`                       |
| `--linha`        | `#1F3536`                        | `#DCDCD3`                       |
| `--linha-forte`  | `#5B7A77`                        | `#7F8782`                       |
| `--ouro`         | `#C9A96A`                        | `#8A6A2C`                       |
| `--ouro-2`       | `#E2C98F`                        | `#6B511F`                       |
| `--ouro-tinta`   | `#121A19`                        | `#FFFFFF`                       |
| `--texto`        | `#E9DEC5`                        | `#121D1C`                       |
| `--texto-2`      | `#B4AE9E`                        | `#4A5552`                       |
| `--texto-3`      | `#8E968E`                        | `#5F6965`                       |
| `--rodape`       | `#081111`                        | `#132526`                       |
| `--rodape-texto` | `#E9DEC5`                        | `#E9DEC5`                       |
| `--rodape-2`     | `#B4AE9E`                        | `#B4AE9E`                       |
| `--sombra`       | `0 2.25rem 3.5rem -1.5rem #000d` | `0 2rem 3rem -1.5rem #13201f66` |
| `color-scheme`   | `dark`                           | `light`                         |

Independentes de tema: `--serifa`, `--sans`, `--mono`, `--saida` `cubic-bezier(.22,1,.36,1)`, `--expo` `cubic-bezier(.76,0,.24,1)`, `--gutter` `clamp(1rem,4vw,4rem)`.

### Contraste (WCAG 2.x, calculado por script node)

| Tema   | Texto       | Fundo       | Razão   | Resultado |
| ------ | ----------- | ----------- | ------- | --------- |
| escuro | `--texto`   | `--fundo`   | 13.66:1 | AA        |
| escuro | `--texto`   | `--fundo-2` | 12.31:1 | AA        |
| escuro | `--texto-2` | `--fundo`   | 8.25:1  | AA        |
| escuro | `--texto-2` | `--fundo-2` | 7.43:1  | AA        |
| escuro | `--texto-3` | `--fundo`   | 6.00:1  | AA        |
| escuro | `--texto-3` | `--fundo-2` | 5.41:1  | AA        |
| escuro | `--ouro`    | `--fundo`   | 8.14:1  | AA        |
| claro  | `--texto`   | `--fundo`   | 15.50:1 | AA        |
| claro  | `--texto`   | `--fundo-2` | 17.24:1 | AA        |
| claro  | `--texto-2` | `--fundo`   | 6.96:1  | AA        |
| claro  | `--texto-2` | `--fundo-2` | 7.74:1  | AA        |
| claro  | `--texto-3` | `--fundo`   | 5.11:1  | AA        |
| claro  | `--texto-3` | `--fundo-2` | 5.68:1  | AA        |
| claro  | `--ouro`    | `--fundo`   | 4.52:1  | AA        |

Todos passam AA para texto normal (4,5:1); nenhum token precisou de ajuste. O `--ouro` claro passa por pouco (4,52:1): evite usá-lo como texto sobre superfícies mais escuras que `--fundo`.

## Tipografia

- **Newsreader** 300 e 400 normal, 300 itálico (v7); 500 normal e 400 itálico mantidos por legado.
- **Source Sans 3** 400/600, **IBM Plex Mono** 400.
- Fontsource, subset `latin`, `font-display: swap`, sem Google Fonts (CSP). Preload (no Layout) da Newsreader 500 e da Source Sans 400. Os arquivos estáticos não têm eixo `opsz`.

| Token                | Valor                                   | Uso                |
| -------------------- | --------------------------------------- | ------------------ |
| `--t-letreiro`       | `clamp(5rem, 15vw, 14rem)`              | letreiro do hero   |
| `--t-destaque`       | `clamp(3rem, 2rem + 4vw, 6rem)`         | título do destaque |
| `--t-indice`         | `clamp(1.8rem, 1.2rem + 2.4vw, 3.4rem)` | itens do índice    |
| `--t-declaracao`     | `clamp(1.9rem, 1.2rem + 2.6vw, 3.3rem)` | declaração         |
| `--t-rodape`         | `clamp(2.8rem, 1.6rem + 5.5vw, 7rem)`   | chamada do rodapé  |
| `--t-corpo`          | `1.0625rem`                             | texto corrido      |
| `--entrelinha-corpo` | `1.6`                                   | texto corrido      |

## Base (`base.css`)

Reset, `body`, `::selection` (ouro + ouro-tinta), `:focus-visible` (2 px ouro, offset 4 px), `.skip` (e `.pular`, legado), `.px` (gutter), `.mono`, `img`, `a` (herda cor, sem sublinhado), `button`. Estilos de componentes ficam nos componentes.

## Legado

Mantidos em `tokens.css` sob o comentário "LEGADO", até nenhum componente usá-los:

- Paleta crua: `--petroleo-*`, `--creme*`, `--cinza-petroleo`, `--vinho*`, `--ouro-escuro`.
- Aliases: `--superficie`/`--superficie-2` → `--fundo-2`; `--borda` → `--linha`; `--acento`/`--foco` → `--ouro`; `--moldura` `#C9A96A`; `--alerta` (vinho por tema); `--fundo-og`; `--fonte-serifa/sans/mono` → `--serifa/--sans/--mono`.
- Escala `--t--1`…`--t-5`, `--entrelinha-*`, `--medida`, espaço `--s-*`, `--raio*`, `--traco*`, `--ease-*`, `--dur-*`, `--carta-largura`.
- Utilitários em `base.css`: `.pular`, `.sr-only`, `.envoltorio`, `.secao`, `.texto-2`, `.botao`, margens de `h1–h4`/`p`.

Atenção: `--ouro` agora muda por tema (antes era fixo `#C2A267`).
