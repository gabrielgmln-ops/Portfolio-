// Alternância de tema. A aplicação antes do paint fica em public/tema.js.
type Tema = 'claro' | 'escuro';
const raiz = document.documentElement;
let escolhido: Tema | undefined;

function ler(): Tema | undefined {
  try {
    const t = localStorage.getItem('tema');
    return t === 'claro' || t === 'escuro' ? t : undefined;
  } catch {
    return undefined;
  }
}
function atual(): Tema {
  const t = raiz.dataset['tema'];
  if (t === 'claro' || t === 'escuro') return t;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro';
}
function sincronizarBotoes(): void {
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-tema-botao]')) {
    b.setAttribute('aria-pressed', String(atual() === 'claro'));
  }
}
function aplicar(t: Tema): void {
  escolhido = t;
  raiz.dataset['tema'] = t;
  try {
    localStorage.setItem('tema', t);
  } catch {
    /* sem storage: vale só nesta visita */
  }
  sincronizarBotoes();
}

escolhido = ler();
document.addEventListener('click', (e) => {
  const alvo = e.target instanceof Element ? e.target.closest('[data-tema-botao]') : null;
  if (alvo) aplicar(atual() === 'claro' ? 'escuro' : 'claro');
});
// O ClientRouter troca o <html>: reaplica antes do paint da nova página.
document.addEventListener('astro:after-swap', () => {
  if (escolhido) raiz.dataset['tema'] = escolhido;
});
document.addEventListener('astro:page-load', sincronizarBotoes);
sincronizarBotoes();
