// Cartas: nome da View Transition (data-vt → CSSOM) e inclinação discreta no leque (só ponteiro fino).
import { aCadaPagina, comMovimento, ponteiroFino } from './util';

/* View Transition: o transition:name do Astro gera <style> inline, que a CSP bloqueia */
function nomearTransicoes(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-vt]')) {
    el.style.setProperty('view-transition-name', el.dataset['vt'] ?? 'none');
  }
}
document.addEventListener('astro:after-swap', nomearTransicoes);

const INCLINACAO = 8; // graus no canto

function inclinar(carta: HTMLElement): void {
  let quadro = 0;
  let px = 0;
  let py = 0;
  const pintar = (): void => {
    quadro = 0;
    const r = carta.getBoundingClientRect();
    const x = (px - r.left) / r.width - 0.5;
    const y = (py - r.top) / r.height - 0.5;
    const m = Math.hypot(x, y) * INCLINACAO;
    carta.style.rotate = m ? `${(-y).toFixed(3)} ${x.toFixed(3)} 0 ${m.toFixed(2)}deg` : '';
  };
  carta.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    px = e.clientX;
    py = e.clientY;
    quadro ||= requestAnimationFrame(pintar);
  });
  carta.addEventListener('pointerleave', () => {
    cancelAnimationFrame(quadro);
    quadro = 0;
    carta.style.rotate = '';
  });
}

aCadaPagina(() => {
  nomearTransicoes();
  if (!comMovimento() || !ponteiroFino()) return;
  for (const carta of document.querySelectorAll<HTMLElement>('.leque .carta')) {
    if (carta.dataset['inclina'] !== undefined) continue;
    carta.dataset['inclina'] = '';
    inclinar(carta);
  }
});
