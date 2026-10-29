// Utilidades de movimento: preferência do usuário, gancho por página e um laço rAF único sob demanda.
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
export const movimentoReduzido = (): boolean => reduzir.matches;
export const ponteiroFino = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches;
/** html.js-motion presente = há JS e não há redução de movimento. */
export const comMovimento = (): boolean => document.documentElement.classList.contains('js-motion');

/** Executa a cada página (carga inicial e cada navegação do ClientRouter). */
export function aCadaPagina(fn: () => void): void {
  document.addEventListener('astro:page-load', fn);
}

export const easeOutQuart = (t: number): number => 1 - (1 - Math.min(1, Math.max(0, t))) ** 4;

/** Tarefa de quadro: devolve true enquanto ainda precisa de quadros. */
export type Tarefa = (t: number, dt: number) => boolean;
const tarefas = new Set<Tarefa>();
let id = 0;
let antes = 0;
function tick(t: number): void {
  id = 0;
  const dt = antes ? Math.min(t - antes, 50) : 16.7;
  antes = t;
  let mais = false;
  for (const f of tarefas) if (f(t, dt)) mais = true;
  if (mais) id = requestAnimationFrame(tick);
  else antes = 0;
}
/** Acorda o laço; ele dorme sozinho quando nenhuma tarefa precisa de quadros. */
export function acordar(): void {
  if (!id) id = requestAnimationFrame(tick);
}
export function registrar(f: Tarefa): () => void {
  tarefas.add(f);
  acordar();
  return () => tarefas.delete(f);
}
