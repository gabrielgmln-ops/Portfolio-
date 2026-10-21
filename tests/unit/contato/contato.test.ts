import { describe, it, expect, vi } from 'vitest';
import { validarContato, montarMailto, enviarContato, HONEYPOT_CAMPO } from '../../../src/lib/contato';
import { getPerfil } from '../../../src/lib/perfil';

const ok = { nome: 'Ana', email: 'ana@ex.com', mensagem: 'Oi' };

describe('validarContato', () => {
  it('aceita dados válidos', () => expect(validarContato(ok).ok).toBe(true));
  it.each([
    ['nome', { ...ok, nome: '   ' }],
    ['nome', { ...ok, nome: 'a'.repeat(101) }],
    ['email', { ...ok, email: 'invalido' }],
    ['mensagem', { ...ok, mensagem: '' }],
  ])('campo %s inválido aparece em campos', (campo, dados) => {
    const r = validarContato(dados);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.campos).toContain(campo);
  });
  it('lista todos os campos inválidos', () => {
    const r = validarContato({ nome: '', email: 'x', mensagem: '' });
    if (r.ok) throw new Error('deveria falhar');
    expect(r.campos.sort()).toEqual(['email', 'mensagem', 'nome']);
  });
  it('mensagem 2000 passa, 2001 falha', () => {
    expect(validarContato({ ...ok, mensagem: 'a'.repeat(2000) }).ok).toBe(true);
    expect(validarContato({ ...ok, mensagem: 'a'.repeat(2001) }).ok).toBe(false);
  });
});

describe('honeypot', () => {
  it('campo é "site"', () => expect(HONEYPOT_CAMPO).toBe('site'));
  it('preenchido → ok sem chamar abrir', async () => {
    const abrir = vi.fn();
    expect(await enviarContato({ ...ok, site: 'http://spam' }, { abrir })).toEqual({ ok: true });
    expect(abrir).not.toHaveBeenCalled();
  });
});

describe('montarMailto / enviarContato', () => {
  it('usa o e-mail do perfil e codifica acentos, & e quebras', () => {
    const url = montarMailto({ nome: 'João & Cia', email: 'j@ex.com', mensagem: 'Olá\nlinha 2 & mais' });
    expect(url.startsWith(`mailto:${getPerfil().email}?subject=`)).toBe(true);
    const q = new URLSearchParams(url.split('?')[1]);
    expect(decodeURIComponent(url.split('subject=')[1]!.split('&body=')[0]!)).toBe('Contato pelo portfólio — João & Cia');
    expect(url).toContain('%0A');
    expect(url).not.toMatch(/[ \n]/);
    expect(url.match(/&/g)).toHaveLength(1);
    expect(q.has('body')).toBe(true);
    expect(decodeURIComponent(url.split('&body=')[1]!)).toContain('Olá\nlinha 2 & mais');
  });
  it('envio válido chama abrir com o mailto', async () => {
    const abrir = vi.fn();
    expect(await enviarContato(ok, { abrir })).toEqual({ ok: true });
    expect(abrir).toHaveBeenCalledWith(montarMailto(ok));
  });
  it('inválido → erro validacao', async () => {
    const r = await enviarContato({ ...ok, email: 'x' }, { abrir: vi.fn() });
    expect(r).toEqual({ ok: false, erro: 'validacao', campos: ['email'] });
  });
  it('sem window e sem abrir → rede', async () => {
    expect(await enviarContato(ok)).toEqual({ ok: false, erro: 'rede' });
  });
});
