// SEO: JSON-LD Person (só dados existentes de getPerfil) e metas OG/canonical.
import type { Perfil } from '../types';

export interface JsonLdPerson {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  description?: string;
  email?: string;
  url?: string;
  sameAs?: string[];
  knowsLanguage?: string[];
}

/** Campos pendentes (undefined) são omitidos; nunca entra texto [PENDENTE]. */
export function jsonLdPerson(perfil: Perfil, site?: URL | string): JsonLdPerson {
  const out: JsonLdPerson = { '@context': 'https://schema.org', '@type': 'Person', name: perfil.nome };
  if (perfil.apresentacao) out.description = perfil.apresentacao;
  if (perfil.email) out.email = `mailto:${perfil.email}`;
  if (site) out.url = new URL('/', site).href;
  const sameAs = [perfil.github?.url, perfil.linkedin].filter((u): u is string => !!u);
  if (sameAs.length) out.sameAs = sameAs;
  if (perfil.idiomas.length) out.knowsLanguage = perfil.idiomas.map((i) => i.idioma);
  return out;
}

/** Serializa para <script type="application/ld+json"> sem permitir fechar a tag. */
export function serializarJsonLd(dado: unknown): string {
  return JSON.stringify(dado).replace(/</g, '\\u003c');
}

export interface Meta {
  titulo: string;
  descricao?: string | undefined;
  canonical?: string;
  og: { property: string; content: string }[];
}

/** Metas padrão. Sem `site` (SITE_URL ausente), canonical e og:url são omitidos. */
export function metaPagina(o: {
  titulo: string;
  descricao?: string | undefined;
  caminho: string;
  site?: URL | string | undefined;
  nomeSite?: string;
}): Meta {
  const og = [
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: o.titulo },
    { property: 'og:locale', content: 'pt_BR' },
  ];
  if (o.nomeSite) og.push({ property: 'og:site_name', content: o.nomeSite });
  if (o.descricao) og.push({ property: 'og:description', content: o.descricao });
  const meta: Meta = { titulo: o.titulo, descricao: o.descricao, og };
  if (o.site) {
    const url = new URL(o.caminho, o.site).href;
    meta.canonical = url;
    og.push({ property: 'og:url', content: url });
  }
  return meta;
}
