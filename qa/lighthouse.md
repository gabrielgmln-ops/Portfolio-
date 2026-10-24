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
