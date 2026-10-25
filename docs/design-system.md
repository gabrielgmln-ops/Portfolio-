# Design system — "Registro"

Fonte única: `src/styles/tokens.css`. Nenhuma cor ou espaçamento fica fora dos tokens
(verificação por grep no fim deste arquivo).

## Cores

| Token                              | Valor                 | Uso                                                                                                    |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| `--petroleo-900`                   | `#14262A`             | fundo (escuro) / texto (claro)                                                                         |
| `--petroleo-800`                   | `#1A3236`             | superfície secundária (escuro)                                                                         |
| `--petroleo-700`                   | `#1F3A3E`             | superfície, verso da moldura                                                                           |
| `--ouro`                           | `#C2A267`             | moldura, numerais, links, foco (escuro)                                                                |
| `--ouro-escuro`                    | `#6E5628`             | links e foco no claro. O `#7E6430` sugerido dá 4,39:1 em creme e **não** passa AA; escureci até 5,45:1 |
| `--creme`                          | `#EFE3C8`             | texto (escuro) / fundo (claro)                                                                         |
| `--creme-2`                        | `#BFB49C`             | texto secundário (escuro)                                                                              |
| `--cinza-petroleo`                 | `#4A5C5E`             | texto secundário (claro)                                                                               |
| `--vinho`                          | `#A4545C`             | traço do status "em desenvolvimento" (não usado como texto: 2,99:1 no petróleo)                        |
| `--vinho-claro` / `--vinho-escuro` | `#D08A90` / `#8A3F47` | texto de alerta/status no escuro / claro                                                               |

Semânticos: `--fundo`, `--superficie`, `--texto`, `--texto-2`, `--borda`, `--acento`, `--foco`, `--alerta`, `--moldura`.
O modo escuro é o padrão; `data-tema="claro"` no `<html>` inverte. Sem JS, `prefers-color-scheme` decide.

### Razões de contraste (WCAG 2.x, calculadas por script)

| Texto                    | Fundo                       | Razão | AA texto normal (4,5)                 |
| ------------------------ | --------------------------- | ----- | ------------------------------------- |
| creme `#EFE3C8`          | petróleo-900 `#14262A`      | 12,30 | sim                                   |
| creme                    | petróleo-700 `#1F3A3E`      | 9,52  | sim                                   |
| creme-2 `#BFB49C`        | petróleo-900                | 7,63  | sim                                   |
| creme-2                  | petróleo-700                | 5,90  | sim                                   |
| ouro `#C2A267`           | petróleo-900                | 6,46  | sim                                   |
| ouro                     | petróleo-700                | 5,00  | sim                                   |
| vinho-claro `#D08A90`    | petróleo-900                | 5,76  | sim                                   |
| vinho `#A4545C`          | petróleo-900                | 2,99  | **não** → só traço/ícone, nunca texto |
| petróleo-900             | creme                       | 12,30 | sim                                   |
| cinza-petróleo `#4A5C5E` | creme                       | 5,53  | sim                                   |
| cinza-petróleo           | creme-escuro `#E6D8B8`      | 4,99  | sim                                   |
| ouro-escuro `#6E5628`    | creme                       | 5,45  | sim                                   |
| ouro-escuro              | creme-escuro                | 4,92  | sim                                   |
| vinho-escuro `#8A3F47`   | creme                       | 5,72  | sim                                   |
| creme                    | petróleo-950 `#0E1B1E` (OG) | 13,81 | sim                                   |

Foco: anel de 2 px em `--foco` com 3 px de offset (ouro no escuro: 6,46:1; ouro-escuro no claro: 5,45:1 — ambos acima de 3:1 exigido para componentes).

## Tipografia

- **Serifa: Newsreader 500** (títulos, nomes de cartas). Avaliação das três candidatas para o nome da carta a 14 px (pelas métricas e desenho das fontes; a /_kit mostra o nome a 14 px para conferência visual):
  Cormorant Garamond tem hastes finas demais e x-height baixa — some sobre o petróleo a 14 px;
  IM Fell English tem a textura de gravura certa, mas o contorno irregular e a falta de pesos prejudicam a leitura em tamanho pequeno.
  Newsreader foi desenhada para texto em tela (eixo óptico), mantém serifas de inscrição e continua nítida a 14 px. Itálico 400 só para citações.
- **Sans: Source Sans 3** 400/600 para texto corrido.
- **Mono: IBM Plex Mono** 400 com `tabular-nums` para datas, status e resultados.
- Woff2 do Fontsource, só subset `latin` (cobre o português), `font-display: swap`, preload da serifa 500 e da sans 400 (o parágrafo de abertura costuma ser o LCP).
- Escala modular 1,25: `--t--1` 0,8 · `--t-0` 1 · `--t-1` 1,25 · `--t-2` 1,563 · `--t-3` 1,953 · `--t-4` 2,441 · `--t-5` 3,052 rem.
- Entrelinha 1,6 no texto, 1,25 na serifa; `--medida: 68ch` limita a linha.

## Espaço, raio, traço

- `--s-1`…`--s-10`: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px.
- `--raio-carta: 10px` só na carta; `--raio: 2px` em todo o resto.
- `--traco: 1px`, `--traco-foco: 2px`.

## Movimento

Tokens `--ease-*` e `--dur-*` — detalhes em `docs/motion.md`.

## Verificação por grep

Comando: `grep -rnoE "#[0-9a-fA-F]{3,6}|rgba?\(" src/components src/layouts src/pages src/styles`, excluindo `tokens.css`.

Resultado: 3 ocorrências, todas exceções justificadas:

- `#000` (2×) na `mask` do brilho M4: é um canal alfa, não uma cor exibida.
- `#14262A` em `<meta name="theme-color">`: o atributo HTML não aceita `var()`.
- As cores da imagem OG (`src/pages/og/`) espelham os tokens, porque o PNG não lê CSS.

Valores em px fora dos tokens: só geometria de movimento e do leque (`--dy` 0 a 10px, elevação de −6px, `perspective`) e traços de 1–2px. É o que a especificação de movimento pede.
