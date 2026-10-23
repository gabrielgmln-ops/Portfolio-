// Utilidades de movimento: preferência do usuário e animações interrompíveis.
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
export const movimentoReduzido = (): boolean => reduzir.matches;
export const ponteiroFino = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Executa uma vez por página (inclusive após navegação do ClientRouter). */
export function aCadaPagina(fn: () => void): void {
  document.addEventListener('astro:page-load', fn);
}

const emCurso = new Map<Animation, number>();
const GRACA_ROLAGEM = 250;
/** Registra a animação: clique, tecla ou rolagem a levam ao estado final. */
export function interrompivel(a: Animation, el?: HTMLElement): Animation {
  emCurso.set(a, performance.now());
  if (el) el.style.willChange = 'transform';
  const limpar = (): void => {
    emCurso.delete(a);
    if (el) el.style.removeProperty('will-change');
  };
  a.addEventListener('finish', limpar);
  a.addEventListener('cancel', limpar);
  return a;
}
export function terminarTudo(e?: Event): void {
  // A rolagem que acabou de trazer o elemento à tela não conta como interrupção.
  const rolagem = e?.type === 'wheel' || e?.type === 'touchstart';
  const agora = performance.now();
  for (const [a, inicio] of [...emCurso]) {
    if (rolagem && agora - inicio < GRACA_ROLAGEM) continue;
    try {
      a.finish();
    } catch {
      a.cancel();
    }
  }
}
for (const tipo of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) {
  addEventListener(tipo, terminarTudo, { capture: true, passive: true });
}

/** Aproximação de --ease-out-expo para animações feitas em rAF. */
export const easeOutExpo = (t: number): number => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

export function lerVar(nome: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(nome).trim();
}
export function duracao(nome: string): number {
  return parseFloat(lerVar(nome)) || 0;
}
