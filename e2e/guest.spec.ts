import { expect, test } from '@playwright/test';
import { gotoApp, stubExternalNetwork } from './helpers/session';

test.describe('Guest navigation', () => {
  test('the public page stays reachable without a session', async ({ page }) => {
    await stubExternalNetwork(page);
    await page.route('**/api/public/site', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'Círculo de Apoyo y Servicios para Afiliados',
          acronym: 'CASA',
          serviceCity: 'Medellín',
          phone: null,
          contactEmail: null,
          address: null,
          openingHours: null,
          benefits: [{ id: 'b1', name: 'Aguinaldo', publicText: 'Aguinaldo de fin de año.' }],
        }),
      }),
    );
    await gotoApp(page, '/');
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Círculo de Apoyo y Servicios para Afiliados' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ingreso del personal' })).toBeVisible();
    await expect(page.getByText('Aguinaldo de fin de año.')).toBeVisible();
    await expect(page.getByText('Auxilio por cambio de fórmula de lentes')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Contacto' })).toHaveCount(0);
  });

  test('the panel redirects to login without a session', async ({ page }) => {
    await stubExternalNetwork(page);
    await gotoApp(page, '/home');
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  });
});
