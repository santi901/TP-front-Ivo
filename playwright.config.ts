import { defineConfig, devices } from '@playwright/test';

// Configuración de los tests E2E.
// Playwright levanta el build de la app (astro build + preview) y prueba el
// flujo real en un navegador headless. En CI reutilizamos el servidor si ya está.
const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  // En CI fallamos si alguien dejó un test.only olvidado.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Antes de correr los tests, Playwright arranca la app y espera a que responda.
  webServer: {
    command: 'npm run preview -- --port ' + PORT,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
