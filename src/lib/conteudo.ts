// CONTRATO com o front-end. Importe somente daqui.
import type { ImageMetadata } from 'astro';
import { getCollection, render } from 'astro:content';
import * as core from './conteudo-core';
import { lerGithub } from './github';
import { validarColecao } from './validacao';
import type { Carta, Milestone, Project } from '../types';

export type * from '../types';
export { getPerfil } from './perfil';

const modulos = import.meta.glob<{ default: ImageMetadata }>('../assets/cartas/*.{jpg,png}', { eager: true });
const artes: Record<string, ImageMetadata> = {};
for (const [caminho, m] of Object.entries(modulos)) artes[caminho.split('/').pop() ?? caminho] = m.default;
const verso = artes['verso.jpg'];
if (!verso) throw new Error('src/assets/cartas/verso.jpg não encontrado');
const recursos: core.Recursos = { artes, verso, lerGithub };

let cache: Promise<core.EntradaProjeto[]> | undefined;
function entradas(): Promise<core.EntradaProjeto[]> {
  cache ??= getCollection('projetos').then((es) => {
    const erros = validarColecao(es);
    if (erros.length) throw new Error(`Conteúdo inválido:\n- ${erros.join('\n- ')}`);
    return es;
  });
  return cache;
}

export async function getProjetosVisiveis(): Promise<Project[]> {
  return core.projetosVisiveis(await entradas(), recursos);
}
export async function getRoteiro(n: number = core.TETO_ROTEIRO): Promise<Project[]> {
  return core.roteiro(await entradas(), recursos, n);
}
export async function getProjeto(slug: string): Promise<Project | undefined> {
  return core.projetoPorSlug(await entradas(), recursos, slug);
}
export function getCarta(p: Project): Carta {
  return core.carta(p, recursos.verso);
}
export async function getMarcos(): Promise<Milestone[]> {
  return core.marcos(await getCollection('marcos'));
}
export async function getCompetencias(): Promise<Record<string, Project[]>> {
  return core.competencias(await getProjetosVisiveis());
}

export interface Estudo {
  /** componente do corpo MDX já renderizável */
  Conteudo: Awaited<ReturnType<typeof render>>['Content'];
  /** títulos de nível 2, com o id gerado pelo Astro, para o índice */
  secoes: { id: string; titulo: string }[];
}
/** Corpo do MDX do projeto (seções escritas à mão). undefined se ausente ou com [PENDENTE]. */
export async function getEstudo(slug: string): Promise<Estudo | undefined> {
  const e = (await entradas()).find((x) => x.data.slug === slug);
  if (!e || !core.corpoPublicavel(e.body)) return undefined;
  const { Content, headings } = await render(e as Parameters<typeof render>[0]);
  return {
    Conteudo: Content,
    secoes: headings.filter((h) => h.depth === 2).map((h) => ({ id: h.slug, titulo: h.text })),
  };
}
