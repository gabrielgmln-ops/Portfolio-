# Refinamento visual

As capturas cobrem 375, 768 e 1440 px, nos temas claro e escuro, para todas as rotas e a 404.

- **Antes (ciclo 1):** `qa/antes/`
- **Atual:** `qa/screenshots/`

## Ciclo 1

**Problemas encontrados:**

1. No mobile, o trilho da tiragem centralizava com `justify-content: center` e cortava a primeira carta à esquerda.
2. O selo "em desenvolvimento" ficava no topo da carta, cobrindo a cena e disputando espaço com o numeral.
3. O rodapé mostrava "© 2026Gabriel": o formatador apagou o espaço.
4. A fonte da imagem OG não carregava, porque o Pango não lê WOFF; saía uma sans genérica.
5. Os nomes de View Transition geravam `<style>` inline e violavam a CSP.

**Correções:**

1. Margens automáticas no primeiro e no último item: o trilho centraliza sem cortar e mantém a rolagem.
2. O selo foi para cima da placa do nome.
3. Espaço explícito com `{' '}`.
4. Conversor WOFF→TTF no build (`src/ui/woff.ts`).
5. Os nomes passaram a ser aplicados via CSSOM.

## Ciclo 2

**Problemas encontrados:**

1. Na página do projeto aparecia "VIIIA Justiça": o numeral colava no nome, pelo mesmo motivo do formatador. **Corrigido.**
2. Na Ledger, Testes e Resultado repetem quase a mesma frase, porque `prova` ≈ `resultado` no conteúdo. Depende da issue 1 do back-end.
3. No mobile, o Lighthouse mede LCP de 3 a 4,3 s, com ~3 s de "render delay" depois que a imagem chega. Ver `qa/lighthouse.md`.
4. No Roteiro, só um item tem frase e critério, então as linhas ficam curtas. É pendência de conteúdo, não de layout.
5. Na home, O Louco aparece na abertura e na tiragem. Pela especificação ele está visível nos dois lugares; mantido.

## v7 — 2026-10-29/30

Capturas: `node qa/capturar-v7.mjs` (com o `dist` servido em 127.0.0.1:4321). Site em `qa/screenshots/v7/` (home, `/projetos/ledger-api`, `/plataforma`; 375/768/1440; escuro e claro; movimento reduzido, página inteira). Protótipo `portfolio-v7-dennis.html` em `qa/screenshots/prototipo/` (home, mesmas larguras e temas). Nenhuma rota tem rolagem horizontal em 375/768/1440 (`scrollWidth` = largura, medido em `/`, `/plataforma`, `/projetos/ledger-api`, `/sobre`, `/projetos`).

### Ciclo 1

Diferenças vistas:

1. **Leque no celular (375) pequeno demais**: cartas com ~88 px de largura contra ~125 px no protótipo; a carta central perdia presença. **Corrigido** em `Hero.astro`: `--w: clamp(6.25rem, 29vw, 8.5rem)`, altura do leque 17 → 19rem e `sizes` da imagem 8 → 9rem. Recapturado: as 5 cartas cabem em 375 px sem corte (Mago começa em ~25 px, Hierofante termina em ~350 px).
2. 1440: o leque fica um pouco mais perto do h1 que no protótipo, sem sobrepor. Mantido.

### Ciclo 2

1. **`/plataforma`: "e doMotor Antifraude"** na descrição em texto do diagrama (o compilador engoliu a quebra de linha antes do `<strong>`). **Corrigido** em `DiagramaPlataforma.astro` com `{' '}`; conferido no `dist` (nenhuma outra ocorrência de letra colada a `<strong>/<em>/<a>/<b>`).
2. 768: selo "Baseado em Guarulhos" ocupando a largura e "Back-end para bancos" sem respiro lateral — idêntico ao protótipo nessa largura. Mantido.

### Diferenças que sobraram (conscientes)

- Leque com 5 cartas em vez de 3 (há 5 projetos com arte; o protótipo usa Justiça + Louco + verso).
- Cartas sem arte mostram o verso; o protótipo mostra O Louco, que não é um projeto.
- Navegação (Trabalho/Plataforma/Sobre/Contato) visível no celular abaixo da marca; o protótipo esconde. Mantida por acessibilidade/descoberta, e o menu redondo aparece ao rolar.
- Item "Plataforma" na navegação (rota nova, não existe no protótipo).
- Log de transações: no protótipo a captura pega a animação em andamento; o site com movimento reduzido mostra o estado final com 12 linhas ilustrativas.
- `transition:name` substituído por `data-vt` + CSSOM por causa da CSP (`style-src 'self'`).
- Diagrama do `/plataforma` no celular: o texto do SVG fica pequeno (escala do viewBox); a descrição em texto logo abaixo cobre o conteúdo.
