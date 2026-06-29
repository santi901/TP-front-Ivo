/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// Configuración de Vitest para los tests UNITARIOS (lógica de negocio).
// Los tests E2E (Playwright) viven en tests/e2e y se corren aparte con `npm run test:e2e`.
export default defineConfig({
  test: {
    // jsdom nos da `window` y `localStorage`, que usa la capa de datos (src/lib/store.ts).
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Medimos cobertura solo sobre la lógica de negocio, no sobre UI/config.
      include: ['src/lib/store.ts'],
    },
  },
});
