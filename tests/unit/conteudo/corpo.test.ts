import { describe, expect, it } from 'vitest';
import { corpoPublicavel } from '../../../src/lib/conteudo-core';

describe('corpoPublicavel', () => {
  it('publica corpo escrito', () => expect(corpoPublicavel('## Teste\n\nMedido.')).toBe(true));
  it('não publica corpo vazio ou ausente', () => {
    expect(corpoPublicavel(undefined)).toBe(false);
    expect(corpoPublicavel('  \n')).toBe(false);
  });
  it('não publica corpo com qualquer [PENDENTE]', () =>
    expect(corpoPublicavel('## Problema\n\nok\n\n## Testes\n\n[PENDENTE]')).toBe(false));
});
