// Revelações por IntersectionObserver (.on), declaração palavra por palavra e contadores.
import { easeOutQuart, registrar } from './util';

const SELETOR = '.sobe, .mask, .declara, .retrato, .nums, .log';

/** Quebra [data-palavras] em .w>span (o <em> inteiro é uma palavra). O leitor de tela lê a cópia .sr-only. */
function palavras(): void {
  for (const h of document.querySelectorAll<HTMLElement>('[data-palavras]')) {
    if (h.dataset['quebrado'] !== undefined) continue;
    h.dataset['quebrado'] = '';
    const leitura = document.createElement('span');
    leitura.className = 'sr-only';
    leitura.textContent = (h.textContent ?? '').replace(/\s+/g, ' ').trim();
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    let n = 0;
    const palavra = (conteudo: Node): void => {
      if (n) visual.append(' ');
      const w = document.createElement('span');
      w.className = 'w';
      const s = document.createElement('span');
      s.style.transitionDelay = `${n * 22}ms`;
      s.append(conteudo);
      w.append(s);
      visual.append(w);
      n++;
    };
    for (const no of [...h.childNodes]) {
      if (no.nodeType === Node.TEXT_NODE) {
        for (const t of (no.textContent ?? '').split(/\s+/).filter(Boolean)) palavra(document.createTextNode(t));
      } else if (no instanceof Element) {
        palavra(no.cloneNode(true));
      }
    }
    h.replaceChildren(leitura, visual);
  }
}

/* Contadores: 0 → valor final em 1,4 s (out-quart); o texto final é o próprio do HTML. Zero não conta. */
interface Contador {
  final: string;
  alvo: number;
  fmt: (v: number) => string;
}
function preparar(el: HTMLElement): Contador {
  const final = el.dataset['final'] ?? (el.textContent ?? '').trim();
  el.dataset['final'] = final;
  const alvo = Number(el.dataset['conta']);
  const casas = Number(el.dataset['casas'] ?? 0) || 0;
  const pre = el.dataset['prefixo'] ?? '';
  const suf = el.dataset['sufixo'] ?? '';
  const fmt = (v: number): string =>
    `${pre}${v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}${suf}`;
  return { final, alvo, fmt };
}
const conta = (c: Contador): boolean => Number.isFinite(c.alvo) && c.alvo !== 0;

function zerar(nums: Element): void {
  for (const el of nums.querySelectorAll<HTMLElement>('b[data-conta]')) {
    const c = preparar(el);
    if (conta(c)) el.textContent = c.fmt(0);
  }
}
function contar(nums: Element): void {
  for (const el of nums.querySelectorAll<HTMLElement>('b[data-conta]')) {
    const c = preparar(el);
    if (!conta(c)) {
      el.textContent = c.final;
      continue;
    }
    const t0 = performance.now();
    registrar((t) => {
      const p = Math.min(1, (t - t0) / 1400);
      el.textContent = p >= 1 ? c.final : c.fmt(c.alvo * easeOutQuart(p));
      return p < 1;
    });
  }
}

let io: IntersectionObserver | undefined;
export function revelar(): void {
  io?.disconnect();
  palavras();
  for (const n of document.querySelectorAll('.nums')) zerar(n);
  io = new IntersectionObserver(
    (es, obs) => {
      for (const e of es) {
        // entrou na tela, ou já ficou para trás (voltar com a rolagem restaurada)
        if (!e.isIntersecting && e.boundingClientRect.bottom > 0) continue;
        obs.unobserve(e.target);
        e.target.classList.add('on');
        if (e.target.classList.contains('nums')) contar(e.target);
        e.target.dispatchEvent(new Event('visivel'));
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  for (const el of document.querySelectorAll(SELETOR)) io.observe(el);
}
