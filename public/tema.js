// Aplica o tema antes do primeiro paint (arquivo externo: a CSP proíbe script inline).
(function () {
  try {
    var t = localStorage.getItem('tema');
    if (t === 'claro' || t === 'escuro') document.documentElement.dataset.tema = t;
  } catch {
    /* storage bloqueado: fica no padrão escuro */
  }
})();
