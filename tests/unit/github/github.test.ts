import { describe, expect, it, vi } from 'vitest';
import { atualizar, extrairRepo, serializar, type Cache } from '../../../scripts/github';
import { lerGithub, lerGithubDe } from '../../../src/lib/github';

const R = 'dono/repo';
const agora = new Date('2026-10-21T12:00:00Z');
const json = (b: unknown, status = 200, h: Record<string, string> = {}) =>
  new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json', ...h } });

function fetchOk() {
  return vi.fn(async (url: string, _init?: RequestInit) => {
    if (url.endsWith('/languages')) return json({ TypeScript: 100, CSS: 5 });
    if (url.includes('/commits/')) return json({ commit: { committer: { date: '2026-10-01T10:00:00Z' } } });
    return json({ html_url: `https://github.com/${R}`, default_branch: 'main' });
  });
}
const log = () => ({ info: vi.fn(), warn: vi.fn() });
const cache: Cache = {
  [R]: { url: 'https://github.com/dono/repo', ultimoCommit: '2025-01-01T00:00:00.000Z', linguagens: { Go: 1 }, buscadoEm: '2025-01-02T00:00:00.000Z' },
};
const headersDe = (f: ReturnType<typeof fetchOk>) => (f.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;

describe('atualizar', () => {
  it('sucesso', async () => {
    const f = fetchOk();
    const r = await atualizar({ repos: [R], fetch: f, cacheAnterior: {}, log: log(), agora });
    expect(r[R]).toEqual({
      url: 'https://github.com/dono/repo', ultimoCommit: '2026-10-01T10:00:00.000Z',
      linguagens: { CSS: 5, TypeScript: 100 }, buscadoEm: agora.toISOString(),
    });
    expect(headersDe(f)['Authorization']).toBeUndefined();
    expect((f.mock.calls[0]![1] as RequestInit).signal).toBeInstanceOf(AbortSignal);
  });

  it('envia token quando definido', async () => {
    const f = fetchOk();
    await atualizar({ repos: [R], fetch: f, cacheAnterior: {}, log: log(), token: 'x', agora });
    expect(headersDe(f)['Authorization']).toBe('Bearer x');
  });

  it('falha com cache mantém entrada anterior', async () => {
    const l = log();
    const r = await atualizar({ repos: [R], fetch: vi.fn(async () => json({}, 500)), cacheAnterior: cache, log: l, agora });
    expect(r[R]).toEqual(cache[R]);
    expect(l.warn).toHaveBeenCalledWith(expect.stringContaining('mantendo cache'));
  });

  it('falha sem cache: entrada não existe', async () => {
    const f = vi.fn(async () => { throw new TypeError('fetch failed'); });
    const r = await atualizar({ repos: [R], fetch: f, cacheAnterior: {}, log: log(), agora });
    expect(r).toEqual({});
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('404 vira warning sem retry', async () => {
    const l = log();
    const f = vi.fn(async () => json({ message: 'Not Found' }, 404));
    const r = await atualizar({ repos: [R], fetch: f, cacheAnterior: {}, log: l, agora });
    expect(r).toEqual({});
    expect(f).toHaveBeenCalledTimes(1);
    expect(l.warn).toHaveBeenCalledWith(expect.stringContaining('404'));
  });

  it('rate limit (403 e 429 com remaining 0)', async () => {
    for (const s of [403, 429]) {
      const l = log();
      const f = vi.fn(async () => json({}, s, { 'x-ratelimit-remaining': '0' }));
      const r = await atualizar({ repos: [R], fetch: f, cacheAnterior: cache, log: l, agora });
      expect(r[R]).toEqual(cache[R]);
      expect(f).toHaveBeenCalledTimes(1);
      expect(l.warn).toHaveBeenCalledWith(expect.stringContaining('rate limit'));
    }
  });

  it('retry: 1ª falha de rede, 2ª ok', async () => {
    const ok = fetchOk();
    let n = 0;
    const f = vi.fn(async (u: string, i?: RequestInit) => {
      if (n++ === 0) throw new TypeError('ECONNRESET');
      return ok(u, i);
    });
    const l = log();
    const r = await atualizar({ repos: [R], fetch: f, cacheAnterior: {}, log: l, agora });
    expect(r[R]?.ultimoCommit).toBe('2026-10-01T10:00:00.000Z');
    expect(l.warn).toHaveBeenCalledWith(expect.stringContaining('tentativa 1'));
  });
});

describe('utilitários', () => {
  it('extrairRepo ignora [PENDENTE]', () => {
    expect(extrairRepo('---\ntitulo: x\ngithubRepo: "a/b"\n---\n')).toBe('a/b');
    expect(extrairRepo('---\ngithubRepo: "[PENDENTE]"\n---\n')).toBeUndefined();
    expect(extrairRepo('---\ntitulo: x\n---\n')).toBeUndefined();
  });
  it('serializar ordena chaves', () => {
    const s = serializar({ b: cache[R]!, a: cache[R]! });
    expect(s.indexOf('"a"')).toBeLessThan(s.indexOf('"b"'));
  });
});

describe('lerGithub', () => {
  it('repo ausente → undefined', () => {
    expect(lerGithub('nao/existe')).toBeUndefined();
    expect(lerGithubDe({}, R)).toBeUndefined();
  });
  it('datas viram Date', () => {
    const g = lerGithubDe(cache, R)!;
    expect(g.ultimoCommit).toBeInstanceOf(Date);
    expect(g.buscadoEm.toISOString()).toBe('2025-01-02T00:00:00.000Z');
    expect(g.linguagens).toEqual({ Go: 1 });
  });
});
