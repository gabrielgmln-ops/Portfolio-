import type { ArcanoId } from '../types';

export interface ArcanoDef {
  id: ArcanoId;
  numeral: string;
  nome: string;
  slug: string;
  /** nome do arquivo em src/assets/cartas/; ausente → verso */
  arte?: string;
  /** descrição factual da cena da arte (só quando há arte) */
  cena?: string;
}

export const ARCANOS = [
  {
    id: 'louco',
    numeral: '0',
    nome: 'O Louco',
    slug: 'portfolio',
    arte: '00-louco.jpg',
    cena: 'jovem de túnica clara, com uma trouxa num bastão ao ombro e uma flor na mão, olha para o céu à beira de um penhasco; um cão branco salta a seus pés sob um sol dourado',
  },
  // Artes 01–07 e 09–11 ainda não existem em src/assets/cartas/: montarArcano cai no verso. Sem `cena` até haver arte.
  {
    id: 'mago',
    numeral: 'I',
    nome: 'O Mago',
    slug: 'motor-antifraude',
    arte: '01-mago.jpg',
    cena: 'jovem de túnica azul e manto vinho atrás de uma mesa de madeira, erguendo uma varinha dourada e apontando para baixo; sobre a mesa um cálice, uma espada, uma moeda e um bastão; um símbolo do infinito dourado acima da cabeça',
  },
  {
    id: 'sacerdotisa',
    numeral: 'II',
    nome: 'A Sacerdotisa',
    slug: 'operacao-cofre',
    arte: '02-sacerdotisa.jpg',
    cena: 'mulher coroada, de véu e manto dourado, sentada num trono de pedra entre folhagens, com uma esfera dourada no colo; luas crescentes ao fundo',
  },
  {
    id: 'imperatriz',
    numeral: 'III',
    nome: 'A Imperatriz',
    slug: 'pix-simulado',
    arte: '03-imperatriz.jpg',
    cena: 'mulher coroada, de manto azul e vinho, sentada num trono, com a mão direita erguida e chaves douradas na esquerda; luas crescentes dos dois lados',
  },
  {
    id: 'imperador',
    numeral: 'IV',
    nome: 'O Imperador',
    slug: 'gateway-seguranca',
    arte: '04-imperador.jpg',
    cena: 'homem coroado, de manto vinho e dourado, sentado num trono entre colunas, segurando um cetro e erguendo a mão; sol e lua ao fundo',
  },
  {
    id: 'hierofante',
    numeral: 'V',
    nome: 'O Hierofante',
    slug: 'devsecops-siem',
    arte: '05-hierofante.jpg',
    cena: 'figura coroada, de manto azul e dourado, sentada num trono, com um cetro, um livro aberto e um globo com cruz',
  },
  {
    id: 'enamorados',
    numeral: 'VI',
    nome: 'Os Amantes',
    slug: 'rastreador-importacao',
    arte: '06-amantes.jpg',
    cena: 'mulher coroada, de vestido creme e manto vinho, sentada num trono entre espigas de trigo, com um cetro e um escudo com uma águia; um sol dourado acima',
  },
  {
    id: 'carro',
    numeral: 'VII',
    nome: 'O Carro',
    slug: 'despachante-digital',
    arte: '07-carro.jpg',
    cena: 'rei de armadura sob um dossel estrelado, num carro de pedra diante de duas esfinges, uma escura e uma clara; uma cidade e um navio ao fundo',
  },
  {
    id: 'justica',
    numeral: 'VIII',
    nome: 'A Justiça',
    slug: 'ledger-api',
    arte: '08-justica.jpg',
    cena: 'mulher coroada, de manto vermelho, sentada entre duas colunas, segura uma espada erguida na mão direita e uma balança na esquerda',
  },
  {
    id: 'eremita',
    numeral: 'IX',
    nome: 'O Eremita',
    slug: 'landed',
    arte: '09-eremita.jpg',
    cena: 'velho encapuzado, com lanterna e cajado, no alto de um penhasco nevado à noite, sobre um porto com navios',
  },
  {
    id: 'roda',
    numeral: 'X',
    nome: 'A Roda da Fortuna',
    slug: 'monitor-cambio',
    arte: '10-roda-da-fortuna.jpg',
    cena: 'mulher coroada, de manto vinho e véu creme, sentada num trono ladeado por leões, segurando uma chave e um cetro com um sol; romãs ao fundo',
  },
  {
    id: 'forca',
    numeral: 'XI',
    nome: 'A Força',
    slug: 'robo-fechamento',
    arte: '11-forca.jpg',
    cena: 'mulher coroada, de vestido creme bordado, sentada num campo de trigo, com um cetro e um escudo com uma águia; uma lua acima',
  },
  { id: 'enforcado', numeral: 'XII', nome: 'O Enforcado', slug: 'open-finance' },
  { id: 'morte', numeral: 'XIII', nome: 'A Morte', slug: 'encurtador-url' },
  { id: 'temperanca', numeral: 'XIV', nome: 'A Temperança', slug: 'fila-de-tarefas' },
  { id: 'diabo', numeral: 'XV', nome: 'O Diabo', slug: 'motor-de-busca' },
  { id: 'torre', numeral: 'XVI', nome: 'A Torre', slug: 'assistente-aduaneiro' },
  { id: 'estrela', numeral: 'XVII', nome: 'A Estrela', slug: 'cashback' },
  { id: 'lua', numeral: 'XVIII', nome: 'A Lua', slug: 'comex-stat' },
  { id: 'sol', numeral: 'XIX', nome: 'O Sol', slug: 'automacao-relatorios' },
  { id: 'julgamento', numeral: 'XX', nome: 'O Julgamento', slug: 'validador-documentos' },
  { id: 'mundo', numeral: 'XXI', nome: 'O Mundo', slug: 'bank-platform' },
] as const satisfies readonly ArcanoDef[];

export const ARCANO_IDS = ARCANOS.map((a) => a.id) as [ArcanoId, ...ArcanoId[]];

export function arcanoDef(id: ArcanoId): ArcanoDef {
  const a = (ARCANOS as readonly ArcanoDef[]).find((x) => x.id === id);
  if (!a) throw new Error(`Arcano desconhecido: ${id}`);
  return a;
}
