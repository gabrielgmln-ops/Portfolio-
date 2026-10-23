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
