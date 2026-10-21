// Servidor estático de teste: serve dist/ com os MESMOS cabeçalhos de vercel.json
// (o `astro preview` não aplica cabeçalhos da hospedagem, então não serviria para checar a CSP).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const raiz = resolve('dist');
const porta = Number(process.env.PORT ?? 4321);
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function cabecalhos(caminho) {
  const out = {};
  for (const regra of vercel.headers) {
    // Só suportamos literais e "(.*)"; qualquer outra sintaxe aborta em vez de não casar em silêncio.
    const partes = regra.source.split('(.*)');
    if (partes.some((p) => /[:{}?+*()[\]]/.test(p))) throw new Error(`source não suportado: ${regra.source}`);
    const re = new RegExp(`^${partes.map((p) => p.replace(/[.\\^$|/]/g, '\\$&')).join('.*')}$`);
    if (re.test(caminho)) for (const h of regra.headers) out[h.key] = h.value;
  }
  return out;
}

async function arquivo(p) {
  try {
    return (await stat(p)).isFile() ? p : undefined;
  } catch {
    return undefined;
  }
}

createServer(async (req, res) => {
  const caminho = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const alvo = resolve(raiz, '.' + caminho);
  const dentro = alvo === raiz || alvo.startsWith(raiz + sep);
  let status = 200;
  let f = dentro
    ? ((await arquivo(alvo)) ?? (await arquivo(join(alvo, 'index.html'))) ?? (await arquivo(`${alvo}.html`)))
    : undefined;
  if (!f) {
    status = 404;
    f = await arquivo(join(raiz, '404.html'));
  }
  const h = { ...cabecalhos(caminho), 'Content-Type': tipos[extname(f ?? '.html')] ?? 'application/octet-stream' };
  res.writeHead(status, h);
  res.end(f ? await readFile(f) : 'Not found');
}).listen(porta, '127.0.0.1', () => console.log(`servidor de teste em http://127.0.0.1:${porta}`));
