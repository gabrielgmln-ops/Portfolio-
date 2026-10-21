import type { GithubInfo } from '../types';
import dados from '../data/github.json';

interface Bruto {
  url: string;
  ultimoCommit: string;
  linguagens: Record<string, number>;
  buscadoEm: string;
}

export function lerGithubDe(fonte: Record<string, unknown>, repo: string): GithubInfo | undefined {
  if (!Object.hasOwn(fonte, repo)) return undefined;
  const e = fonte[repo] as Bruto;
  return {
    url: e.url,
    ultimoCommit: new Date(e.ultimoCommit),
    linguagens: { ...e.linguagens },
    buscadoEm: new Date(e.buscadoEm),
  };
}

export function lerGithub(repo: string): GithubInfo | undefined {
  return lerGithubDe(dados as Record<string, unknown>, repo);
}
