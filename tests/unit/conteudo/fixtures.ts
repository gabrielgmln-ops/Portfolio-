import type { ImageMetadata } from 'astro';
import { projetoBaseSchema, type DadosProjeto } from '../../../src/lib/validacao';

export const img = (src: string): ImageMetadata => ({ src, width: 10, height: 15, format: 'jpg' });
export const recursos = { artes: { '08-justica.jpg': img('justica') }, verso: img('verso'), aviso: () => {} };

export function bruto(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    titulo: 'X', slug: 'x', ordem: 1, status: 'planejado', trilha: 'bancos', arcano: 'mago',
    resumo: 'r', papel: 'p', tecnologias: [], competencias: [], prova: 'p', estudoDeCaso: false,
    ano: 2026, atualizadoEm: '2026-10-21', changelog: [], ...over,
  };
}
export function dados(over: Record<string, unknown> = {}): DadosProjeto {
  return projetoBaseSchema.parse(bruto(over));
}
