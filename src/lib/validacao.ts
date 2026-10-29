// Lógica pura de validação (sem runtime do Astro): testável no Vitest.
import { z } from 'zod';
import { ARCANO_IDS } from '../content/arcanos';

export const PENDENTE = '[PENDENTE]';
export const PREENCHER = '[PREENCHER]';
export const SECOES_ESTUDO = ['Problema', 'Decisões', 'Testes', 'Resultado', 'Limitações'] as const;

type Aviso = (msg: string) => void;
const avisoPadrao: Aviso = (m) => console.warn(m);

export function contemPendente(v: unknown): boolean {
  return typeof v === 'string' && v.includes(PENDENTE);
}

/** Percorre recursivamente e devolve os caminhos de strings que casam com o predicado. */
export function encontrarStrings(v: unknown, pred: (s: string) => boolean, caminho = ''): string[] {
  if (typeof v === 'string') return pred(v) ? [caminho || '(raiz)'] : [];
  if (Array.isArray(v)) return v.flatMap((x, i) => encontrarStrings(x, pred, `${caminho}[${i}]`));
  if (v && typeof v === 'object' && !(v instanceof Date))
    return Object.entries(v).flatMap(([k, x]) => encontrarStrings(x, pred, caminho ? `${caminho}.${k}` : k));
  return [];
}

const urlOuPendente = z.union([z.literal(PENDENTE), z.url()]);
const TRILHAS = ['bancos', 'cyber', 'comex', 'variado'] as const;

export const trilhaSchema = z
  .union([z.literal(PENDENTE), z.enum(TRILHAS), z.array(z.enum(TRILHAS)).min(1)])
  // "[PENDENTE]" vira [] (sem trilha conhecida); o refine de projeto emite o warning.
  .transform((t): (typeof TRILHAS)[number][] => (t === PENDENTE ? [] : Array.isArray(t) ? t : [t]))
  .refine((t) => t.length === 1 || t.every((x) => x === 'bancos' || x === 'cyber'), {
    message: 'trilha em array só pode combinar "bancos" e "cyber"',
  });

export const projetoBaseSchema = z.object({
  titulo: z.string().min(1),
  slug: z.string().min(1),
  ordem: z.number().int().nonnegative(),
  status: z.enum(['planejado', 'em-desenvolvimento', 'concluido']),
  trilha: trilhaSchema,
  arcano: z.enum(ARCANO_IDS, { message: 'arcano ausente ou fora da tabela de arcanos' }),
  resumo: z.string().max(160),
  papel: z.string(),
  tecnologias: z.array(z.string()),
  competencias: z.array(z.string()),
  prova: z.string(),
  resultado: z.string().optional(),
  resultadoNumero: z.number().optional(),
  medidoEm: z.coerce.date().optional(),
  metricas: z
    .array(
      z.object({
        numero: z.number(),
        casas: z.number().int().min(0).max(4).optional(),
        prefixo: z.string().optional(),
        sufixo: z.string().optional(),
        rotulo: z.string().min(1),
      }),
    )
    .optional(),
  ficha: z.array(z.object({ rotulo: z.string().min(1), valor: z.string().min(1) })).optional(),
  stackCurta: z.string().optional(),
  linhaIndice: z.string().max(90).optional(),
  repo: urlOuPendente.optional(),
  githubRepo: z
    .string()
    .regex(/^[\w.-]+\/[\w.-]+$/, 'githubRepo deve ser "usuario/repo"')
    .optional(),
  demo: urlOuPendente.optional(),
  destaque: z.enum(['principal', 'secundario']).optional(),
  plataforma: z.literal('bank-platform').optional(),
  estudoDeCaso: z.boolean(),
  ano: z.number().int(),
  atualizadoEm: z.coerce.date(),
  changelog: z.array(z.object({ data: z.coerce.date(), texto: z.string() })).default([]),
});

export type DadosProjeto = z.output<typeof projetoBaseSchema>;

/** Regras 1, 2 e 5 (por entrada) + warning de [PENDENTE]. A regra 3 vem do enum. */
export function refinarProjeto(d: DadosProjeto, ctx: z.RefinementCtx, aviso: Aviso = avisoPadrao): void {
  if (d.resultado !== undefined && d.status !== 'concluido')
    ctx.addIssue({
      code: 'custom',
      path: ['resultado'],
      message: 'regra 1: "resultado" só é permitido com status "concluido"',
    });
  if (d.metricas !== undefined && d.status !== 'concluido')
    ctx.addIssue({
      code: 'custom',
      path: ['metricas'],
      message: '"metricas" só é permitido com status "concluido"',
    });
  if (d.status === 'concluido' && (d.resultado === undefined || d.medidoEm === undefined))
    ctx.addIssue({
      code: 'custom',
      path: ['status'],
      message: 'regra 2: status "concluido" exige "resultado" e "medidoEm"',
    });
  if (d.resultadoNumero !== undefined && d.resultado === undefined)
    ctx.addIssue({
      code: 'custom',
      path: ['resultadoNumero'],
      message: '"resultadoNumero" só é permitido junto com "resultado"',
    });
  for (const c of encontrarStrings(d, (s) => s.includes(PREENCHER)))
    ctx.addIssue({ code: 'custom', path: [c], message: `regra 5: campo "${c}" contém ${PREENCHER}` });
  const pend = encontrarStrings(d, (s) => s.includes(PENDENTE));
  if (d.trilha.length === 0) pend.unshift('trilha');
  if (pend.length) aviso(`[conteudo] ${d.slug}: campos [PENDENTE] omitidos: ${pend.join(', ')}`);
}

export function criarProjetoSchema(aviso: Aviso = avisoPadrao) {
  return projetoBaseSchema.superRefine((d, ctx) => refinarProjeto(d, ctx, aviso));
}

export const marcoSchema = z.object({
  data: z.coerce.date(),
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  tipo: z.enum(['formacao', 'trabalho', 'projeto']),
  planejado: z.boolean().default(false),
});
export type DadosMarco = z.output<typeof marcoSchema>;

/** Seções obrigatórias ausentes num corpo MDX bruto (headings "## X"). */
export function secoesAusentes(corpo: string): string[] {
  const titulos = new Set([...corpo.matchAll(/^##\s+(.+?)\s*#*\s*$/gm)].map((m) => (m[1] ?? '').trim().toLowerCase()));
  return SECOES_ESTUDO.filter((s) => !titulos.has(s.toLowerCase()));
}

export interface EntradaValidavel {
  id: string;
  data: DadosProjeto;
  body?: string | undefined;
}

/** Regras de coleção: 4 (arcano/slug duplicado) e 6 (seções do estudo de caso). Devolve erros. */
export function validarColecao(entradas: readonly EntradaValidavel[]): string[] {
  const erros: string[] = [];
  const porSlug = new Map<string, string>();
  const porArcano = new Map<string, string>();
  for (const e of entradas) {
    const { slug, arcano } = e.data;
    const s = porSlug.get(slug);
    if (s) erros.push(`regra 4: slug "${slug}" duplicado em ${s} e ${e.id}`);
    else porSlug.set(slug, e.id);
    const a = porArcano.get(arcano);
    if (a) erros.push(`regra 4: arcano "${arcano}" duplicado em ${a} e ${e.id}`);
    else porArcano.set(arcano, e.id);
    if (e.data.estudoDeCaso) {
      const faltam = secoesAusentes(e.body ?? '');
      if (faltam.length) erros.push(`regra 6: ${e.id} tem estudoDeCaso sem as seções: ${faltam.join(', ')}`);
    }
  }
  return erros;
}
