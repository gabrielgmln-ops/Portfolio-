# Portfólio — Gabriel Moraes (Registro + Tarô)

Astro 7 + TypeScript estrito, content collections com Zod, MDX. Quase zero JS no cliente.

## Rodar

```bash
corepack enable          # ou use "corepack pnpm" em todos os comandos
pnpm install
pnpm dev                 # http://localhost:4321
pnpm build               # roda scripts/github.ts (prebuild) e depois astro build
```

Verificações (as mesmas da CI): `pnpm lint`, `pnpm format:check`, `pnpm check`, `pnpm test`,
`pnpm test:e2e` (precisa de build; instale o navegador uma vez com `pnpm exec playwright install chromium`),
`pnpm lhci`.

> Windows: mantenha o projeto num caminho curto. Caminhos acima de 260 caracteres impedem o Node de
> iniciar o esbuild/Chrome (erro `spawnSync ... ENOENT`).

## Adicionar um projeto

Crie `src/content/projetos/<slug>.mdx` com o frontmatter do schema (`src/lib/validacao.ts`).
O `arcano` tem de existir em `src/content/arcanos.ts` e não pode repetir. Texto desconhecido = `"[PENDENTE]"`
(vira `undefined`, com warning no build). `[PREENCHER]` em qualquer lugar falha o build.
Com `estudoDeCaso: true`, o corpo precisa das seções `## Problema`, `## Decisões`, `## Testes`,
`## Resultado` e `## Limitações`.

## Marcar como concluído

`status: concluido` + `resultado` (texto curto do que foi medido) + `medidoEm` (data da medição).
`resultadoNumero` só se houver um número único medido (ativa o contador animado).
Sem `resultado`/`medidoEm`, o build falha — de propósito.

## Variáveis de ambiente

| Variável       | Onde                                   | Para quê                                                        |
| -------------- | -------------------------------------- | --------------------------------------------------------------- |
| `SITE_URL`     | build (Vercel / `vars.SITE_URL` na CI) | domínio real; sem ela, sitemap, canonical e og:url são omitidos |
| `GITHUB_TOKEN` | build, opcional                        | aumenta o limite da API do GitHub (anônimo: 60 req/h)           |

Não há segredos: o contato é `mailto:` (sem servidor).

## Segurança (vercel.json)

CSP `script-src 'self'; style-src 'self'` sem `unsafe-inline`. Exceções: `img-src data:` (favicon
placeholder) e `form-action mailto:` (contato). JSON-LD (`application/ld+json`) não é executado e não
precisa de exceção. **Front-end: `<script is:inline>` e `style=""` violam a CSP e o teste e2e acusa.**

## Deploy

No ar em https://gabriel-moraes-portfolio.vercel.app (projeto Vercel `gabriel-moraes-portfolio`, `SITE_URL` já configurado lá).
Deploy manual: `npx vercel deploy --prod`. Deploy automático a cada push só depois de instalar o app da Vercel no GitHub.

### Passos originais

1. Importar o repositório na Vercel (framework Astro, comando `pnpm build`, saída `dist`).
2. Definir `SITE_URL` com o domínio.
3. Conferir os cabeçalhos com `curl -I https://<domínio>`.
