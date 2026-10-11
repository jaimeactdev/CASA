import { expect, test } from '@playwright/test';
import { gotoApp, stubExternalNetwork } from './helpers/session';

test.describe('Guest navigation', () => {
  test('the public page stays reachable without a session', async ({ page }) => {
    await stubExternalNetwork(page);
    await gotoApp(page, '/');
    await expect(page).toHaveURL(/\/$/);
  });

  test('the panel redirects to login without a session', async ({ page }) => {
    await stubExternalNetwork(page);
    await gotoApp(page, '/home');
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  });
});
