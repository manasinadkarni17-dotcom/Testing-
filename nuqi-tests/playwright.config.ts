import { defineConfig, devices } from '@playwright/test';

/**
 * Nuqi Wealth Global — Playwright Configuration
 * UAT: https://uat.nuqiwealth.com/
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 2,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://uat.nuqiwealth.com',
    ignoreHTTPSErrors: true,
    launchOptions: {
      headless: !!process.env.CI,
      slowMo: process.env.CI ? 0 : 500,
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // ── Setup project (auth state pre-generation) ──────────────────────
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // ── Desktop Browsers ───────────────────────────────────────────────
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    // ── Mobile Browsers ────────────────────────────────────────────────
    // Only files matching *mobile* are run on these projects.
    // Web specs are excluded because the site serves an app-download landing
    // page to mobile user-agents instead of the web login form.
    {
      name: 'android-chrome',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
      testMatch: /.*mobile.*\.spec\.ts/,
    },
    {
      name: 'ios-safari',
      use: { ...devices['iPhone 14'] },
      dependencies: ['setup'],
      testMatch: /.*mobile.*\.spec\.ts/,
    },
  ],
});
