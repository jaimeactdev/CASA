import type { Page, Route } from '@playwright/test';

export const E2E_USER = {
  id: 'user-e2e',
  name: 'Usuario E2E',
  email: 'e2e@test.local',
  rol: 'Operativo',
  permissions: ['members.view'],
};

/** Prevents Google Fonts from hanging the `load` event. */
export async function stubExternalNetwork(page: Page): Promise<void> {
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
}

/** Intercepts the session endpoints under /api/auth. */
export async function mockSessionApi(page: Page): Promise<void> {
  await stubExternalNetwork(page);

  const fulfill = async (route: Route, body: unknown, status = 200) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  };

  const context = page.context();
  await context.route(/\/api\/auth\/login/i, (route) => fulfill(route, E2E_USER));
  await context.route(/\/api\/auth\/me/i, (route) => fulfill(route, E2E_USER));
  await context.route(/\/api\/auth\/logout/i, (route) => fulfill(route, {}));
  await context.route(/\/api\/dashboard/i, (route) =>
    fulfill(route, {
      today: '2026-10-12',
      year: 2026,
      month: 10,
      minimumWage: 1_423_500,
      activeMembers: 3,
      activeMembersInArrears: 1,
      pendingFeesThisMonth: 2,
      overdueFees: 1,
      reminders: [],
    }),
  );
}

/** Hydrates the store before the app loads (same contract as `useUserStore`). */
export async function seedBrowserSession(page: Page): Promise<void> {
  await page.addInitScript((user) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('lastActivityTime', Date.now().toString());
  }, E2E_USER);
}

export async function gotoApp(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}

export async function openWithSession(page: Page, path: string): Promise<void> {
  await mockSessionApi(page);
  await seedBrowserSession(page);
  await gotoApp(page, path);
}
