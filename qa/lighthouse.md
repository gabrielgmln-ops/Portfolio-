# Lighthouse

Números reais de 23/10/2026, com `pnpm lhci:mobile` e `pnpm lhci:desktop`, no Chromium 1248 do Playwright.

| Forma   | Página               | Perf | A11y | Best Pr. | SEO  | LCP   | CLS   |
| ------- | -------------------- | ---- | ---- | -------- | ---- | ----- | ----- |
| mobile  | /404.html            | 92   | 100  | 82       | 63\* | 3.0 s | 0.013 |
| mobile  | /                    | 81   | 100  | 82       | 100  | 4.3 s | 0.001 |
| mobile  | /projetos            | 89   | 100  | 82       | 100  | 3.4 s | 0.021 |
| mobile  | /projetos/ledger-api | 89   | 100  | 82       | 100  | 3.4 s | 0.001 |
| mobile  | /projetos/portfolio  | 89   | 100  | 82       | 100  | 3.4 s | 0.001 |
| desktop | /404.html            | 99   | 100  | 81       | 63\* | 0.8 s | 0     |
| desktop | /                    | 98   | 100  | 81       | 100  | 1.0 s | 0     |
| desktop | /projetos            | 99   | 100  | 81       | 100  | 0.9 s | 0     |
| desktop | /projetos/ledger-api | 99   | 100  | 81       | 100  | 0.9 s | 0.001 |
| desktop | /projetos/portfolio  | 99   | 100  | 81       | 100  | 0.9 s | 0.001 |

\* A 404 é `noindex` de propósito, e a configuração já isenta o SEO dela.

**A meta de ≥ 95 não foi atingida em Performance no mobile, nem em Best Practices.**

## Por que

- **Best Practices (81–82).** A única auditoria reprovada é `is-on-https`. Quem a causa são os scripts do antivírus Kaspersky (`gc.kis.v2.scr.kaspersky-labs.com`), injetados no Chrome desta máquina. Não vêm do site.
- **Performance no mobile.** O LCP é a arte da carta. A imagem chega em menos de 100 ms, mas há 2,3 a 3,8 s de "render delay" depois disso. Os scripts injetados pelo antivírus bloqueiam a renderização e provavelmente inflam esse número. Precisa ser medido sem eles.

## Como medir de novo

Rode em ambiente limpo: na CI do GitHub Actions ou numa máquina onde o antivírus não injete scripts.

```bash
pnpm build && pnpm lhci
```

## Nova medição — 23/10/2026, à noite (scripts do antivírus bloqueados)

Lighthouse 12.6.1 mobile, rodado direto com `--blocked-url-patterns="*kaspersky-labs.com*"` para simular uma máquina limpa, contra `dist/` servido com os cabeçalhos do `vercel.json`.

Mudanças desde a primeira medição:

- CSS num arquivo só (`cssCodeSplit: false`): eram 4–5 folhas bloqueando o primeiro paint, a ~300 ms cada.
- O verso da carta (face escondida) passou a carregar com `loading="lazy"` e `fetchpriority="low"`: antes disputava banda com a arte.
- A carta da abertura usa `sizes="16rem"`; AVIF/WebP com `quality=60`.

| Página               | Perf | A11y | Best Pr. | SEO | LCP   |
| -------------------- | ---- | ---- | -------- | --- | ----- |
| /                    | 95   | 100  | 100      | 100 | 2.7 s |
| /projetos            | 97   | 100  | 100      | 100 | 2.2 s |
| /projetos/ledger-api | 98   | 100  | 100      | 100 | 2.2 s |

Sem o antivírus, Best Practices vai a 100. A confirmação final continua sendo `pnpm lhci` na CI.

## CI do GitHub Actions — 25/10/2026, commit db06e3e (fonte oficial)

`pnpm lhci` passou: 6 páginas × 3 execuções, mobile e desktop, todas as asserções ≥ 95 (a 404 é isenta de SEO por ser `noindex`).

Mediana no desktop: 100 / 100 / 100 / 100 em `/`, `/sobre/`, `/projetos/`, `/projetos/ledger-api/` e `/projetos/portfolio/`; a 404 fica em 100 / 100 / 100 / 63.
Os relatórios do mobile não ficaram no artefato (só os do último `autorun`), mas a etapa passou, então todas as categorias ficaram ≥ 95.

O que levou a CI ao verde: lista explícita das páginas públicas (antes a `/_kit`, interna, entrava na auditoria), cartas acima da dobra sem lazy em `/projetos`, preload da fonte do texto (o parágrafo de abertura era o LCP da home) e mediana de 3 execuções.

## v7 — 2026-10-29

Lighthouse CI (`@lhci/cli` 0.15) sobre `dist/`, mediana de 3 execuções por URL, rodado nesta máquina em 30/10/2026 depois das correções do v7. A lista de URLs ganhou `/projetos/motor-antifraude/`.

Como a máquina tem o antivírus Kaspersky injetando `http://gc.kis.v2.scr.kaspersky-labs.com/...` em toda página, rodei com `LHCI_SEM_INJECAO=1` (nova opção em `lighthouserc.cjs` que passa `blockedUrlPatterns: ['*kaspersky-labs.com*']`; na CI não muda nada). Sem esse bloqueio, a primeira execução deu Performance mobile de 83–88 (FCP ~2,7 s, inflado pelos scripts injetados).

Colunas: Performance | Acessibilidade | Boas práticas | SEO, e LCP mediano.

| URL                         | Mobile                 | LCP mobile | Desktop                 | LCP desktop |
| --------------------------- | ---------------------- | ---------- | ----------------------- | ----------- |
| /                           | 95 \| 100 \| 82 \| 100 | 2,6 s      | 99 \| 100 \| 81 \| 100  | 0,58 s      |
| /plataforma/                | 95 \| 100 \| 82 \| 100 | 2,6 s      | 100 \| 100 \| 81 \| 100 | 0,54 s      |
| /sobre/                     | 97 \| 100 \| 82 \| 100 | 2,3 s      | 100 \| 100 \| 81 \| 100 | 0,53 s      |
| /projetos/                  | 98 \| 100 \| 82 \| 100 | 2,0 s      | 100 \| 100 \| 81 \| 100 | 0,49 s      |
| /projetos/ledger-api/       | 95 \| 100 \| 82 \| 100 | 2,6 s      | 100 \| 100 \| 81 \| 100 | 0,52 s      |
| /projetos/motor-antifraude/ | 94 \| 100 \| 82 \| 100 | 2,6 s      | 100 \| 100 \| 81 \| 100 | 0,54 s      |
| /projetos/portfolio/        | 97 \| 100 \| 82 \| 100 | 2,4 s      | 100 \| 100 \| 81 \| 100 | 0,50 s      |
| /404.html (noindex)         | 97 \| 100 \| 82 \| 66  | 2,3 s      | 100 \| 100 \| 81 \| 66  | 0,46 s      |

CLS: 0,035–0,039 em `/` e 0,036 em `/plataforma/` no mobile; 0,000–0,007 no resto.

**O que não atingiu a meta e por quê**

- **Boas práticas 81–82 em todas as URLs:** a única auditoria reprovada é `is-on-https`, e os itens listados são só os scripts `http://gc.kis.v2.scr.kaspersky-labs.com/...` do antivírus (mesmo bloqueados, a tentativa de requisição HTTP é contada). Não vêm do site; na CI de 25/10 a categoria ficou em 100.
- **`/projetos/motor-antifraude/` mobile 94** (execuções vizinhas de 95 nas páginas irmãs com o mesmo LCP de 2,56 s): o LCP é a arte da carta da capa. Fica na margem de ruído; não houve mudança razoável a fazer sem trocar a arte. Confirmar na CI.
- SEO 66 na 404 é esperado (`noindex`), isento nas asserções.

**Corrigido no v7 que mexe nessas medidas:** `html.js-motion` passou a ser ligado por `public/movimento.js` síncrono no `<head>` (sem quadro do estado final antes de esconder); leque do celular com `sizes` de 9rem para a carta maior.

## v7.1 — 2026-10-30

`LHCI_SEM_INJECAO=1 corepack pnpm lhci:mobile` (mobile, mediana de 3 execuções, sobre o `dist/` com os 5 projetos novos). Execução representativa:

| Página                        | Performance | Acessibilidade | Boas práticas | SEO                        |
| ----------------------------- | ----------- | -------------- | ------------- | -------------------------- |
| `/`                           | 93          | 100            | 82            | 100                        |
| `/plataforma/`                | 95          | 100            | 82            | 100                        |
| `/sobre/`                     | 97          | 100            | 82            | 100                        |
| `/projetos/`                  | 98          | 100            | 82            | 100                        |
| `/projetos/ledger-api/`       | 95          | 100            | 82            | 100                        |
| `/projetos/motor-antifraude/` | 96          | 100            | 82            | 100                        |
| `/projetos/landed/` (nova)    | 95          | 100            | 82            | 100                        |
| `/projetos/portfolio/`        | 97          | 100            | 82            | 100                        |
| `/404.html`                   | 97          | 100            | 82            | 66 (noindex, não avaliado) |

A asserção falhou só em Boas práticas (82 < 95), em todas as páginas, pela mesma auditoria: `is-on-https`, apontando um script HTTP do antivírus Kaspersky (`gc.kis.v2.scr.kaspersky-labs.com`) injetado na página. Mesmo com o bloqueio do `LHCI_SEM_INJECAO`, a requisição ainda é contada. Não vem do site; precisa ser repetido numa máquina sem o antivírus (ou na CI) para confirmar o valor real.
