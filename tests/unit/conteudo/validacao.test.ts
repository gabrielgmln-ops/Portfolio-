import { describe, expect, it } from 'vitest';
import { criarProjetoSchema, validarColecao } from '../../../src/lib/validacao';
import { bruto, dados } from './fixtures';

const schema = criarProjetoSchema(() => {});
const ok = (o: Record<string, unknown>) => schema.safeParse(bruto(o)).success;
const concluido = { status: 'concluido', resultado: 'r', medidoEm: '2026-10-30' };

describe('regras de validação', () => {
  it('fixture válido passa', () => {
    expect(ok({})).toBe(true);
    expect(ok(concluido)).toBe(true);
  });
  it('regra 1: resultado sem concluido falha', () => {
    expect(ok({ resultado: 'r', medidoEm: '2026-10-30' })).toBe(false);
  });
  it('regra 2: concluido sem resultado/medidoEm falha', () => {
    expect(ok({ status: 'concluido' })).toBe(false);
    expect(ok({ status: 'concluido', resultado: 'r' })).toBe(false);
  });
  it('regra 3: arcano ausente ou fora da tabela falha', () => {
    expect(ok({ arcano: undefined })).toBe(false);
    expect(ok({ arcano: 'imperatriz' })).toBe(false);
  });
  it('regra 4: arcano ou slug duplicado falha', () => {
    const a = { id: 'a', data: dados({ slug: 'a', arcano: 'mago' }) };
    expect(validarColecao([a, { id: 'b', data: dados({ slug: 'b', arcano: 'sol' }) }])).toEqual([]);
    expect(validarColecao([a, { id: 'b', data: dados({ slug: 'b', arcano: 'mago' }) }])).toHaveLength(1);
    expect(validarColecao([a, { id: 'b', data: dados({ slug: 'a', arcano: 'sol' }) }])).toHaveLength(1);
  });
  it('regra 5: [PREENCHER] em qualquer string falha; [PENDENTE] passa', () => {
    expect(ok({ papel: '[PREENCHER]' })).toBe(false);
    expect(ok({ tecnologias: ['a', 'x [PREENCHER]'] })).toBe(false);
    expect(ok({ papel: '[PENDENTE]', repo: '[PENDENTE]', trilha: '[PENDENTE]' })).toBe(true);
  });
  it('regra 6: estudoDeCaso sem as seções obrigatórias falha', () => {
    const d = dados({ estudoDeCaso: true });
    const completo = '## Problema\n\n## Decisões\n\n## Testes\n\n## Resultado\n\n## Limitações\n';
    expect(validarColecao([{ id: 'a', data: d, body: completo }])).toEqual([]);
    expect(validarColecao([{ id: 'a', data: d, body: '## Problema\n## Testes\n' }])).toHaveLength(1);
  });
  it('trilha: array só combina bancos/cyber', () => {
    expect(ok({ trilha: ['bancos', 'cyber'] })).toBe(true);
    expect(ok({ trilha: ['bancos', 'comex'] })).toBe(false);
  });
  it('resumo acima de 160 caracteres falha', () => {
    expect(ok({ resumo: 'a'.repeat(161) })).toBe(false);
  });
});
