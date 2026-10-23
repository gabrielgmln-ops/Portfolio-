# Movimento

Os tokens ficam em `src/styles/tokens.css`:

- **Easing:** `--ease-out-quart` (entradas), `--ease-out-expo` (virar carta) e `--ease-in-out-cubic` (movimento em tela).
- **Duração:** `--dur-micro` 140ms, `--dur-ui` 220ms, `--dur-carta` 650ms e `--dur-cena` 900ms.

## Regras

- Só `transform` e `opacity` são animados. A exceção é `filter` na dessaturação, e só em hover.
- Todo conteúdo está no HTML desde o primeiro paint. A animação parte do estado final (FLIP / `fill: backwards`).
- Clique, tecla ou rolagem chamam `animation.finish()` (`scripts/motion/util.ts`). Há 250 ms de tolerância para a própria rolagem que trouxe o elemento à tela.
- `will-change` só existe durante a animação.
- Hover só dentro de `(hover: hover) and (pointer: fine)`.
- Sem bibliotecas: CSS + Web Animations API. O Motion One não foi necessário.

| #   | O quê                                                                                 | Gatilho                                                                       | Duração / easing                                                     | Onde                            | Por quê                         | Com redução de movimento                                             |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| M1  | Distribuição da tiragem: as cartas saem da pilha do Roteiro até o leque               | home, 1ª vez por sessão (`sessionStorage`), quando a tiragem fica 35% visível | 520ms, `--ease-out-quart`, stagger de 70ms, teto de 5 cartas         | `scripts/motion/distribuir.ts`  | o baralho é "dado" ao visitante | não roda                                                             |
| M2  | Virar a carta, `rotateY(180→0)`                                                       | clique/Enter na carta; também durante a M1                                    | `--dur-carta`, `--ease-out-expo`                                     | `scripts/motion/cartas.ts`      | a carta vira quando há prova    | não roda; a navegação é normal                                       |
| M3  | Elevação de −6px + inclinação de ±6° seguindo o ponteiro (rAF, variáveis `--rx/--ry`) | hover com mouse; no foco, só a elevação                                       | entrada em `--dur-ui` com `ease`; volta em 220ms                     | `TarotCard.astro` + `cartas.ts` | peso físico                     | sem transição e sem inclinação                                       |
| M4  | Brilho de folha de ouro (faixa a 18%, `screen`, `mask`)                               | a carta `revelada` fica 60% visível; uma vez                                  | `--dur-cena`, `--ease-in-out-cubic`                                  | `TarotCard.astro` + `cartas.ts` | marca o que está comprovado     | não roda                                                             |
| M5  | View Transition home → projeto (a carta vira a capa)                                  | navegação (`<ClientRouter />`)                                                | grupo em 420ms com `--ease-in-out-cubic`; crossfade da raiz em 200ms | `motion.css` + `cartas.ts`      | continuidade espacial           | `animation: none`                                                    |
| M6  | Revelação das seções do estudo de caso (`opacity` .0→1, `translateY` 12px→0)          | rolagem, `animation-timeline: view()`, `entry 0%–40%`                         | linear sobre o progresso da rolagem                                  | `motion.css`                    | ritmo de leitura                | a regra só existe em `no-preference`; sem suporte, tudo fica visível |
| M7  | Contador de 0 até `resultadoNumero`                                                   | o bloco Resultado fica 60% visível                                            | 1200ms, aproximação de expo-out (`1−2^−10t`) em rAF                  | `scripts/motion/contador.ts`    | dá peso à prova                 | não roda; o número final já está no HTML                             |
| M8  | 404: a carta de cabeça para baixo se endireita até 172°                               | carregamento                                                                  | `--dur-carta`, `--ease-out-quart`                                    | `motion.css`                    | humor contido                   | fica direto em 172°                                                  |

## Desvios conscientes

- **M5 sem `transition:name`.** A diretiva do Astro gera um `<style>` inline, que a CSP (`style-src 'self'`) bloqueia; o teste e2e acusou. O nome vai em `data-vt` e é aplicado por CSSOM (`style.setProperty('view-transition-name', …)`), que a CSP permite.
- **M6 "uma vez por seção".** Uma animação ligada à rolagem é reversível: ao rolar de volta, a seção refaz o trecho de entrada. Ela nunca termina invisível.
- **M7 e acessibilidade.** O texto animado é `aria-hidden` e uma cópia `sr-only` traz o resultado completo. Vários leitores de tela ignoram `aria-label` num `<span>` sem papel.

## Medições

Quadro a quadro com `requestAnimationFrame`, no Chromium headless do Playwright, em 1440×900, com 70 quadros:

| Cena                                    | Maior intervalo entre quadros | Quadros > 25 ms |
| --------------------------------------- | ----------------------------- | --------------- |
| M3, inclinação (40 movimentos de mouse) | 16,8 ms                       | 0               |
| M1 + M2, distribuição e virada          | 16,8 ms                       | 0               |

**Ainda não feito:** gravação no painel Performance do Chrome DevTools numa máquina real com GPU. Como fazer:

1. Rode `pnpm preview`.
2. Abra o DevTools → Performance e comece a gravar.
3. Passe o mouse nas cartas e recarregue a home numa aba anônima.
