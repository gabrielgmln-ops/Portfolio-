import { expect, test, type Page } from '@playwright/test';
import { rotasDoDist } from './rotas';

const rotas = rotasDoDist();

/** Coleta erros/avisos de console, exceções e violações de CSP. */
async function vigiar(page: Page): Promise<string[]> {
  const erros: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') erros.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => erros.push(`[pageerror] ${e.message}`));
  await page.exposeFunction('__csp', (v: string) => erros.push(`[csp] ${v}`));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __csp: (v: string) => void }).__csp(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return erros;
}

test('o dist tem ao menos a rota /', () => {
  expect(rotas).toContain('/');
});

for (const rota of rotas) {
  test(`rota ${rota} responde 200, sem erro de console nem violação de CSP`, async ({ page }) => {
    const erros = await vigiar(page);
    const r = await page.goto(rota, { waitUntil: 'networkidle' });
    expect(r?.status()).toBe(200);
    expect(r?.headers()['content-security-policy']).toContain("script-src 'self'");
    expect(erros).toEqual([]);
  });
}

test('rota inexistente responde 404 com a página 404', async ({ page }) => {
  const erros = await vigiar(page);
  const r = await page.goto('/rota-que-nao-existe-123', { waitUntil: 'networkidle' });
  expect(r?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  // O próprio 404 do documento gera um erro de console de rede; ignoramos só esse.
  expect(erros.filter((e) => !e.includes('404'))).toEqual([]);
});

test('nenhum link interno quebrado', async ({ page, request }) => {
  const vistos = new Set<string>();
  for (const rota of rotas) {
    await page.goto(rota);
    const hrefs = await page.$$eval('a[href], link[href]', (els) =>
      els.map((e) => (e as HTMLAnchorElement).href).filter(Boolean),
    );
    const base = new URL(page.url()).origin;
    for (const h of hrefs) {
      const u = new URL(h);
      if (u.origin !== base) continue;
      vistos.add(u.pathname + u.search);
    }
  }
  const quebrados: string[] = [];
  for (const p of vistos) {
    const r = await request.get(p);
    if (r.status() >= 400) quebrados.push(`${p} -> ${r.status()}`);
  }
  expect(quebrados).toEqual([]);
});

test.describe('com prefers-reduced-motion: reduce', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  for (const rota of rotas) {
    test(`rota ${rota} carrega`, async ({ page }) => {
      const erros = await vigiar(page);
      const r = await page.goto(rota, { waitUntil: 'networkidle' });
      expect(r?.status()).toBe(200);
      expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
      await expect(page.locator('body')).toBeVisible();
      expect(erros).toEqual([]);
    });
  }
});
