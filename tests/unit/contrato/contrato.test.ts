import { describe, expect, it } from 'vitest';
import * as core from '../../../src/lib/conteudo-core';
import { contemPendente } from '../../../src/lib/validacao';
import { getPerfil } from '../../../src/lib/perfil';
import { jsonLdPerson, metaPagina, serializarJsonLd } from '../../../src/lib/seo';
import { dados, recursos } from '../conteudo/fixtures';

// 19 projetos, como no acervo real: 12 planejados, 4 em desenvolvimento, 3 concluídos.
const arcanos = [
  'louco',
  'mago',
  'sacerdotisa',
  'imperador',
  'hierofante',
  'enamorados',
  'carro',
  'justica',
  'eremita',
  'roda',
  'forca',
  'morte',
  'temperanca',
  'torre',
  'estrela',
  'lua',
  'sol',
  'julgamento',
  'mundo',
] as const;
const status = (i: number) => (i < 12 ? 'planejado' : i < 16 ? 'em-desenvolvimento' : 'concluido');
const entradas = arcanos.map((a, i) => ({
  id: `p${i}`,
  data: dados({
    slug: `p${i}`,
    arcano: a,
    ordem: i,
    status: status(i),
    competencias: [`c${i % 3}`],
    ...(status(i) === 'concluido' ? { resultado: 'r', medidoEm: '2026-10-30' } : {}),
  }),
}));
const TOTAL = entradas.length;

describe('contrato: nenhuma função pública devolve todos os projetos', () => {
  it('fixture tem 19 projetos', () => expect(TOTAL).toBe(19));
  it('projetosVisiveis < total e só visíveis', () => {
    const v = core.projetosVisiveis(entradas, recursos);
    expect(v.length).toBeLessThan(TOTAL);
    expect(v).toHaveLength(7);
    expect(v.every((p) => p.status !== 'planejado')).toBe(true);
  });
  it('roteiro(99) e roteiro(Infinity) < total (teto 4)', () => {
    for (const n of [99, Infinity, Number.NaN, TOTAL]) {
      const r = core.roteiro(entradas, recursos, n);
      expect(r.length).toBeLessThanOrEqual(core.TETO_ROTEIRO);
      expect(r.length).toBeLessThan(TOTAL);
    }
  });
  it('visíveis + roteiro nunca cobrem todos', () => {
    const slugs = new Set([
      ...core.projetosVisiveis(entradas, recursos).map((p) => p.slug),
      ...core.roteiro(entradas, recursos, 99).map((p) => p.slug),
    ]);
    expect(slugs.size).toBeLessThan(TOTAL);
  });
  it('competencias só contém projetos visíveis', () => {
    const c = core.competencias(core.projetosVisiveis(entradas, recursos));
    const todos = Object.values(c).flat();
    expect(todos.length).toBeGreaterThan(0);
    expect(todos.every((p) => p.status === 'em-desenvolvimento' || p.status === 'concluido')).toBe(true);
  });
});

describe('SEO', () => {
  it('JSON-LD Person sem [PENDENTE] e com campos do perfil', () => {
    const ld = jsonLdPerson(getPerfil());
    expect(ld['@type']).toBe('Person');
    expect(ld.name).toBe(getPerfil().nome);
    expect(ld.url).toBeUndefined();
    expect(contemPendente(ld)).toBe(false);
  });
  it('omite campos pendentes', () => {
    const ld = jsonLdPerson({ nome: 'N', idiomas: [] });
    expect(Object.keys(ld).sort()).toEqual(['@context', '@type', 'name']);
  });
  it('sem site: sem canonical nem og:url; com site: ambos', () => {
    const sem = metaPagina({ titulo: 't', caminho: '/' });
    expect(sem.canonical).toBeUndefined();
    expect(sem.og.some((m) => m.property === 'og:url')).toBe(false);
    const com = metaPagina({ titulo: 't', caminho: '/x', site: 'https://exemplo.test' });
    expect(com.canonical).toBe('https://exemplo.test/x');
  });
  it('serialização não fecha a tag script', () => {
    expect(serializarJsonLd({ a: '</script>' })).not.toContain('</');
  });
});
