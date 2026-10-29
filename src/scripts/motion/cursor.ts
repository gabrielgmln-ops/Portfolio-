// Magnético (.magnetico: só .redondo e .pilula) e prévia da carta seguindo o cursor no índice.
// Só com ponteiro fino e movimento ligado; nada disso no toque.
import { comMovimento, ponteiroFino, registrar } from './util';

const VOLTA = 'transform .7s cubic-bezier(.22,1,.36,1), color .5s';

function magnetico(b: HTMLElement): void {
  const f = b.classList.contains('redondo') ? 0.35 : 0.22;
  let volta = 0;
  b.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(volta);
    b.style.transition = '';
    const r = b.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * f;
    const y = (e.clientY - r.top - r.height / 2) * f;
    b.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
  });
  b.addEventListener('pointerleave', () => {
    b.style.transition = VOLTA;
    b.style.transform = '';
    volta = window.setTimeout(() => (b.style.transition = ''), 700);
  });
}

function previa(): void {
  const pv = document.querySelector<HTMLElement>('.preview');
  const img = pv?.querySelector('img');
  const ver = document.querySelector<HTMLElement>('.ver');
  const indice = document.querySelector<HTMLElement>('.indice');
  if (!pv || !img || !ver || !indice) return;
  let mx = 0;
  let my = 0;
  let qx = 0;
  let qy = 0;
  let ativo = false;
  let parar: (() => void) | undefined;
  // lerp .14; o laço dorme quando o cursor sai do índice e a prévia assenta
  const passo = (): boolean => {
    qx += (mx - qx) * 0.14;
    qy += (my - qy) * 0.14;
    pv.style.left = `${qx.toFixed(1)}px`;
    pv.style.top = `${qy.toFixed(1)}px`;
    ver.style.left = `${mx}px`;
    ver.style.top = `${my}px`;
    const segue = ativo || Math.abs(mx - qx) + Math.abs(my - qy) > 0.5;
    if (!segue) parar = undefined;
    return segue;
  };
  indice.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX;
    my = e.clientY;
  });
  for (const a of indice.querySelectorAll<HTMLAnchorElement>('a[data-preview]')) {
    a.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      if (!parar) {
        qx = mx;
        qy = my;
      }
      const src = a.dataset['preview'] ?? '';
      if (img.getAttribute('src') !== src) img.src = src;
      img.alt = a.dataset['previewAlt'] ?? '';
      ativo = true;
      pv.classList.add('vis');
      ver.classList.add('vis');
      parar ??= registrar(passo);
    });
    a.addEventListener('pointerleave', () => {
      ativo = false;
      pv.classList.remove('vis');
      ver.classList.remove('vis');
    });
  }
}

export function cursor(): void {
  if (!comMovimento() || !ponteiroFino()) return;
  for (const b of document.querySelectorAll<HTMLElement>('.magnetico')) {
    if (b.dataset['ima'] !== undefined) continue;
    b.dataset['ima'] = '';
    magnetico(b);
  }
  previa();
}
