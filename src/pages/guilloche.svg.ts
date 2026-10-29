// Fundo guilloché do hero, gerado no build (mesma fórmula do protótipo v7: 8 hipotrocoides).
// Arquivo à parte (cacheável) em vez de ~70 KB de paths dentro do HTML.
import type { APIRoute } from 'astro';

function caminhos(): string {
  let h = '';
  for (let k = 0; k < 8; k++) {
    let d = '';
    const R = 440 - k * 44;
    const r = R * 0.29;
    const a = R * 0.22;
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += Math.PI / 360) {
      const x = (R - r) * Math.cos(t) + a * Math.cos(((R - r) / r) * t);
      const y = (R - r) * Math.sin(t) - a * Math.sin(((R - r) / r) * t);
      d += (t ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    h += `<path d="${d}" stroke-width="${k % 2 ? 0.6 : 1}"/>`;
  }
  return h;
}

export const GET: APIRoute = () =>
  new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-500 -500 1000 1000" fill="none" stroke="#C9A96A" stroke-opacity=".11">${caminhos()}</svg>`,
    { headers: { 'Content-Type': 'image/svg+xml' } },
  );
