// M1 — distribuição da tiragem: uma vez por sessão, as cartas saem da pilha do Roteiro.
import { virar } from './cartas';
import { aCadaPagina, interrompivel, lerVar, movimentoReduzido } from './util';

const CHAVE = 'tiragem-distribuida';
const TETO = 5;
const DURACAO = 520;
const INTERVALO = 70;

function jaDistribuida(): boolean {
  try {
    return sessionStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
}
function marcar(): void {
  try {
    sessionStorage.setItem(CHAVE, '1');
  } catch {
    /* sem storage: anima de novo na próxima visita, sem prejuízo */
  }
}

function distribuir(lista: HTMLElement): void {
  const pilha = document.querySelector<HTMLElement>('[data-pilha]')?.getBoundingClientRect();
  // A pilha fica no Roteiro; se ela estiver longe, as cartas saem do canto inferior da tela.
  const ox = pilha && pilha.top < innerHeight ? pilha.left + pilha.width / 2 : innerWidth - 60;
  const oy = pilha && pilha.top < innerHeight ? pilha.top + pilha.height / 2 : innerHeight - 40;
  const easing = lerVar('--ease-out-quart');
  const itens = [...lista.querySelectorAll<HTMLElement>('.tiragem__item')].slice(0, TETO);
  itens.forEach((li, i) => {
    const r = li.getBoundingClientRect();
    const dx = ox - (r.left + r.width / 2);
    const dy = oy - (r.top + r.height / 2);
    const final = getComputedStyle(li).transform;
    const fim = final === 'none' ? 'translate(0px, 0px)' : final;
    const a = li.animate([{ transform: `translate(${dx}px, ${dy}px) rotate(6deg)` }, { transform: fim }], {
      duration: DURACAO,
      delay: i * INTERVALO,
      easing,
      fill: 'backwards',
    });
    interrompivel(a, li);
    const corpo = li.querySelector<HTMLElement>('[data-carta-corpo]');
    if (corpo) {
      // A carta vira enquanto chega; o atraso faz parte da mesma animação (interrompível junto).
      const v = virar(corpo);
      if (v?.effect) v.effect.updateTiming({ delay: i * INTERVALO + DURACAO * 0.4, fill: 'backwards' });
    }
  });
}

/** Carrega e decodifica as faces antes da distribuição: sem isso, a 1ª virada pagava ~30 ms de raster na GPU. */
function prepararFaces(lista: HTMLElement): void {
  const ocioso = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 200));
  ocioso(() => {
    for (const img of lista.querySelectorAll<HTMLImageElement>('img')) {
      img.loading = 'eager';
      img.decode().catch(() => undefined);
    }
  });
}

aCadaPagina(() => {
  const lista = document.querySelector<HTMLElement>('[data-tiragem="distribuir"]');
  if (!lista || movimentoReduzido() || jaDistribuida() || !('IntersectionObserver' in window)) return;
  prepararFaces(lista);
  const obs = new IntersectionObserver(
    (entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      obs.disconnect();
      marcar();
      distribuir(lista);
    },
    { threshold: 0.35 },
  );
  obs.observe(lista);
});
