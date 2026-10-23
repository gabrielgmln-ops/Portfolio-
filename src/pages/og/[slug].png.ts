// Imagem Open Graph 1200×630 gerada no build: a carta à esquerda, o nome à direita, sobre petróleo.
import type { APIRoute, GetStaticPaths } from 'astro';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp, { type OverlayOptions } from 'sharp';
import { getCarta, getProjeto, getProjetosVisiveis, type Project } from '../../lib/conteudo';
import { woffParaSfnt } from '../../ui/woff';

const L = 1200;
const A = 630;
// Cores espelham tokens.css (o PNG não lê CSS).
const PETROLEO = '#0E1B1E';
const OURO = '#C2A267';
const CREME = '#EFE3C8';
const pasta = mkdtemp(join(tmpdir(), 'og-fontes-'));
async function ttf(familia: string, pacote: string): Promise<readonly [string, string]> {
  const destino = join(await pasta, `${familia}.ttf`);
  await writeFile(destino, woffParaSfnt(await readFile(fileURLToPath(import.meta.resolve(pacote)))));
  return [familia, destino] as const;
}
const fonte = ttf('Newsreader Medium', '@fontsource/newsreader/files/newsreader-latin-500-normal.woff');
const mono = ttf('IBM Plex Mono', '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff');

export const getStaticPaths = (async () =>
  (await getProjetosVisiveis()).map((p) => ({ params: { slug: p.slug } }))) satisfies GetStaticPaths;

/** Caminho do JPG original da arte (o ImageMetadata guarda fsPath no build). */
function origem(img: object): string {
  const caminho = (img as { fsPath?: string }).fsPath;
  if (caminho) return caminho;
  const src = (img as { src: string }).src;
  const nome = /([\w-]+?)(?:\.[\w-]{8})?\.jpg/.exec(src)?.[1];
  if (!nome) throw new Error(`[og] não achei o arquivo da arte: ${src}`);
  return fileURLToPath(new URL(`../../assets/cartas/${nome}.jpg`, import.meta.url));
}

async function texto(
  t: string,
  [familia, fontfile]: readonly [string, string],
  tamanho: number,
  cor: string,
  largura: number,
): Promise<Buffer> {
  return sharp({
    text: {
      text: `<span foreground="${cor}">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`,
      fontfile,
      font: `${familia} ${tamanho}`,
      dpi: 72,
      width: largura,
      wrap: 'word',
      rgba: true,
    },
  })
    .png()
    .toBuffer();
}

async function gerar(p: Project): Promise<Buffer> {
  const carta = getCarta(p);
  const cl = 340;
  const ca = 506;
  const x = 110;
  const y = Math.round((A - ca) / 2);
  const mascara = Buffer.from(`<svg width="${cl}" height="${ca}"><rect width="${cl}" height="${ca}" rx="14"/></svg>`);
  let arte = sharp(await readFile(origem(carta.imagem)))
    .resize(cl, ca, { fit: 'cover' })
    .composite([{ input: mascara, blend: 'dest-in' }]);
  if (carta.estado === 'em-desenvolvimento') arte = arte.modulate({ saturation: 0.15, brightness: 0.75 });
  const moldura = Buffer.from(
    `<svg width="${cl}" height="${ca}"><rect x="6" y="6" width="${cl - 12}" height="${ca - 12}" rx="10" fill="none" stroke="${OURO}" stroke-width="2"/></svg>`,
  );
  const tx = x + cl + 80;
  const larguraTexto = L - tx - 80;
  const linhas = [
    { buf: await texto(`${p.arcano.numeral} · ${p.arcano.nome}`, await fonte, 34, OURO, larguraTexto), gap: 18 },
    { buf: await texto(p.titulo, await fonte, 72, CREME, larguraTexto), gap: 28 },
  ];
  if (p.resultado) linhas.push({ buf: await texto(p.resultado, await mono, 26, CREME, larguraTexto), gap: 0 });
  const alturas = await Promise.all(linhas.map(async (l) => (await sharp(l.buf).metadata()).height ?? 0));
  const total = alturas.reduce((s, h, i) => s + h + (linhas[i]?.gap ?? 0), 0);
  let ty = Math.round((A - total) / 2);
  const camadas: OverlayOptions[] = [
    { input: await arte.png().toBuffer(), left: x, top: y },
    { input: moldura, left: x, top: y },
  ];
  linhas.forEach((l, i) => {
    camadas.push({ input: l.buf, left: tx, top: ty });
    ty += (alturas[i] ?? 0) + l.gap;
  });
  return sharp({ create: { width: L, height: A, channels: 3, background: PETROLEO } })
    .composite(camadas)
    .png()
    .toBuffer();
}

export const GET: APIRoute = async ({ params }) => {
  const p = await getProjeto(params['slug'] ?? '');
  if (!p) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(await gerar(p)), { headers: { 'Content-Type': 'image/png' } });
};
