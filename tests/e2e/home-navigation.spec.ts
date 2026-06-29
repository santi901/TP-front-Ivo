import { test, expect } from '@playwright/test';

// Flujo de entrada: un visitante anónimo llega a la landing y desde el CTA
// principal puede ir a registrarse. Cubre que la home carga y que la
// navegación del hero funciona end-to-end.
test('un visitante puede ir desde la home al registro con el CTA principal', async ({
  page,
}) => {
  await page.goto('/');

  // La landing muestra el título principal del producto.
  await expect(
    page.getByRole('heading', { name: /construí mejores hábitos/i }),
  ).toBeVisible();

  // El CTA del hero para visitantes lleva a /register.
  await page.getByRole('link', { name: /empezar gratis/i }).first().click();

  await page.waitForURL('**/register');
  await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
});
