import { expect, test } from '@playwright/test';
import { E2E_USER, gotoApp, mockSessionApi, stubExternalNetwork } from './helpers/session';

test.describe('Login', () => {
  test('shows the email and password form', async ({ page }) => {
    await stubExternalNetwork(page);
    await gotoApp(page, '/login');
    await expect(page.getByRole('heading', { name: /Bienvenido a/ })).toBeVisible();
    await expect(page.getByLabel('Correo')).toBeVisible();
    await expect(page.getByLabel('Clave')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  });

  test('validates the fields before calling the server', async ({ page }) => {
    await stubExternalNetwork(page);
    await gotoApp(page, '/login');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText('El correo es obligatorio.')).toBeVisible();
    await expect(page.getByText('La clave es obligatoria.')).toBeVisible();
  });

  test('signs in and lands on home', async ({ page }) => {
    await mockSessionApi(page);
    await gotoApp(page, '/login');
    await page.getByLabel('Correo').fill(E2E_USER.email);
    await page.getByLabel('Clave').fill('clave-de-prueba');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/home\/?$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Hola/ })).toBeVisible();
  });
});
