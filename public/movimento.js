// Liga html.js-motion antes do primeiro paint (arquivo externo e síncrono: a CSP proíbe script inline).
// Só sem prefers-reduced-motion; data-intro só se a sessão ainda não viu a abertura.
// O seguro de 2,5 s e o religamento após navegação ficam em src/scripts/motion/ativar.ts.
(function () {
  var raiz = document.documentElement;
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  } catch {
    return;
  }
  raiz.classList.add('js-motion');
  var vista = true;
  try {
    vista = sessionStorage.getItem('abertura-vista') === '1';
  } catch {
    /* storage bloqueado: não arrisca repetir a abertura */
  }
  if (!vista) raiz.setAttribute('data-intro', '');
})();
