// Capturas do v7 e do protótipo (375/768/1440, escuro e claro, movimento reduzido = estado final).
// Uso: node qa/capturar-v7.mjs  (com o servidor do dist em http://127.0.0.1:4321: node tests/e2e/servidor.mjs)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const PROTO = pathToFileURL(resolve('../prototipos/portfolio-v7-dennis.html')).href;
const rotas = [
  ['home', '/'],
  ['ledger-api', '/projetos/ledger-api'],
  ['plataforma', '/plataforma'],
];
mkdirSync('qa/screenshots/v7', { recursive: true });
mkdirSync('qa/screenshots/prototipo', { recursive: true });

const browser = await chromium.launch();
for (const largura of [375, 768, 1440]) {
  for (const tema of ['escuro', 'claro']) {
    const ctx = await browser.newContext({
      viewport: { width: largura, height: 900 },
      reducedMotion: 'reduce',
      colorScheme: tema === 'claro' ? 'light' : 'dark',
    });
    await ctx.addInitScript((t) => localStorage.setItem('tema', t), tema);
    const page = await ctx.newPage();
    if (!process.env.SO_PROTO) {
      for (const [nome, rota] of rotas) {
        await page.goto(BASE + rota, { waitUntil: 'networkidle' });
        await page.screenshot({ path: `qa/screenshots/v7/${nome}-${largura}-${tema}.png`, fullPage: true });
      }
    }
    await page.goto(PROTO, { waitUntil: 'load' });
    await page.evaluate((t) => (document.documentElement.dataset.tema = t), tema);
    await page.waitForTimeout(3000); // o protótipo tem abertura própria
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `qa/screenshots/prototipo/home-${largura}-${tema}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
