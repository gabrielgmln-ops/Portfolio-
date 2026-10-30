// Testes sobre o conteúdo REAL (src/content), não sobre fixtures.
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARCANOS } from '../../../src/content/arcanos';
import { criarProjetoSchema, validarColecao, type DadosProjeto } from '../../../src/lib/validacao';
import { bruto } from './fixtures';

import { parse as lerYaml } from 'yaml';

const RAIZ = resolve(__dirname, '../../../src/content');
const DIR = join(RAIZ, 'projetos');
const schema = criarProjetoSchema(() => {});

function frontmatter(texto: string): { fm: unknown; corpo: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(texto);
  if (!m) throw new Error('sem frontmatter');
  return { fm: lerYaml(m[1] ?? ''), corpo: m[2] ?? '' };
}

const arquivos = readdirSync(DIR).filter((f) => f.endsWith('.mdx'));
const entradas = arquivos.map((f) => {
  const { fm, corpo } = frontmatter(readFileSync(join(DIR, f), 'utf8'));
  const r = schema.safeParse(fm);
  return { id: f, ok: r.success, erro: r.success ? '' : JSON.stringify(r.error.issues), data: r.data, body: corpo };
});
const validas = entradas.filter((e): e is typeof e & { data: DadosProjeto } => e.ok && e.data !== undefined);

function listarRecursivo(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? listarRecursivo(join(dir, d.name)) : [join(dir, d.name)],
  );
}

describe('acervo real (src/content/projetos)', () => {
  it('todo MDX passa no schema', () => {
    for (const e of entradas) expect(e.ok, `${e.id}: ${e.erro}`).toBe(true);
    expect(validas).toHaveLength(entradas.length);
  });
  it('nenhum concluido sem resultado ou medidoEm', () => {
    for (const e of validas.filter((x) => x.data.status === 'concluido')) {
      expect(e.data.resultado, e.id).toBeTruthy();
      expect(e.data.medidoEm, e.id).toBeInstanceOf(Date);
    }
  });
  it('regras de coleção passam (sem duplicados; estudos com as seções)', () => {
    expect(validarColecao(validas)).toEqual([]);
  });
  it('nenhum arcano nem slug duplicado entre os MDX', () => {
    const slugs = validas.map((e) => e.data.slug);
    const arcs = validas.map((e) => e.data.arcano);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(arcs).size).toBe(arcs.length);
  });
  it('nenhum arcano nem slug duplicado em ARCANOS', () => {
    expect(new Set(ARCANOS.map((a) => a.id)).size).toBe(ARCANOS.length);
    expect(new Set(ARCANOS.map((a) => a.slug)).size).toBe(ARCANOS.length);
  });
  it('arcano de cada MDX bate com o slug de ARCANOS', () => {
    for (const e of validas) {
      const def = ARCANOS.find((a) => a.id === e.data.arcano);
      expect(def?.slug, e.id).toBe(e.data.slug);
    }
  });
  it('os 11 projetos concluídos esperados existem com o arcano certo (+ portfólio = 12 cartas reveladas ou em curso)', () => {
    const esperado: Record<string, string> = {
      'ledger-api': 'justica',
      'motor-antifraude': 'mago',
      'operacao-cofre': 'sacerdotisa',
      'pix-simulado': 'imperatriz',
      'gateway-seguranca': 'imperador',
      'devsecops-siem': 'hierofante',
      'rastreador-importacao': 'enamorados',
      'despachante-digital': 'carro',
      landed: 'eremita',
      'monitor-cambio': 'roda',
      'robo-fechamento': 'forca',
    };
    const concluidos = Object.fromEntries(
      validas.filter((e) => e.data.status === 'concluido').map((e) => [e.data.slug, e.data.arcano]),
    );
    expect(concluidos).toEqual(esperado);
    // o 12º é o portfólio (O Louco), em desenvolvimento
    expect(validas.find((e) => e.data.slug === 'portfolio')?.data.arcano).toBe('louco');
  });
  it('enforcado (XII) e diabo (XV) existem; VI chama "Os Amantes"; agendamento saiu', () => {
    const def = (id: string) => ARCANOS.find((a) => a.id === id);
    expect(def('enforcado')).toMatchObject({ numeral: 'XII', nome: 'O Enforcado', slug: 'open-finance' });
    expect(def('diabo')).toMatchObject({ numeral: 'XV', nome: 'O Diabo', slug: 'motor-de-busca' });
    expect(def('enamorados')?.nome).toBe('Os Amantes');
    expect(validas.find((e) => e.data.slug === 'open-finance')?.data.arcano).toBe('enforcado');
    expect(validas.find((e) => e.data.slug === 'motor-de-busca')?.data.arcano).toBe('diabo');
    expect(validas.some((e) => e.data.slug === 'agendamento')).toBe(false);
  });
  it('só o Robô de Fechamento, entre os novos, entra na plataforma bancária', () => {
    const novos = ['rastreador-importacao', 'despachante-digital', 'landed', 'monitor-cambio', 'robo-fechamento'];
    const naPlataforma = validas
      .filter((e) => novos.includes(e.data.slug) && e.data.plataforma === 'bank-platform')
      .map((e) => e.data.slug);
    expect(naPlataforma).toEqual(['robo-fechamento']);
  });
  it('nenhum arquivo de conteúdo contém "navcargo"', () => {
    for (const f of listarRecursivo(RAIZ)) {
      if (!/\.(mdx?|ts)$/.test(f)) continue;
      expect(readFileSync(f, 'utf8').toLowerCase().includes('navcargo'), f).toBe(false);
    }
  });
});

describe('schema v1.3: metricas, ficha, stackCurta, linhaIndice', () => {
  const ok = (o: Record<string, unknown>) => schema.safeParse(bruto(o)).success;
  const concluido = { status: 'concluido', resultado: 'r', medidoEm: '2026-10-29' };
  const metricas = [{ numero: 82.7, casas: 1, sufixo: '%', rotulo: 'recall' }];
  it('metricas é aceita em concluido e rejeitada fora dele', () => {
    expect(ok({ ...concluido, metricas })).toBe(true);
    expect(ok({ metricas })).toBe(false);
    expect(ok({ status: 'em-desenvolvimento', metricas })).toBe(false);
  });
  it('ficha, stackCurta e linhaIndice são opcionais; linhaIndice ≤ 90', () => {
    expect(ok({ ficha: [{ rotulo: 'Linguagem', valor: 'Go' }], stackCurta: 'Go · Redis' })).toBe(true);
    expect(ok({ linhaIndice: 'a'.repeat(90) })).toBe(true);
    expect(ok({ linhaIndice: 'a'.repeat(91) })).toBe(false);
  });
});
