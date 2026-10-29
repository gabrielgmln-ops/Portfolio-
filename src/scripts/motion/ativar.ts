// Liga o movimento o mais cedo possível (módulo no <head>; a CSP proíbe script inline).
// html.js-motion só existe sem prefers-reduced-motion; data-intro só se a sessão ainda não viu a abertura.
import { movimentoReduzido } from './util';

const CHAVE = 'abertura-vista';
const raiz = document.documentElement;

export function aberturaVista(): boolean {
  try {
    return sessionStorage.getItem(CHAVE) === '1';
  } catch {
    return true; // storage bloqueado: não arrisca repetir a abertura
  }
}
export function marcarAberturaVista(): void {
  try {
    sessionStorage.setItem(CHAVE, '1');
  } catch {
    /* sem storage: segue */
  }
}

let pronto = false;
/** Chamado pelo módulo principal; sem ele, o seguro abaixo desliga o "escondido". */
export function movimentoPronto(): void {
  pronto = true;
}

function aplicar(): void {
  if (movimentoReduzido()) {
    raiz.classList.remove('js-motion');
    delete raiz.dataset['intro'];
    return;
  }
  raiz.classList.add('js-motion');
  if (aberturaVista()) delete raiz.dataset['intro'];
  else raiz.dataset['intro'] = '';
}

aplicar();
// O ClientRouter troca os atributos do <html> a cada navegação: reaplica antes do paint.
document.addEventListener('astro:after-swap', aplicar);
// Seguro: se o resto do JS falhar, nada fica escondido.
setTimeout(() => {
  if (pronto) return;
  raiz.classList.remove('js-motion');
  delete raiz.dataset['intro'];
}, 2500);
