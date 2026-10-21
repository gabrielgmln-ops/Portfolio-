import type { APIRoute } from 'astro';

// Gerado no build: a linha Sitemap só existe quando SITE_URL está definido.
export const GET: APIRoute = ({ site }) => {
  const linhas = ['User-agent: *', 'Allow: /'];
  if (site) linhas.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);
  return new Response(`${linhas.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
