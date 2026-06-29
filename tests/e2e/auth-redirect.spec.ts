import { test, expect } from '@playwright/test';

// Flujo crítico: protección de rutas privadas.
// El dashboard es una isla de React que, al montarse, pregunta a Supabase si hay
// sesión. Si no la hay, redirige al login. Este test valida ese comportamiento
// sin necesidad de credenciales reales (un visitante anónimo).
test('un usuario no autenticado es redirigido al login al entrar a /dashboard', async ({
  page,
}) => {
  await page.goto('/dashboard');

  // Esperamos a que el redirect del lado del cliente se complete.
  await page.waitForURL('**/login');
  await expect(page).toHaveURL(/\/login$/);

  // Y que efectivamente se vea el formulario de inicio de sesión.
  await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
});
