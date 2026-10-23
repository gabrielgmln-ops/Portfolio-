// Formatação compartilhada pela interface (datas UTC, rótulos de status).
import type { Project, Status } from '../lib/conteudo';

const dataLonga = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const mesAno = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export const formatarData = (d: Date): string => dataLonga.format(d).replace(/\./g, '');
export const formatarMes = (d: Date): string => mesAno.format(d).replace(/\./g, '');
export const isoData = (d: Date): string => d.toISOString().slice(0, 10);

export const ROTULO_STATUS: Record<Status, string> = {
  planejado: 'planejado',
  'em-desenvolvimento': 'em desenvolvimento',
  concluido: 'concluído',
};

/** "A Justiça, VIII — Ledger API, concluído" */
export function nomeAcessivel(p: Project): string {
  return `${p.arcano.nome}, ${p.arcano.numeral} — ${p.titulo}, ${ROTULO_STATUS[p.status]}`;
}

/** Ponto onde o número medido aparece no texto do resultado; undefined → não anima. */
export function partirResultado(p: Project): { antes: string; numero: string; depois: string } | undefined {
  if (p.resultado === undefined || p.resultadoNumero === undefined) return undefined;
  const numero = p.resultadoNumero.toLocaleString('pt-BR');
  const i = p.resultado.indexOf(numero);
  if (i < 0) return undefined;
  return { antes: p.resultado.slice(0, i), numero, depois: p.resultado.slice(i + numero.length) };
}
