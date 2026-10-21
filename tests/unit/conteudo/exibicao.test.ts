import { describe, expect, it } from 'vitest';
import * as core from '../../../src/lib/conteudo-core';
import { dados, recursos } from './fixtures';

const arcs = ['mago', 'sacerdotisa', 'imperador', 'hierofante', 'enamorados', 'carro', 'eremita'] as const;
const entradas = [
  ...arcs.map((a, i) => ({ id: a, data: dados({ slug: a, arcano: a, ordem: 10 + i }) })),
  { id: 'dev', data: dados({ slug: 'dev', arcano: 'louco', ordem: 0, status: 'em-desenvolvimento', ano: 2025 }) },
  {
    id: 'ok',
    data: dados({
      slug: 'ok',
      arcano: 'justica',
      ordem: 7,
      status: 'concluido',
      resultado: 'r',
      medidoEm: '2026-10-30',
    }),
  },
];

describe('regras de exibição', () => {
  it('índice só tem em-desenvolvimento e concluido, ordenado por ano desc', () => {
    const v = core.projetosVisiveis(entradas, recursos);
    expect(v.map((p) => p.slug)).toEqual(['ok', 'dev']);
  });
  it('roteiro devolve no máximo 4, mesmo pedindo 10, em ordem asc', () => {
    expect(core.roteiro(entradas, recursos, 10)).toHaveLength(4);
    expect(core.roteiro(entradas, recursos).map((p) => p.ordem)).toEqual([10, 11, 12, 13]);
    expect(core.roteiro(entradas, recursos, -3)).toHaveLength(0);
    expect(core.roteiro(entradas, recursos).every((p) => p.status === 'planejado')).toBe(true);
  });
  it('resultado só sai quando concluido', () => {
    const p = core.montarProjeto({ id: 'x', data: { ...dados(), resultado: 'r' } }, recursos);
    expect(p.resultado).toBeUndefined();
    expect(core.projetoPorSlug(entradas, recursos, 'ok')?.resultado).toBe('r');
  });
  it('[PENDENTE] chega como undefined, inclusive aninhado', () => {
    const avisos: string[] = [];
    const p = core.montarProjeto(
      {
        id: 'x',
        data: dados({
          papel: '[PENDENTE]',
          repo: '[PENDENTE]',
          tecnologias: ['TS', '[PENDENTE]'],
          changelog: [{ data: '2026-01-01', texto: '[PENDENTE]' }],
        }),
      },
      { ...recursos, aviso: (m) => avisos.push(m) },
    );
    expect(p.papel).toBeUndefined();
    expect(p.repo).toBeUndefined();
    expect(p.tecnologias).toEqual(['TS']);
    expect(JSON.stringify(p)).not.toContain('[PENDENTE]');
    expect(avisos.length).toBeGreaterThan(0);
  });
  it('carta: planejado→verso; concluido→revelada com arte; alt nunca vazio', () => {
    const pl = core.carta(core.roteiro(entradas, recursos)[0]!, recursos.verso);
    expect(pl.estado).toBe('verso');
    expect(pl.imagem.src).toBe('verso');
    const ok = core.carta(core.projetoPorSlug(entradas, recursos, 'ok')!, recursos.verso);
    expect(ok.estado).toBe('revelada');
    expect(ok.imagem.src).toBe('justica');
    const dev = core.carta(core.projetoPorSlug(entradas, recursos, 'dev')!, recursos.verso);
    expect(dev.estado).toBe('em-desenvolvimento');
    for (const c of [pl, ok, dev]) expect(c.alt.length).toBeGreaterThan(0);
  });
});
