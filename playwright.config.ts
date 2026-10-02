import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  // Grep tags from the CLI, e.g. `npx playwright test --grep @smoke`
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // This machine's OS predates Playwright's bundled ffmpeg support, which
    // video recording requires even locally; CI runs on a supported OS.
    video: isCI ? 'retain-on-failure' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // This machine's OS predates Playwright's bundled Chromium support,
        // so local runs use the system Chrome install; CI runs the bundled
        // browser that Playwright installs on the runner.
        channel: isCI ? undefined : 'chrome',
      },
    },
  ],
});
