// Log de transações: ao aparecer, simula 1.000 transferências (ilustrativas) em ~3,4 s.
// O estado final é sempre o medido: 1.000 / 1.000 e diferença R$ 0,00.
const TOTAL = 1000;
const PASSO = 12; // transferências por tique
const TIQUE = 40; // ms
const brl = (v: number): string => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dois = (n: number): string => String(n).padStart(2, '0');

function celula(txt: string, cls?: string): HTMLSpanElement {
  const s = document.createElement('span');
  if (cls) s.className = cls;
  s.textContent = txt;
  return s;
}
function linha(n: number): HTMLDivElement {
  const de = 1 + Math.floor(Math.random() * 10);
  let para = 1 + Math.floor(Math.random() * 10);
  if (para === de) para = (de % 10) + 1;
  const valor = (1 + Math.floor(Math.random() * 30000)) / 100;
  const ok = Math.random() > 0.18;
  const d = document.createElement('div');
  d.className = ok ? 'ok' : 'rec';
  d.append(
    celula(`#${String(n).padStart(4, '0')}`),
    celula(`c${dois(de)} → c${dois(para)}`, 'ct'),
    celula(brl(valor)),
    celula(ok ? 'concluída' : 'recusada · saldo', 'st'),
  );
  return d;
}

export function logs(): void {
  for (const log of document.querySelectorAll<HTMLElement>('[data-log]')) {
    if (log.dataset['pronto'] !== undefined) continue;
    log.dataset['pronto'] = '';
    const lin = log.querySelector<HTMLElement>('.log__linhas');
    const barra = log.querySelector<HTMLElement>('.log__barra i');
    const proc = log.querySelector<HTMLElement>('.f-proc');
    const dif = log.querySelector<HTMLElement>('.f-dif');
    const est = log.querySelector<HTMLElement>('.log__estado');
    if (!lin || !barra || !proc || !dif || !est) continue;
    let timer = 0;
    let rodou = false;
    const fechar = (): void => {
      clearInterval(timer);
      timer = 0;
      proc.textContent = '1.000 / 1.000';
      barra.style.width = '100%';
      dif.textContent = 'R$ 0,00';
      log.classList.remove('rodando');
      est.textContent = 'concluído'; // única mudança anunciada: o aria-live foi ligado depois de "rodando"
    };
    const rodar = (): void => {
      clearInterval(timer);
      est.removeAttribute('aria-live');
      lin.replaceChildren();
      dif.textContent = '—';
      log.classList.add('rodando');
      est.textContent = 'rodando';
      barra.style.width = '0%';
      proc.textContent = '0 / 1.000';
      let n = 0;
      requestAnimationFrame(() => est.setAttribute('aria-live', 'polite'));
      timer = window.setInterval(() => {
        for (let k = 0; k < PASSO && n < TOTAL; k++) {
          n++;
          if (n % 4 === 0) {
            lin.append(linha(n));
            if (lin.children.length > 14) lin.firstElementChild?.remove();
          }
        }
        proc.textContent = `${n.toLocaleString('pt-BR')} / 1.000`;
        barra.style.width = `${(n / TOTAL) * 100}%`;
        if (n >= TOTAL) fechar();
      }, TIQUE);
    };
    log.addEventListener('visivel', () => {
      if (rodou) return;
      rodou = true;
      rodar();
    });
    log.querySelector('[data-log-reiniciar]')?.addEventListener('click', rodar);
    document.addEventListener('astro:before-swap', () => clearInterval(timer), { once: true });
  }
}
