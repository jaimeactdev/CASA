import { expect, test } from '@playwright/test';
import { E2E_USER, gotoApp, mockSessionApi, openWithSession } from './helpers/session';

test.describe('Session (user journey)', () => {
  test('without a session, /home redirects to login', async ({ page }) => {
    await mockSessionApi(page);
    await gotoApp(page, '/home');
    await expect(page).toHaveURL(/\/login\/?$/);
  });

  test('with a mocked session, home loads', async ({ page }) => {
    await openWithSession(page, '/home');
    await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByText(/Hola, Usuario E2E/)).toBeVisible();
    await expect(page).toHaveURL(/\/home\/?$/);
  });

  test('reload keeps home when the session is mocked', async ({ page }) => {
    await openWithSession(page, '/home');
    await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByText(/Hola, Usuario E2E/)).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByText(/Hola, Usuario E2E/)).toBeVisible();
    await expect(page).toHaveURL(/\/home\/?$/);
  });

  test('logout returns to login and /home stays protected', async ({ page }) => {
    await openWithSession(page, '/home');
    await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByText(/Hola, Usuario E2E/)).toBeVisible();

    await page.getByText(E2E_USER.name, { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();

    await page.addInitScript(() => {
      localStorage.removeItem('user');
    });
    await gotoApp(page, '/home');
    await expect(page).toHaveURL(/\/login\/?$/);
  });
});
