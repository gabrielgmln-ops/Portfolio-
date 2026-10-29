// Lenis (rolagem suave), âncoras internas com foco e o letreiro do hero que muda de sentido com a rolagem.
import Lenis from 'lenis';
import { aCadaPagina, acordar, comMovimento, registrar } from './util';

let lenis: Lenis | undefined;
let sentido = -1; // -1: anda para a esquerda (rolando para baixo); 1: para a direita
let ultimoY = scrollY;
let ultimoGesto = 0;

function iniciarLenis(): void {
  if (lenis || !comMovimento()) return;
  const l = new Lenis({ duration: 1.1, easing: (t) => 1 - (1 - t) ** 4, autoRaf: false, anchors: false });
  lenis = l;
  l.on('scroll', (e: Lenis) => {
    if (e.direction) sentido = e.direction === 1 ? -1 : 1;
  });
  // o laço só roda enquanto a Lenis está rolando (ou logo após um gesto)
  registrar((t) => {
    l.raf(t);
    return Boolean(l.isScrolling) || t - ultimoGesto < 400;
  });
  const gesto = (): void => {
    ultimoGesto = performance.now();
    acordar();
  };
  addEventListener('wheel', gesto, { passive: true });
  addEventListener('touchstart', gesto, { passive: true });
}

addEventListener(
  'scroll',
  () => {
    if (lenis) return;
    sentido = scrollY > ultimoY ? -1 : 1;
    ultimoY = scrollY;
  },
  { passive: true },
);

/* Âncoras internas: Lenis com offset; no fim, o foco vai para o alvo (teclado e leitor de tela). */
function focar(alvo: HTMLElement): void {
  if (!alvo.matches('a[href],button,input,select,textarea,[tabindex]')) alvo.setAttribute('tabindex', '-1');
  alvo.focus({ preventScroll: true });
}
document.addEventListener(
  'click',
  (e) => {
    const l = lenis;
    if (!l || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    const hash = a?.getAttribute('href') ?? '';
    if (hash.length < 2) return;
    let alvo: HTMLElement | null;
    try {
      alvo = document.querySelector<HTMLElement>(decodeURIComponent(hash));
    } catch {
      return;
    }
    if (!alvo) return;
    e.preventDefault(); // o script do Header ainda fecha o painel (ele não olha defaultPrevented)
    history.pushState(history.state, '', hash);
    const destino = alvo;
    l.scrollTo(destino, { offset: -20, onComplete: () => focar(destino) });
    ultimoGesto = performance.now();
    acordar();
  },
  { capture: true },
);

/* Letreiro: translateX contínuo, sentido pela rolagem; pausa quando o hero sai da tela */
function letreiro(): void {
  const trilho = document.querySelector<HTMLElement>('[data-letreiro]');
  if (!trilho || !comMovimento()) return;
  const copias = trilho.children.length || 1;
  let largura = trilho.scrollWidth / copias;
  let x = 0;
  let parar: (() => void) | undefined;
  const ro = new ResizeObserver(() => (largura = trilho.scrollWidth / copias));
  ro.observe(trilho);
  const passo = (_t: number, dt: number): boolean => {
    x += sentido * 0.036 * dt; // ~36 px/s
    if (x <= -largura) x += largura;
    if (x > 0) x -= largura;
    trilho.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    return true;
  };
  const io = new IntersectionObserver((es) => {
    const visivel = es.some((en) => en.isIntersecting);
    parar?.();
    parar = visivel ? registrar(passo) : undefined;
  });
  io.observe(trilho.closest('.hero') ?? trilho);
  document.addEventListener(
    'astro:before-swap',
    () => {
      ro.disconnect();
      io.disconnect();
      parar?.();
    },
    { once: true },
  );
}

aCadaPagina(() => {
  iniciarLenis();
  lenis?.resize();
  letreiro();
});
