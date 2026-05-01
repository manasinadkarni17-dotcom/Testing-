// ─────────────────────────────────────────────────────────────
//  TC-AUTH-03 · Google OAuth
//  Tags: @auth @smoke
//  Priority: P0
//  Browsers: Chromium / WebKit
//  See apple-login.spec.ts for TC-AUTH-04 (WebKit-only)
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';

test.describe('Authentication — Google OAuth', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ── TC-AUTH-03-01 ─────────────────────────────────────────
  test(
    'TC-AUTH-03-01 · Google Login button is visible on login page',
    { tag: ['@auth', '@smoke'] },
    async ({ loginPage }) => {
      // Step 1: Navigate to /login
      // Step 2: Assert Google tab is visible; click it and assert the OAuth button appears
      await expect(loginPage.googleTabBtn()).toBeVisible();
      await loginPage.googleTabBtn().click();
      await expect(loginPage.googleLoginBtn()).toBeVisible();
    },
  );

  // ── TC-AUTH-03-02 ─────────────────────────────────────────
  test(
    'TC-AUTH-03-02 · Clicking Google Login opens OAuth consent popup',
    { tag: ['@auth'] },
    async ({ loginPage, page }) => {
      // Step 2: Switch to Google tab, then listen for the OAuth popup
      await loginPage.googleTabBtn().click();
      const popupPromise = page.waitForEvent('popup', { timeout: 10_000 }).catch(() => null);
      await loginPage.googleLoginBtn().click();
      const popup = await popupPromise;

      // Step 3: Assert popup opened with accounts.google.com domain
      if (popup) {
        await popup.waitForLoadState('domcontentloaded');
        expect(popup.url()).toMatch(/accounts\.google\.com|google\.com\/o\/oauth/);
        await popup.close();
      } else {
        // Some implementations redirect in the same tab
        await expect(page).toHaveURL(/google\.com|accounts\.google/);
      }
    },
  );

  // ── TC-AUTH-03-03 ─────────────────────────────────────────
  test(
    'TC-AUTH-03-03 · Full Google OAuth login flow (requires test Google account)',
    { tag: ['@auth', '@smoke', '@p0'] },
    async ({ loginPage, dashboardPage }) => {
      test.skip(
        !process.env.GOOGLE_TEST_EMAIL,
        'Skipped: GOOGLE_TEST_EMAIL env var not set',
      );

      // Step 1: Navigate to /login
      // Step 2: Click Google Login and handle OAuth popup
      await loginPage.loginWithGoogle();

      // Step 3: Assert successful redirect to dashboard
      await dashboardPage.assertDashboardLoaded();
      await expect(loginPage.$page).toHaveURL(/\/(dashboard|home|kyc|onboarding)/);
    },
  );
});

