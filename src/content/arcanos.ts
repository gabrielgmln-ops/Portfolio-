import type { ArcanoId } from '../types';

export interface ArcanoDef {
  id: ArcanoId; numeral: string; nome: string; slug: string;
  /** nome do arquivo em src/assets/cartas/; ausente → verso */
  arte?: string;
  /** descrição factual da cena da arte (só quando há arte) */
  cena?: string;
}

export const ARCANOS = [
  { id: 'louco', numeral: '0', nome: 'O Louco', slug: 'portfolio', arte: '00-louco.jpg',
    cena: 'jovem de túnica clara, com uma trouxa num bastão ao ombro e uma flor na mão, olha para o céu à beira de um penhasco; um cão branco salta a seus pés sob um sol dourado' },
  { id: 'mago', numeral: 'I', nome: 'O Mago', slug: 'pix-simulado' },
  { id: 'sacerdotisa', numeral: 'II', nome: 'A Sacerdotisa', slug: 'comex-stat' },
  { id: 'imperador', numeral: 'IV', nome: 'O Imperador', slug: 'agendamento' },
  { id: 'hierofante', numeral: 'V', nome: 'O Hierofante', slug: 'assistente-aduaneiro' },
  { id: 'enamorados', numeral: 'VI', nome: 'Os Enamorados', slug: 'open-finance' },
  { id: 'carro', numeral: 'VII', nome: 'O Carro', slug: 'rastreador-importacao' },
  { id: 'justica', numeral: 'VIII', nome: 'A Justiça', slug: 'ledger-api', arte: '08-justica.jpg',
    cena: 'mulher coroada, de manto vermelho, sentada entre duas colunas, segura uma espada erguida na mão direita e uma balança na esquerda' },
  { id: 'eremita', numeral: 'IX', nome: 'O Eremita', slug: 'motor-de-busca' },
  { id: 'roda', numeral: 'X', nome: 'A Roda da Fortuna', slug: 'landed' },
  { id: 'forca', numeral: 'XI', nome: 'A Força', slug: 'gateway-seguranca' },
  { id: 'morte', numeral: 'XIII', nome: 'A Morte', slug: 'encurtador-url' },
  { id: 'temperanca', numeral: 'XIV', nome: 'A Temperança', slug: 'fila-de-tarefas' },
  { id: 'torre', numeral: 'XVI', nome: 'A Torre', slug: 'devsecops-siem' },
  { id: 'estrela', numeral: 'XVII', nome: 'A Estrela', slug: 'cashback' },
  { id: 'lua', numeral: 'XVIII', nome: 'A Lua', slug: 'antifraude' },
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
