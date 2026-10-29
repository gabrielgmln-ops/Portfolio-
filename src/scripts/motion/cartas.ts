// M2 virar ao abrir, M3 elevação + inclinação, M4 brilho de folha de ouro.
import { navigate } from 'astro:transitions/client';
import { aCadaPagina, duracao, interrompivel, lerVar, movimentoReduzido, ponteiroFino } from './util';

const INCLINACAO_MAX = 6;

/* M3 — a inclinação segue o ponteiro, atualizada em rAF por variáveis no próprio elemento */
function inclinar(carta: HTMLElement): void {
  let quadro = 0;
  let px = 0;
  let py = 0;
  const pintar = (): void => {
    quadro = 0;
    const r = carta.getBoundingClientRect();
    const nx = (px - r.left) / r.width - 0.5;
    const ny = (py - r.top) / r.height - 0.5;
    carta.style.setProperty('--ry', `${(nx * 2 * INCLINACAO_MAX).toFixed(2)}deg`);
    carta.style.setProperty('--rx', `${(-ny * 2 * INCLINACAO_MAX).toFixed(2)}deg`);
  };
  carta.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || movimentoReduzido() || !ponteiroFino()) return;
    px = e.clientX;
    py = e.clientY;
    carta.dataset['inclinando'] = '';
    quadro ||= requestAnimationFrame(pintar);
  });
  carta.addEventListener('pointerleave', () => {
    cancelAnimationFrame(quadro);
    quadro = 0;
    delete carta.dataset['inclinando'];
    carta.style.removeProperty('--rx');
    carta.style.removeProperty('--ry');
  });
}

/* M2 — verso → frente. Devolve undefined com redução de movimento. */
export function virar(corpo: HTMLElement): Animation | undefined {
  if (movimentoReduzido()) return undefined;
  const a = corpo.animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(0deg)' }], {
    duration: duracao('--dur-carta'),
    easing: lerVar('--ease-out-expo'),
  });
  return interrompivel(a, corpo);
}

/* M2 + M5 — a carta vira e a navegação segue com a View Transition, numa sequência só */
function abrir(carta: HTMLAnchorElement): void {
  carta.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const corpo = carta.querySelector<HTMLElement>('[data-carta-corpo]');
    if (!corpo) return;
    const a = virar(corpo);
    if (!a) return; // sem animação: navegação normal
    e.preventDefault();
    const ir = (): void => void navigate(carta.href);
    a.finished.then(ir, ir);
  });
}

/* O Louco — a carta vira e o diálogo do GitHub abre em seguida */
function abrirDialogo(carta: HTMLButtonElement): void {
  carta.addEventListener('click', () => {
    const dialogo = document.getElementById(carta.dataset['abreDialogo'] ?? '');
    if (!(dialogo instanceof HTMLDialogElement) || dialogo.open) return;
    const corpo = carta.querySelector<HTMLElement>('[data-carta-corpo]');
    const a = corpo ? virar(corpo) : undefined;
    const mostrar = (): void => dialogo.showModal();
    if (a) a.finished.then(mostrar, mostrar);
    else mostrar();
  });
}

/* M4 — brilho uma única vez, quando a carta revelada entra na viewport */
const observador =
  'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entradas, obs) => {
          for (const en of entradas) {
            if (!en.isIntersecting) continue;
            const el = en.target as HTMLElement;
            obs.unobserve(el);
            if (!movimentoReduzido()) el.dataset['brilho'] = 'sim';
          }
        },
        { threshold: 0.6 },
      )
    : undefined;

/* M5 — nome da View Transition aplicado via CSSOM: o transition:name do Astro gera <style> inline, que a CSP bloqueia */
function nomearTransicoes(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-vt]')) {
    el.style.setProperty('view-transition-name', el.dataset['vt'] ?? 'none');
  }
}
document.addEventListener('astro:after-swap', nomearTransicoes);

aCadaPagina(() => {
  nomearTransicoes();
  for (const carta of document.querySelectorAll<HTMLAnchorElement>('a[data-carta]')) {
    if (carta.dataset['pronta'] !== undefined) continue;
    carta.dataset['pronta'] = '';
    inclinar(carta);
    abrir(carta);
    if (carta.dataset['estado'] === 'revelada') observador?.observe(carta);
  }
  for (const carta of document.querySelectorAll<HTMLButtonElement>('button[data-carta][data-abre-dialogo]')) {
    if (carta.dataset['pronta'] !== undefined) continue;
    carta.dataset['pronta'] = '';
    inclinar(carta);
    abrirDialogo(carta);
  }
});
