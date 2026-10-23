// QA do front-end: tema, teclado, virada, redução de movimento, axe e capturas.
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { rotasDoDist } from './rotas';

const rotas = rotasDoDist();
const CAPTURAS = process.env['CAPTURAS'] === '1';

async function definirTema(page: Page, tema: 'claro' | 'escuro'): Promise<void> {
  await page.addInitScript((t) => localStorage.setItem('tema', t), tema);
}

test.use({ colorScheme: 'dark' });

test('alternância de tema troca data-tema, aria-pressed e persiste', async ({ page }) => {
  await page.goto('/');
  const botao = page.locator('[data-tema-botao]');
  await expect(botao).toHaveAttribute('aria-pressed', 'false');
  await botao.click();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  await expect(botao).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(fundo).toBe('rgb(239, 227, 200)');
});

test('Tab percorre a home com foco sempre visível (anel de 2 px)', async ({ page }) => {
  await page.goto('/');
  const semAnel: string[] = [];
  let passos = 0;
  for (; passos < 60; passos++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return {
        id: `${el.tagName.toLowerCase()} ${el.getAttribute('href') ?? el.textContent?.trim().slice(0, 30)}`,
        anel: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2,
        fim: el.closest('footer') !== null && !el.nextElementSibling && !el.parentElement?.nextElementSibling,
      };
    });
    if (!info) break;
    if (!info.anel) semAnel.push(info.id);
  }
  expect(passos).toBeGreaterThan(8);
  expect(semAnel).toEqual([]);
});

test('a primeira parada do Tab é o link "pular para o conteúdo"', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Pular para o conteúdo');
});

test('Enter numa carta vira a carta e abre o projeto', async ({ page }) => {
  await page.goto('/projetos', { waitUntil: 'networkidle' });
  const carta = page.locator('a[data-carta][data-estado="revelada"]').first();
  // Registra, logo após o clique gerado pelo Enter, se o corpo da carta ganhou a animação de virada.
  await carta.evaluate((a) => {
    addEventListener('click', () => {
      const corpo = a.querySelector('[data-carta-corpo]');
      (window as unknown as { __virou: boolean }).__virou = (corpo?.getAnimations().length ?? 0) > 0;
    });
  });
  await carta.focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => (window as unknown as { __virou?: boolean }).__virou)).toBe(true);
  await page.waitForURL(/\/projetos\/ledger-api\/?$/);
  await expect(page.locator('h1')).toHaveText('Ledger API');
});

test.describe('redução de movimento', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  for (const rota of rotas) {
    test(`${rota}: nenhum elemento termina com opacity < 1 e nada anima`, async ({ page }) => {
      await page.goto(rota, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 300));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 300));
      });
      const r = await page.evaluate(() => {
        const translucidos = [...document.querySelectorAll('body *')]
          .filter((el) => parseFloat(getComputedStyle(el).opacity) < 1)
          .map((el) => el.tagName + '.' + el.className);
        return { translucidos, animacoes: document.getAnimations().length };
      });
      expect(r.translucidos).toEqual([]);
      expect(r.animacoes).toBe(0);
    });
  }
});

for (const tema of ['escuro', 'claro'] as const) {
  test.describe(`axe — tema ${tema}`, () => {
    for (const rota of [...rotas, '/rota-inexistente']) {
      test(`${rota}`, async ({ browser }) => {
        // bypassCSP: o axe é injetado como script inline; a CSP do site é testada em site.spec.ts.
        const ctx = await browser.newContext({ bypassCSP: true, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        await definirTema(page, tema);
        await page.goto(rota, { waitUntil: 'networkidle' });
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        const graves = r.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(graves).toEqual([]);
        await ctx.close();
      });
    }
  });
}

test.describe('capturas', () => {
  test.skip(!CAPTURAS, 'rode com CAPTURAS=1');
  for (const largura of [375, 768, 1440]) {
    for (const tema of ['escuro', 'claro'] as const) {
      test(`${largura}px ${tema}`, async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        await definirTema(page, tema);
        for (const rota of [...rotas, '/rota-inexistente']) {
          await page.goto(rota, { waitUntil: 'networkidle' });
          const nome = rota === '/' ? 'home' : rota.replace(/^\//, '').replace(/\//g, '-');
          await page.screenshot({ path: `qa/screenshots/${nome}-${largura}-${tema}.png`, fullPage: true });
        }
        await ctx.close();
      });
    }
  }
});
