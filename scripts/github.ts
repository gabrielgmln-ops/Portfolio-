// Gera src/data/github.json a partir dos `githubRepo` dos projetos. Nunca escreve valor estimado.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export interface EntradaGithub {
  url: string; ultimoCommit: string; linguagens: Record<string, number>; buscadoEm: string;
}
export type Cache = Record<string, EntradaGithub>;
export interface Log { info(m: string): void; warn(m: string): void; }
type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const API = 'https://api.github.com';
const TIMEOUT_MS = 5000;
const TENTATIVAS = 2;

/** Erro que não adianta repetir (404, rate limit, 4xx, resposta inválida). */
class ErroDefinitivo extends Error {}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

export function extrairRepo(mdx: string): string | undefined {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(mdx)?.[1];
  if (!fm) return undefined;
  const v = /^githubRepo:\s*["']?([^"'\r\n#]+?)["']?\s*$/m.exec(fm)?.[1]?.trim();
  if (!v || v.includes('[PENDENTE]') || !/^[\w.-]+\/[\w.-]+$/.test(v)) return undefined;
  return v;
}

export async function descobrirRepos(dir: string): Promise<string[]> {
  const arquivos = (await readdir(dir)).filter((f) => f.endsWith('.mdx')).sort();
  const repos = new Set<string>();
  for (const f of arquivos) {
    const r = extrairRepo(await readFile(join(dir, f), 'utf8'));
    if (r) repos.add(r);
  }
  return [...repos];
}

async function getJson(fetchFn: Fetch, url: string, token: string | undefined): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'portfolio-build',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetchFn(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (res.ok) return res.json();
  if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
    throw new ErroDefinitivo(`rate limit atingido (HTTP ${res.status})`);
  }
  if (res.status === 404) throw new ErroDefinitivo('não encontrado ou privado (HTTP 404)');
  if (res.status >= 400 && res.status < 500) throw new ErroDefinitivo(`HTTP ${res.status}`);
  throw new Error(`HTTP ${res.status}`);
}

async function comRetry<T>(fn: () => Promise<T>, repo: string, log: Log): Promise<T> {
  let ultimo: unknown;
  for (let i = 1; i <= TENTATIVAS; i++) {
    try {
      return await fn();
    } catch (e) {
      ultimo = e;
      if (e instanceof ErroDefinitivo) throw e;
      if (i < TENTATIVAS) log.warn(`[github] ${repo}: tentativa ${i} falhou (${msg(e)}), tentando de novo`);
    }
  }
  throw ultimo;
}

async function buscar(repo: string, fetchFn: Fetch, token: string | undefined, agora: Date): Promise<EntradaGithub> {
  const info = (await getJson(fetchFn, `${API}/repos/${repo}`, token)) as { html_url?: unknown; default_branch?: unknown };
  if (typeof info.html_url !== 'string' || typeof info.default_branch !== 'string') {
    throw new ErroDefinitivo('resposta sem html_url/default_branch');
  }
  const commit = (await getJson(fetchFn, `${API}/repos/${repo}/commits/${encodeURIComponent(info.default_branch)}`, token)) as {
    commit?: { committer?: { date?: unknown } };
  };
  const data = commit.commit?.committer?.date;
  if (typeof data !== 'string' || Number.isNaN(Date.parse(data))) throw new ErroDefinitivo('commit sem data válida');
  const langs = (await getJson(fetchFn, `${API}/repos/${repo}/languages`, token)) as Record<string, unknown>;
  const linguagens: Record<string, number> = {};
  for (const k of Object.keys(langs).sort()) {
    const v = langs[k];
    if (typeof v === 'number') linguagens[k] = v;
  }
  return { url: info.html_url, ultimoCommit: new Date(data).toISOString(), linguagens, buscadoEm: agora.toISOString() };
}

export async function atualizar(opts: {
  repos: string[]; fetch: Fetch; cacheAnterior: Cache; log: Log; token?: string | undefined; agora?: Date;
}): Promise<Cache> {
  const { repos, fetch: fetchFn, cacheAnterior, log, token } = opts;
  const agora = opts.agora ?? new Date();
  const saida: Cache = {};
  for (const repo of repos) {
    try {
      const e = await comRetry(() => buscar(repo, fetchFn, token, agora), repo, log);
      saida[repo] = e;
      log.info(`[github] ${repo}: ok (último commit ${e.ultimoCommit})`);
    } catch (e) {
      const anterior = cacheAnterior[repo];
      if (anterior) {
        saida[repo] = anterior;
        log.warn(`[github] ${repo}: falhou (${msg(e)}); mantendo cache de ${anterior.buscadoEm}`);
      } else {
        log.warn(`[github] ${repo}: falhou (${msg(e)}); sem cache, projeto fica sem dados do GitHub`);
      }
    }
  }
  return saida;
}

export function serializar(c: Cache): string {
  const ordenar = (v: unknown): unknown =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordenar((v as Record<string, unknown>)[k])]))
      : v;
  return `${JSON.stringify(ordenar(c), null, 2)}\n`;
}

async function main(): Promise<void> {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const arquivo = join(raiz, 'src/data/github.json');
  let cacheAnterior: Cache = {};
  try {
    cacheAnterior = JSON.parse(await readFile(arquivo, 'utf8')) as Cache;
  } catch {
    /* sem cache anterior */
  }
  const repos = await descobrirRepos(join(raiz, 'src/content/projetos'));
  const log: Log = { info: (m) => console.log(m), warn: (m) => console.warn(`WARN ${m}`) };
  const token = process.env['GITHUB_TOKEN'] || undefined;
  log.info(`[github] repositórios: ${repos.join(', ') || '(nenhum)'} (${token ? 'com' : 'sem'} token)`);
  const novo = await atualizar({ repos, fetch: globalThis.fetch, cacheAnterior, log, token });
  await writeFile(arquivo, serializar(novo), 'utf8');
  log.info(`[github] gravado ${arquivo}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((e: unknown) => {
    console.warn(`WARN [github] erro inesperado: ${msg(e)}`);
    process.exitCode = 0;
  });
}
