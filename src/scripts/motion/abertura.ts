// Abertura "Olá → Hello → Hola" e cortina curva subindo (~1,1 s no total), uma vez por sessão.
// No fim, o hero entra (.hero.on) e as revelações começam.
import { marcarAberturaVista } from './ativar';
import { comMovimento } from './util';

const PALAVRAS = ['Olá', 'Hello', 'Hola'];
const TROCA = 240; // ms por palavra
const CORTINA = 400; // ms da subida

/** Roda a abertura se houver; chama `fim` quando o conteúdo deve entrar. */
export function abertura(fim: () => void): void {
  const raiz = document.documentElement;
  const intro = document.querySelector<HTMLElement>('.intro');
  const hero = document.querySelector<HTMLElement>('.hero');
  const entrar = (): void => {
    hero?.classList.add('on');
    fim();
  };
  if (!intro || !comMovimento() || raiz.dataset['intro'] === undefined) {
    intro?.remove();
    entrar();
    return;
  }
  marcarAberturaVista();
  const p = intro.querySelector('p');
  let i = 0;
  const iv = setInterval(() => {
    i++;
    if (i < PALAVRAS.length) {
      if (p) p.textContent = PALAVRAS[i] ?? '';
      return;
    }
    clearInterval(iv);
    intro.style.transitionDuration = `${CORTINA}ms`;
    intro.style.pointerEvents = 'none';
    intro.classList.add('sai');
    setTimeout(entrar, 120);
    setTimeout(() => {
      intro.remove();
      delete raiz.dataset['intro'];
    }, CORTINA);
  }, TROCA);
}
