// ─────────────────────────────────────────────────────────────
//  TC-AUTH-04 · Apple Login
//  Tags: @auth @mobile
//  Priority: P0 (WebKit only)
//  Browsers: WebKit / iOS Safari
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';

// Must be top-level — browserName forces a new worker
test.use({ browserName: 'webkit' });

test.describe('Authentication — Apple Login', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ── TC-AUTH-04-01 ─────────────────────────────────────────
  test(
    'TC-AUTH-04-01 · Apple Login button is visible on login page',
    { tag: ['@auth', '@mobile'] },
    async ({ loginPage }) => {
      await expect(loginPage.appleLoginBtn()).toBeVisible();
    },
  );

  // ── TC-AUTH-04-02 ─────────────────────────────────────────
  test(
    'TC-AUTH-04-02 · Clicking Apple Login opens Apple ID consent page',
    { tag: ['@auth', '@mobile'] },
    async ({ loginPage, page }) => {
      const popupPromise = page.waitForEvent('popup', { timeout: 10_000 }).catch(() => null);
      await loginPage.appleLoginBtn().click();
      const popup = await popupPromise;

      if (popup) {
        await popup.waitForLoadState('domcontentloaded');
        expect(popup.url()).toMatch(/appleid\.apple\.com|apple\.com/);
        await popup.close();
      } else {
        await expect(page).toHaveURL(/apple\.com/);
      }
    },
  );

  // ── TC-AUTH-04-03 ─────────────────────────────────────────
  test(
    'TC-AUTH-04-03 · Full Apple Login flow (requires test Apple account)',
    { tag: ['@auth', '@mobile', '@p0'] },
    async ({ loginPage, dashboardPage }) => {
      test.skip(
        !process.env.APPLE_TEST_EMAIL,
        'Skipped: APPLE_TEST_EMAIL env var not set',
      );

      await loginPage.loginWithApple();

      await dashboardPage.assertDashboardLoaded();
      await expect(loginPage.$page).toHaveURL(/\/(dashboard|home|kyc|onboarding)/);
    },
  );
});
