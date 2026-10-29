// Entrada do movimento (importada pelo Layout, depois de ativar.ts). Tudo depende de html.js-motion.
import { movimentoPronto } from './ativar';
import { abertura } from './abertura';
import { cursor } from './cursor';
import { logs } from './log';
import { revelar } from './revelar';
import './rolagem';
import { aCadaPagina, comMovimento } from './util';

aCadaPagina(() => {
  movimentoPronto();
  if (!comMovimento()) return;
  logs();
  cursor();
  abertura(revelar);
});
