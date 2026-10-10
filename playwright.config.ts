import { defineConfig, devices } from '@playwright/test';

const E2E_PORT = 4201;
const E2E_ORIGIN = `http://127.0.0.1:${E2E_PORT}`;

/** The app session is mocked in the specs (see e2e/helpers/session.ts). */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: E2E_ORIGIN,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npx next build && npx next start -p ${E2E_PORT}`,
    url: E2E_ORIGIN,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_NAME: 'CASA',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
