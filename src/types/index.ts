import type { ImageMetadata } from 'astro';

export type Status = 'planejado' | 'em-desenvolvimento' | 'concluido';
export type Trilha = 'bancos' | 'cyber' | 'comex' | 'variado';
export type EstadoCarta = 'verso' | 'em-desenvolvimento' | 'revelada';
export type ArcanoId =
  | 'louco'
  | 'mago'
  | 'sacerdotisa'
  | 'imperatriz'
  | 'imperador'
  | 'hierofante'
  | 'enamorados'
  | 'carro'
  | 'justica'
  | 'eremita'
  | 'roda'
  | 'forca'
  | 'morte'
  | 'temperanca'
  | 'torre'
  | 'estrela'
  | 'lua'
  | 'sol'
  | 'julgamento'
  | 'mundo';

export interface Arcano {
  id: ArcanoId;
  numeral: string;
  nome: string;
  arte?: ImageMetadata;
}
export interface GithubInfo {
  url: string;
  ultimoCommit: Date;
  linguagens: Record<string, number>;
  buscadoEm: Date;
}
export interface Metrica {
  numero: number;
  casas?: number;
  prefixo?: string;
  sufixo?: string;
  rotulo: string;
}
export interface LinhaFicha {
  rotulo: string;
  valor: string;
}
export interface Project {
  slug: string;
  titulo: string;
  ordem: number;
  status: Status;
  trilha: Trilha[];
  arcano: Arcano;
  /** undefined quando [PENDENTE] */
  resumo?: string;
  /** undefined quando [PENDENTE] */
  papel?: string;
  tecnologias: string[];
  competencias: string[];
  /** undefined quando [PENDENTE] */
  prova?: string;
  resultado?: string;
  resultadoNumero?: number;
  medidoEm?: Date;
  /** só com status concluido */
  metricas?: Metrica[];
  ficha?: LinhaFicha[];
  stackCurta?: string;
  linhaIndice?: string;
  repo?: string;
  demo?: string;
  destaque?: 'principal' | 'secundario';
  plataforma?: 'bank-platform';
  estudoDeCaso: boolean;
  ano: number;
  atualizadoEm: Date;
  changelog: { data: Date; texto: string }[];
  github?: GithubInfo;
}
export interface Milestone {
  data: Date;
  titulo: string;
  descricao?: string;
  tipo: 'formacao' | 'trabalho' | 'projeto';
  planejado: boolean;
}
export interface Carta {
  arcano: Arcano;
  estado: EstadoCarta;
  imagem: ImageMetadata;
  verso: ImageMetadata;
  alt: string;
}
export interface Perfil {
  nome: string;
  apresentacao?: string;
  email?: string;
  github?: { usuario: string; url: string };
  linkedin?: string;
  idiomas: { idioma: string; nivel: string }[];
}
