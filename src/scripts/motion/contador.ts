// M7 — contador do resultado: reescreve só os dígitos; o texto final já está no HTML.
import { aCadaPagina, easeOutExpo, movimentoReduzido } from './util';

const DURACAO = 1200;
const fmt = new Intl.NumberFormat('pt-BR');

function contar(el: HTMLElement): void {
  const alvo = Number(el.dataset['contador']);
  if (!Number.isFinite(alvo)) return;
  const final = el.dataset['final'] ?? fmt.format(alvo);
  const inicio = performance.now();
  let parar = false;
  const encerrar = (): void => {
    parar = true;
    el.textContent = final;
  };
  for (const t of ['pointerdown', 'keydown'] as const) addEventListener(t, encerrar, { once: true });
  const passo = (agora: number): void => {
    if (parar) return;
    const t = Math.min(1, (agora - inicio) / DURACAO);
    el.textContent = t >= 1 ? final : fmt.format(Math.round(alvo * easeOutExpo(t)));
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

aCadaPagina(() => {
  const els = document.querySelectorAll<HTMLElement>('[data-contador]');
  if (!els.length || movimentoReduzido() || !('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        obs.unobserve(e.target);
        contar(e.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => obs.observe(el));
});
