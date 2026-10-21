// Funções puras do contrato: recebem entradas já carregadas. Sem runtime do Astro.
import type { ImageMetadata } from 'astro';
import { arcanoDef } from '../content/arcanos';
import type { Arcano, Carta, GithubInfo, Milestone, Project } from '../types';
import { PENDENTE, type DadosMarco, type DadosProjeto } from './validacao';

export const TETO_ROTEIRO = 4;
type Aviso = (msg: string) => void;
const avisoPadrao: Aviso = (m) => console.warn(m);

export interface EntradaProjeto { id: string; data: DadosProjeto; body?: string | undefined }
export interface Recursos {
  artes: Record<string, ImageMetadata>; // nome do arquivo -> imagem
  verso: ImageMetadata;
  lerGithub?: (repo: string) => GithubInfo | undefined;
  aviso?: Aviso;
}

/** Remove recursivamente strings com [PENDENTE] (viram undefined; em arrays, são retiradas). */
export function limparPendentes<T>(v: T, aviso: Aviso = avisoPadrao, caminho = ''): T {
  if (typeof v === 'string') {
    if (v.includes(PENDENTE)) {
      aviso(`[conteudo] [PENDENTE] omitido: ${caminho}`);
      return undefined as T;
    }
    return v;
  }
  if (Array.isArray(v))
    return v.map((x, i) => limparPendentes(x, aviso, `${caminho}[${i}]`)).filter((x) => x !== undefined) as T;
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) {
      const r = limparPendentes(x, aviso, caminho ? `${caminho}.${k}` : k);
      if (r !== undefined) out[k] = r;
    }
    return out as T;
  }
  return v;
}

export function montarArcano(id: DadosProjeto['arcano'], artes: Record<string, ImageMetadata>): Arcano {
  const d = arcanoDef(id);
  const arte = d.arte ? artes[d.arte] : undefined;
  return { id: d.id, numeral: d.numeral, nome: d.nome, ...(arte ? { arte } : {}) };
}

export function montarProjeto(e: EntradaProjeto, r: Recursos): Project {
  const aviso = r.aviso ?? avisoPadrao;
  const d = limparPendentes(e.data, (m) => aviso(`${m} (${e.data.slug})`));
  const concluido = d.status === 'concluido';
  const github = d.githubRepo && r.lerGithub ? r.lerGithub(d.githubRepo) : undefined;
  const p: Project = {
    slug: d.slug, titulo: d.titulo, ordem: d.ordem, status: d.status, trilha: d.trilha,
    arcano: montarArcano(d.arcano, r.artes),
    tecnologias: d.tecnologias, competencias: d.competencias,
    estudoDeCaso: d.estudoDeCaso, ano: d.ano, atualizadoEm: d.atualizadoEm, changelog: d.changelog,
  };
  if (d.resumo !== undefined) p.resumo = d.resumo;
  if (d.papel !== undefined) p.papel = d.papel;
  if (d.prova !== undefined) p.prova = d.prova;
  if (concluido && d.resultado !== undefined) p.resultado = d.resultado;
  if (concluido && d.resultadoNumero !== undefined) p.resultadoNumero = d.resultadoNumero;
  if (concluido && d.medidoEm !== undefined) p.medidoEm = d.medidoEm;
  if (d.repo !== undefined) p.repo = d.repo;
  if (d.demo !== undefined) p.demo = d.demo;
  if (d.destaque !== undefined) p.destaque = d.destaque;
  if (d.plataforma !== undefined) p.plataforma = d.plataforma;
  if (github) p.github = github;
  return p;
}

export function projetosVisiveis(es: readonly EntradaProjeto[], r: Recursos): Project[] {
  return es
    .filter((e) => e.data.status === 'em-desenvolvimento' || e.data.status === 'concluido')
    .map((e) => montarProjeto(e, r))
    .sort((a, b) => b.ano - a.ano || a.ordem - b.ordem);
}

export function roteiro(es: readonly EntradaProjeto[], r: Recursos, n: number = TETO_ROTEIRO): Project[] {
  const base = Number.isFinite(n) ? Math.floor(n) : TETO_ROTEIRO;
  const lim = Math.max(0, Math.min(TETO_ROTEIRO, base));
  return es
    .filter((e) => e.data.status === 'planejado')
    .sort((a, b) => a.data.ordem - b.data.ordem)
    .slice(0, lim)
    .map((e) => montarProjeto(e, r));
}

export function projetoPorSlug(es: readonly EntradaProjeto[], r: Recursos, slug: string): Project | undefined {
  const e = es.find((x) => x.data.slug === slug);
  return e ? montarProjeto(e, r) : undefined;
}

export function competencias(visiveis: readonly Project[]): Record<string, Project[]> {
  const out: Record<string, Project[]> = {};
  for (const p of visiveis) for (const c of p.competencias) (out[c] ??= []).push(p);
  return out;
}

export function carta(p: Project, verso: ImageMetadata): Carta {
  const a = p.arcano;
  const base = `Carta ${a.numeral}, ${a.nome}`;
  const cena = arcanoDef(a.id).cena;
  if (p.status === 'planejado') return { arcano: a, estado: 'verso', imagem: verso, verso, alt: `${base} — verso` };
  const imagem = a.arte ?? verso;
  const alt = a.arte ? (cena ? `${base}: ${cena}` : base) : `${base} — verso`;
  return { arcano: a, estado: p.status === 'concluido' ? 'revelada' : 'em-desenvolvimento', imagem, verso, alt };
}

export function marcos(ms: readonly { data: DadosMarco }[]): Milestone[] {
  return ms
    .map(({ data: d }): Milestone => ({
      data: d.data, titulo: d.titulo, tipo: d.tipo, planejado: d.planejado,
      ...(d.descricao && !d.descricao.includes(PENDENTE) ? { descricao: d.descricao } : {}),
    }))
    .sort((a, b) => a.data.getTime() - b.data.getTime());
}
