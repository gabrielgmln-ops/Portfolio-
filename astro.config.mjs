import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// O domínio real ainda é [PENDENTE]: vem só de SITE_URL. Sem ele, sitemap e canonical são omitidos.
const site = process.env.SITE_URL?.trim() || undefined;
if (!site) {
  console.warn('[seo] SITE_URL ausente: sitemap, canonical e og:url serão omitidos neste build.');
}

export default defineConfig({
  ...(site ? { site } : {}),
  integrations: [mdx(), ...(site ? [sitemap({ filter: (p) => !p.includes('/_kit') })] : [])],
  // CSP sem 'unsafe-inline': nada de CSS/JS inline gerado pelo Astro.
  build: { inlineStylesheets: 'never' },
  // Um CSS só: menos requisições bloqueando o primeiro paint (a CSP impede CSS crítico inline).
  vite: { build: { assetsInlineLimit: 0, cssCodeSplit: false } },
});
