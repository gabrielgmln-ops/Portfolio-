# Contrato back-end ↔ front-end

O front-end importa **somente** de `src/lib/conteudo.ts` (e `src/lib/contato.ts` para o formulário).
Tipos completos: `src/types/index.ts` (reexportados por `conteudo.ts`).

## Funções

| Função                  | Retorno                              | Garantia                                                                                                            |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `getProjetosVisiveis()` | `Promise<Project[]>`                 | só `em-desenvolvimento` e `concluido`; ano desc, depois `ordem` asc                                                 |
| `getRoteiro(n = 4)`     | `Promise<Project[]>`                 | só `planejado`, `ordem` asc, **no máximo 4** (n é limitado a [0, 4])                                                |
| `getProjeto(slug)`      | `Promise<Project \| undefined>`      | um projeto por vez                                                                                                  |
| `getCarta(p)`           | `Carta`                              | planejado → `verso`; em-desenvolvimento → arte (o front aplica o filtro); concluido → `revelada`; `alt` nunca vazio |
| `getMarcos()`           | `Promise<Milestone[]>`               | ordem cronológica                                                                                                   |
| `getCompetencias()`     | `Promise<Record<string, Project[]>>` | só projetos visíveis                                                                                                |
| `getPerfil()`           | `Perfil`                             | campos pendentes vêm `undefined`                                                                                    |
| `getEstudo(slug)`       | `Promise<Estudo \| undefined>`       | corpo MDX renderizável + títulos `##` com id; `undefined` se vazio ou com qualquer `[PENDENTE]`                     |
| `enviarContato(dados)`  | ver `src/lib/contato.ts`             | `{ ok: true } \| { ok: false; erro; campos? }`                                                                      |

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
- 2026-10-21 · v1.1
  - Contato: `src/lib/contato.ts` com `enviarContato`, `validarContato`, `montarMailto`, `HONEYPOT_CAMPO = 'site'`.
    Lançamento usa `mailto:`; o erro `'limite'` fica reservado para uma futura função serverless.
  - `validarContato` devolve `{ ok: true }` sem `dados` quando o honeypot vem preenchido (descarte silencioso).
  - SEO: `src/lib/seo.ts` (`jsonLdPerson()`, metas OG/canonical) para o layout do front usar.
  - Restrições da CSP para o front: nada de `<script is:inline>` nem atributo `style`.
- 2026-10-23 · v1.2
  - `getEstudo(slug)`: expõe o corpo do MDX ao estudo de caso (issue 1 do front). Corpo com `[PENDENTE]` não é publicado (`corpoPublicavel`, com teste).
- 2026-10-29 · v1.3
  - `Project` ganha campos opcionais: `metricas?: { numero; casas?; prefixo?; sufixo?; rotulo }[]` (só com status `concluido`, como `resultado`), `ficha?: { rotulo; valor }[]`, `stackCurta?: string` e `linhaIndice?: string` (≤ 90 caracteres).
  - Item de `ficha` com `[PENDENTE]` é retirado inteiro; `metricas` só chega quando `concluido`.
  - Novo arcano `imperatriz` (III). Mapeamento: I Mago → motor-antifraude, II Sacerdotisa → operacao-cofre, III Imperatriz → pix-simulado, IV Imperador → gateway-seguranca, V Hierofante → devsecops-siem. Planejados remanejados: comex-stat → lua, agendamento → forca, assistente-aduaneiro → torre.
  - Artes 01–05 declaradas como `.png`; enquanto o arquivo não existir, a carta usa o verso. O glob das cartas aceita `*.{jpg,png}`.
