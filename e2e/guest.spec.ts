import { expect, test } from '@playwright/test';
import { gotoApp, stubExternalNetwork } from './helpers/session';

test.describe('Guest navigation', () => {
  test('home and other template routes are reachable without a session', async ({
    page,
  }) => {
    await stubExternalNetwork(page);
    await gotoApp(page, '/home');
    await expect(page).toHaveURL(/\/home\/?$/);
    await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible();

    await gotoApp(page, '/form');
    await expect(page).toHaveURL(/\/form\/?$/);
    await expect(
      page.getByRole('heading', { name: 'Formulario de ejemplo' }),
    ).toBeVisible();
  });

  test('the sample form uses the shared UI kit', async ({ page }) => {
    await stubExternalNetwork(page);
    await gotoApp(page, '/form');
    await expect(page).toHaveURL(/\/form\/?$/);
    await expect(
      page.getByRole('heading', { name: 'Formulario de ejemplo' }),
    ).toBeVisible();
    await expect(page.getByLabel('Nombre')).toBeVisible();
    await expect(page.getByLabel('Documento')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible();

    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
  });
});
