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

### Gravação com GPU real (23/10/2026)

Trace do DevTools (`devtools.timeline` + `gpu` + `viz`) num Chrome visível, com a GPU desta máquina (ANGLE, AMD Radeon RX 5500 XT, D3D11), em 1440×900. Script: `scripts/gravar-traces.mjs`. Os traces brutos ficam em `qa/traces/` (fora do git, ~30 MB); abra-os no painel Performance do DevTools.

| Cena                                         | Maior tarefa na main thread | Tarefas > 16,7 ms | Maior intervalo entre quadros | Quadros > 25 ms |
| -------------------------------------------- | --------------------------- | ----------------- | ----------------------------- | --------------- |
| M3, inclinação (120 movimentos de mouse)     | 4,1 ms                      | 0                 | 30,3 ms                       | 1               |
| M2, virada de todas as cartas                | 1,3 ms                      | 0                 | 13,6 ms                       | 0               |
| M1, distribuição + virada (antes do ajuste)  | 3,3 ms                      | 0                 | 33,5 ms                       | 2               |
| M1, distribuição + virada (depois do ajuste) | 3,8 ms                      | 0                 | 30,4 ms                       | 1               |

**Nenhum quadro longo é causado por JavaScript:** a main thread nunca passa de 4,1 ms.

- **M1.** Os dois quadros lentos eram raster na GPU (`RendererRasterWorker`, 15 e 32 ms): as faces da carta eram decodificadas e rasterizadas na hora em que começavam a se mover. Agora as imagens da tiragem são carregadas e decodificadas em tempo ocioso, antes da distribuição, e o `scale()` saiu dos keyframes. Sobrou 1 quadro de ~30 ms, ~295 ms após o início, quando o verso vira para a tela e a GPU rasteriza essa camada 3D pela primeira vez.
- **M3.** O único quadro de 30 ms não tem tarefa longa em nenhuma thread; foi o ritmo dos eventos de mouse sintéticos do Playwright.

## Ganchos v7

O redesenho v7 entrega **marcação + CSS estático + estados finais**. Sem JS (ou com `prefers-reduced-motion: reduce`) tudo aparece no estado final. O "escondido antes de animar" só vale sob **`html.js-motion`**, classe que o time de movimento põe no `<html>` quando há JS e não há redução de movimento (por arquivo externo ou módulo; a CSP proíbe script inline). Nada usa `opacity < 1` no estado de repouso.

| Gancho                                      | Onde                                             | Estado sem JS                                                                            | O que o movimento faz                                                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.intro` (+ `.sai`)                         | `Abertura.astro` (só na home, `Layout abertura`) | `display: none`                                                                          | exibe com `html.js-motion[data-intro]` (atributo posto antes do paint se a sessão ainda não viu), troca "Olá/Hello/Hola", adiciona `.sai` e remove                                                      |
| `.hero.on`                                  | `Hero.astro`                                     | cartas no leque                                                                          | sem `.on`, sob `js-motion`, as `.carta` ficam em `opacity:0; rotate(0) translate(0,35%) scale(.9)`; `.on` dispara a entrada com atraso por par (c2/c4 .08s, c1/c5 .16s)                                 |
| `.leque .carta` c1–c5                       | `Hero.astro`                                     | posições `--r/--x/--y`; hover abre mais (só `hover:hover` + `pointer:fine`)              | inclinação discreta opcional (nunca no toque)                                                                                                                                                           |
| `[data-letreiro]` (`.letreiro__trilho`)     | `Hero.astro`                                     | parado, 4 cópias (3 `aria-hidden`)                                                       | `transform: translateX()` contínuo, sentido pela rolagem; Lenis                                                                                                                                         |
| `.local__globo svg`                         | `Hero.astro`                                     | parado                                                                                   | já gira com CSS sob `js-motion`                                                                                                                                                                         |
| `[data-palavras]`                           | `Declaracao.astro`                               | frase inteira                                                                            | quebrar em `<span class="w"><span>palavra</span></span>` (o `<em>` inteiro vira uma palavra); `transition-delay` por palavra via CSSOM; `.declara.on` revela                                            |
| `.sobe` / `.mask` / `.retrato` / `.declara` | vários                                           | visíveis                                                                                 | `IntersectionObserver` adiciona `.on`                                                                                                                                                                   |
| `.nums b[data-conta]`                       | `Numeros.astro`                                  | valor final pt-BR                                                                        | contar de 0 até `data-conta`, com `data-casas`, `data-prefixo`, `data-sufixo`; R$ 0,00 não conta                                                                                                        |
| `figure.log[data-log]`                      | `LogTransacoes.astro`                            | "concluído", `1.000 / 1.000`, `R$ 0,00`, barra 100%, 12 linhas ilustrativas fixas        | `.rodando` (pisca o ponto), reescreve `.log__linhas`, `.log__barra i` (width via CSSOM), `.f-proc`, `.f-dif`, `.log__estado`; botão `[data-log-reiniciar]` só aparece sob `js-motion`                   |
| `.indice a[data-preview]`                   | `Indice.astro`                                   | link simples; no toque/sem hover a miniatura `.mini` aparece na linha                    | lê `data-preview` (URL webp 416px) e `data-preview-alt`; move `.preview` (img interna) e `.ver` (fixos, `aria-hidden`, em `PreviaCursor.astro`) e alterna `.vis` — só em `hover:hover` + `pointer:fine` |
| `.magnetico`                                | `.redondo` e `.pilula` apenas                    | parado                                                                                   | deslocamento magnético (fatores .35 / .22 do protótipo)                                                                                                                                                 |
| `.menu-btn.vis`, `html.aberto`              | `Header.astro`                                   | já funciona (script do componente: abre/fecha, `inert`, `aria-expanded`, Esc, véu, foco) | nada obrigatório; Lenis deve chamar o fechamento ao rolar para âncora (basta clicar no link: o script já fecha)                                                                                         |
| `[data-vt]`                                 | `CartaArcano.astro`, `.mini` do índice           | nome aplicado via CSSOM por `scripts/motion/cartas.ts`                                   | a View Transition carta → capa; o leque da home e a capa do projeto têm o mesmo `carta-<slug>`                                                                                                          |
| `[data-relogio]`                            | `Footer.astro`                                   | hora do build; o script do componente atualiza a cada 30 s                               | —                                                                                                                                                                                                       |

`transition:name` não é usado: o Astro geraria `<style>` inline (CSP). Continua o `data-vt` + CSSOM (ver "Desvios conscientes").

A M1 (distribuição da tiragem) e a M2 (virar a carta ao clicar) ficaram sem alvo: `Tiragem`, `Roteiro` e `TarotCard` saíram. `scripts/motion/distribuir.ts` e `contador.ts` não são mais importados; `cartas.ts` segue importado por `CartaArcano` só pelo `data-vt` (não há mais `a[data-carta]`).
