// Grava traces do DevTools (Chrome visível, com GPU) durante M1, M2 e M3 e resume quadros e tarefas.
// Uso: pnpm build; PORT=4400 node tests/e2e/servidor.mjs; node scripts/gravar-traces.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const base = 'http://127.0.0.1:4400';
const browser = await chromium.launch({
  headless: false,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
// Antivírus que injeta scripts no Chrome local atrapalha a medição.
await page.route(/kaspersky-labs/, (r) => r.abort());
const cats = [
  'devtools.timeline',
  'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame',
  'toplevel',
  'blink',
  'gpu',
  'viz',
];
async function gravar(nome, acao) {
  await browser.startTracing(page, { path: `qa/traces/${nome}.json`, categories: cats });
  await acao();
  await browser.stopTracing();
  const ev = JSON.parse(readFileSync(`qa/traces/${nome}.json`, 'utf8')).traceEvents ?? [];
  const pid = ev.find((e) => e.name === 'TracingStartedInBrowser')?.args?.data?.frames?.[0]?.processId;
  const tarefas = ev.filter(
    (e) =>
      e.ph === 'X' &&
      (e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask') &&
      (!pid || e.pid === pid) &&
      e.dur,
  );
  const longas = tarefas.filter((e) => e.dur > 16700);
  const quadros = ev
    .filter((e) => e.name === 'DrawFrame' || e.name === 'Graphics.Pipeline.DrawAndSwap')
    .map((e) => e.ts)
    .sort((a, b) => a - b);
  const dt = quadros
    .slice(1)
    .map((t, i) => (t - quadros[i]) / 1000)
    .filter((d) => d < 200);
  const gpu = ev.some((e) => e.name === 'GPUTask' || e.cat?.includes('gpu'));
  console.log(
    JSON.stringify({
      nome,
      tarefasMain: tarefas.length,
      maiorTarefaMs: +(Math.max(0, ...tarefas.map((e) => e.dur)) / 1000).toFixed(1),
      tarefasAcima16ms: longas.length,
      quadros: quadros.length,
      maiorIntervaloQuadroMs: dt.length ? +Math.max(...dt).toFixed(1) : null,
      quadrosAcima25ms: dt.filter((d) => d > 25).length,
      gpu,
    }),
  );
}
const gl = async () =>
  page.evaluate(() => {
    const c = document.createElement('canvas').getContext('webgl');
    const d = c?.getExtension('WEBGL_debug_renderer_info');
    return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'sem webgl';
  });
await page.goto(base + '/projetos', { waitUntil: 'load' });
console.log('GPU:', await gl());
const carta = page.locator('a[data-carta]').first();
const b = await carta.boundingBox();
await gravar('m3-inclinacao', async () => {
  for (let i = 0; i < 120; i++)
    await page.mouse.move(b.x + 10 + ((i * 7) % (b.width - 20)), b.y + 10 + ((i * 5) % (b.height - 20)));
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
});
await gravar('m2-virada', async () => {
  await page.evaluate(() => {
    const c = document.querySelectorAll('[data-carta-corpo]');
    c.forEach((el) =>
      el.animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(0deg)' }], {
        duration: 650,
        easing: 'cubic-bezier(0.19,1,0.22,1)',
      }),
    );
  });
  await page.waitForTimeout(900);
});
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate(() => sessionStorage.clear());
await page.reload({ waitUntil: 'load' });
await gravar('m1-distribuicao', async () => {
  await page.evaluate(() => document.querySelector('[data-tiragem]').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500);
});
await browser.close();
