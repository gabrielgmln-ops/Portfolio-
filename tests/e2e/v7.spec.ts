// QA do redesenho v7: rotas, menu redondo, tema, log, movimento reduzido, índice, projeto e /plataforma.
import { expect, test, type Page } from '@playwright/test';
import { rotasDoDist } from './rotas';

const rotas = rotasDoDist();

function vigiarConsole(page: Page): string[] {
  const erros: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(m.text());
  });
  page.on('pageerror', (e) => erros.push(e.message));
  return erros;
}

test.describe('rotas do dist', () => {
  for (const rota of rotas) {
    test(`${rota}: 200, um h1, sem erro de console`, async ({ page }) => {
      const erros = vigiarConsole(page);
      const r = await page.goto(rota, { waitUntil: 'networkidle' });
      expect(r?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(erros).toEqual([]);
    });
  }
});

test('js-motion já está no <html> antes do DOMContentLoaded (sem flash)', async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      (window as unknown as { __jm: boolean }).__jm = document.documentElement.classList.contains('js-motion');
    });
  });
  await page.goto('/');
  expect(await page.evaluate(() => (window as unknown as { __jm: boolean }).__jm)).toBe(true);
  await expect(page.locator('head script[src="/movimento.js"]:not([type])')).toHaveCount(1);
});

test('menu redondo por teclado: abre, foca o 1º link, Esc fecha e devolve o foco', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, innerHeight * 1.5));
  const botao = page.locator('[data-menu-botao]');
  await expect(botao).toHaveClass(/vis/);
  const painel = page.locator('[data-menu-painel]');
  await expect(painel).toHaveAttribute('inert', '');
  // Tab até o botão
  let achou = false;
  for (let i = 0; i < 80 && !achou; i++) {
    await page.keyboard.press('Tab');
    achou = await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-botao') ?? false);
  }
  expect(achou).toBe(true);
  await page.keyboard.press('Enter');
  await expect(botao).toHaveAttribute('aria-expanded', 'true');
  await expect(painel).not.toHaveAttribute('inert');
  await expect(painel.locator('a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(botao).toHaveAttribute('aria-expanded', 'false');
  await expect(botao).toBeFocused();
  await expect(painel).toHaveAttribute('inert', '');
});

test('tema: alterna, aria-pressed e persiste no reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const botao = page.locator('[data-tema-botao]');
  await expect(html).not.toHaveAttribute('data-tema', 'claro');
  await expect(botao).toHaveAttribute('aria-pressed', 'false');
  await botao.click();
  await expect(html).toHaveAttribute('data-tema', 'claro');
  await expect(botao).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(html).toHaveAttribute('data-tema', 'claro');
  await expect(botao).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(243, 243, 239)');
  await botao.click();
  await expect(html).toHaveAttribute('data-tema', 'escuro');
  await expect(botao).toHaveAttribute('aria-pressed', 'false');
});

test('log de transações chega a 1.000 / 1.000 e R$ 0,00', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const log = page.locator('figure.log[data-log]');
  await log.scrollIntoViewIfNeeded();
  await expect(log.locator('.log__estado')).toHaveText('concluído', { timeout: 10_000 });
  await expect(log.locator('.f-proc')).toHaveText('1.000 / 1.000');
  await expect(log.locator('.f-dif')).toHaveText('R$ 0,00');
});

test.describe('movimento reduzido (v7)', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('home no estado final: sem abertura, log e contadores finais, nada invisível', async ({ page }) => {
    const fonte = await (await page.request.get('/')).text();
    const finais = [...fonte.matchAll(/<b data-conta[^>]*>\s*([^<]+?)\s*<\/b>/g)].map((m) => m[1]);
    expect(finais.length).toBeGreaterThan(0);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveClass(/js-motion/);
    await expect(page.locator('.intro')).toBeHidden();
    await expect(page.locator('.log__estado')).toHaveText('concluído');
    await expect(page.locator('.f-proc')).toHaveText('1.000 / 1.000');
    await expect(page.locator('.f-dif')).toHaveText('R$ 0,00');
    await expect(page.locator('[data-log-reiniciar]')).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    const vistos = await page.locator('.nums b[data-conta]').allTextContents();
    expect(vistos.map((t) => t.trim())).toEqual(finais);
    const invisiveis = await page.evaluate(() =>
      [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && parseFloat(getComputedStyle(el).opacity) === 0;
        })
        .map((el) => `${el.tagName}.${el.className}`),
    );
    expect(invisiveis).toEqual([]);
  });
});

test.describe('índice no celular', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  test('a miniatura da carta aparece na linha', async ({ page }) => {
    await page.goto('/projetos', { waitUntil: 'networkidle' });
    const mini = page.locator('.indice a .mini').first();
    await mini.scrollIntoViewIfNeeded();
    await expect(mini).toBeVisible();
    expect((await mini.boundingBox())?.width ?? 0).toBeGreaterThan(30);
  });
});

test('índice no desktop: hover mostra a prévia', async ({ page }) => {
  await page.goto('/projetos', { waitUntil: 'networkidle' });
  const link = page.locator('.indice a[data-preview]').first();
  await link.scrollIntoViewIfNeeded();
  await expect(page.locator('.indice a .mini').first()).toBeHidden();
  const caixa = (await link.boundingBox())!;
  await page.mouse.move(caixa.x + 20, caixa.y + caixa.height / 2);
  await page.mouse.move(caixa.x + 60, caixa.y + caixa.height / 2, { steps: 5 });
  await expect(page.locator('.preview.vis')).toHaveCount(1);
});

test('índice → projeto mostra a capa com a carta e as métricas', async ({ page }) => {
  await page.goto('/projetos', { waitUntil: 'networkidle' });
  await page.locator('.indice a[href="/projetos/ledger-api"]').click();
  await page.waitForURL(/\/projetos\/ledger-api\/?$/);
  await expect(page.locator('h1')).toHaveText('Ledger API');
  await expect(page.locator('.proj__capa img')).toBeVisible();
  await expect(page.locator('.proj__dados .nums b').first()).toBeVisible();
});

test('/plataforma: SVG com role="img", <title>, <desc> e descrição em texto', async ({ page }) => {
  await page.goto('/plataforma', { waitUntil: 'networkidle' });
  const svg = page.locator('svg[role="img"]').first();
  await expect(svg).toBeVisible();
  expect(await svg.locator('title').textContent()).toMatch(/\S/);
  expect(await svg.locator('desc').textContent()).toMatch(/\S/);
  const texto = page.locator('details.diagrama__texto');
  await expect(texto).toHaveAttribute('open', '');
  await expect(texto.locator('li').first()).toBeVisible();
});

test('home: índice em dois grupos (Plataforma bancária e Comércio exterior), por numeral', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const bancos = page.locator('[data-grupo="grupo-bancos"]');
  const comex = page.locator('[data-grupo="grupo-comex"]');
  await expect(bancos.locator('h3')).toHaveText('Plataforma bancária');
  await expect(comex.locator('h3')).toHaveText('Comércio exterior');
  const numerais = async (g: typeof bancos) => (await g.locator('.indice .n').allTextContents()).map((t) => t.trim());
  expect(await numerais(bancos)).toEqual(['I', 'II', 'III', 'IV', 'V', 'XI']);
  expect(await numerais(comex)).toEqual(['VI', 'VII', 'IX', 'X']);
});

for (const slug of ['rastreador-importacao', 'despachante-digital', 'landed', 'monitor-cambio', 'robo-fechamento']) {
  test(`projeto novo ${slug}: abre com métricas`, async ({ page }) => {
    const r = await page.goto(`/projetos/${slug}`, { waitUntil: 'networkidle' });
    expect(r?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.proj__dados .nums b').first()).toBeVisible();
  });
}

test('/plataforma: o diagrama inclui o Robô de Fechamento (XI)', async ({ page }) => {
  await page.goto('/plataforma', { waitUntil: 'networkidle' });
  expect(await page.locator('svg[role="img"] desc').first().textContent()).toContain('Robô de Fechamento');
  await expect(page.locator('details.diagrama__texto')).toContainText('Robô de Fechamento Diário');
});

test('O Louco no Sobre abre o resumo do GitHub e Esc fecha', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const louco = page.locator('#sobre button[data-abre-dialogo]');
  await louco.scrollIntoViewIfNeeded();
  await expect(louco).toHaveAttribute('aria-haspopup', 'dialog');
  await louco.click();
  const dialogo = page.locator('dialog[data-dialogo-louco]');
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole('link', { name: /Abrir o GitHub/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
});
