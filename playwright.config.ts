import { defineConfig, devices } from '@playwright/test';

const PORTA = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  use: { baseURL: `http://127.0.0.1:${PORTA}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Serve o dist/ já construído com os cabeçalhos do vercel.json (inclui a CSP).
  webServer: {
    command: 'node tests/e2e/servidor.mjs',
    url: `http://127.0.0.1:${PORTA}/`,
    reuseExistingServer: !process.env['CI'],
    env: { PORT: String(PORTA) },
  },
});
