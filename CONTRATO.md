# Contrato back-end ↔ front-end

O front-end importa **somente** de `src/lib/conteudo.ts` (e `src/lib/contato.ts` para o formulário).
Tipos completos: `src/types/index.ts` (reexportados por `conteudo.ts`).

## Funções

| Função | Retorno | Garantia |
|---|---|---|
| `getProjetosVisiveis()` | `Promise<Project[]>` | só `em-desenvolvimento` e `concluido`; ano desc, depois `ordem` asc |
| `getRoteiro(n = 4)` | `Promise<Project[]>` | só `planejado`, `ordem` asc, **no máximo 4** (n é limitado a [0, 4]) |
| `getProjeto(slug)` | `Promise<Project \| undefined>` | um projeto por vez |
| `getCarta(p)` | `Carta` | planejado → `verso`; em-desenvolvimento → arte (o front aplica o filtro); concluido → `revelada`; `alt` nunca vazio |
| `getMarcos()` | `Promise<Milestone[]>` | ordem cronológica |
| `getCompetencias()` | `Promise<Record<string, Project[]>>` | só projetos visíveis |
| `getPerfil()` | `Perfil` | campos pendentes vêm `undefined` |
| `enviarContato(dados)` | ver `src/lib/contato.ts` | `{ ok: true } \| { ok: false; erro; campos? }` |

## Regras garantidas (com teste)

- Nenhuma função pública devolve todos os projetos de uma vez.
- `resultado` / `resultadoNumero` / `medidoEm` só existem quando `status === 'concluido'`.
- Todo `[PENDENTE]` chega como `undefined` (ou `[]` em listas); nunca como texto.
- `github` pode faltar (falha da API nunca vira dado estimado).
- `resultadoNumero` ausente → o contador não anima.

## Changelog

- 2026-10-21 · v1 publicada.
  - Diferenças em relação ao rascunho do prompt: `resumo`, `papel` e `prova` são **opcionais** (`[PENDENTE]` → `undefined`).
  - `trilha` sempre array (pode ser `[]` quando pendente).
  - `Perfil` definido: `nome`, `apresentacao?`, `email?`, `github?: { usuario, url }`, `linkedin?`, `idiomas`.
