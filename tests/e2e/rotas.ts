import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Rotas descobertas lendo os .html de dist/ (exceto a 404). */
export function rotasDoDist(dir = 'dist'): string[] {
  const out: string[] = [];
  const andar = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) andar(p);
      else if (e.name.endsWith('.html')) {
        const r = relative(dir, p).split(sep).join('/');
        if (r === '404.html') continue;
        out.push(`/${r.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '')}`);
      }
    }
  };
  andar(dir);
  return out.sort();
}
