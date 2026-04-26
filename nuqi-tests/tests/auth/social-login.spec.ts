// ─────────────────────────────────────────────────────────────
//  TC-AUTH-03/04 · Google OAuth + Apple Login
//  Tags: @auth @smoke (Google) | @auth @mobile (Apple)
//  Priority: P0 (Google) · P0 (Apple on WebKit)
//  Browsers: Chromium/WebKit (Google) · WebKit only (Apple)
//  Devices: Desktop + iOS Safari (Apple)
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
      // Step 2: Assert Google Login button is visible
      await expect(loginPage.googleLoginBtn()).toBeVisible();
    },
  );

  // ── TC-AUTH-03-02 ─────────────────────────────────────────
  test(
    'TC-AUTH-03-02 · Clicking Google Login opens OAuth consent popup',
    { tag: ['@auth'] },
    async ({ loginPage, page }) => {
      // Step 1: Navigate to /login
      // Step 2: Listen for popup before clicking
      const popupPromise = page.waitForEvent('popup', { timeout: 10_000 }).catch(() => null);
      await loginPage.googleLoginBtn().click();
      const popup = await popupPromise;

      // Step 3: Assert popup opened with accounts.google.com domain
      if (popup) {
        await popup.waitForLoadState('domcontentloaded');
        expect(popup.url()).toMatch(/accounts\.google\.com|google\.com\/o\/oauth/);
        await popup.close();
      } else {
        // Some implementations redirect in same tab
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

// ── Apple Login (WebKit / iOS only) ──────────────────────────

test.describe('Authentication — Apple Login', () => {

  test.use({
    // Apple login tests should ideally run only on WebKit
    browserName: 'webkit',
  });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ── TC-AUTH-04-01 ─────────────────────────────────────────
  test(
    'TC-AUTH-04-01 · Apple Login button is visible on login page',
    { tag: ['@auth', '@mobile'] },
    async ({ loginPage }) => {
      // Step 1: Navigate to /login
      // Step 2: Assert Apple Login button is visible
      await expect(loginPage.appleLoginBtn()).toBeVisible();
    },
  );

  // ── TC-AUTH-04-02 ─────────────────────────────────────────
  test(
    'TC-AUTH-04-02 · Clicking Apple Login opens Apple ID consent page',
    { tag: ['@auth', '@mobile'] },
    async ({ loginPage, page }) => {
      // Step 1: Navigate to /login
      // Step 2: Listen for popup before clicking
      const popupPromise = page.waitForEvent('popup', { timeout: 10_000 }).catch(() => null);
      await loginPage.appleLoginBtn().click();
      const popup = await popupPromise;

      // Step 3: Assert popup URL is Apple's auth domain
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

      // Step 1: Navigate to /login
      // Step 2: Click Apple Login and handle consent popup
      await loginPage.loginWithApple();

      // Step 3: Assert redirect to dashboard
      await dashboardPage.assertDashboardLoaded();
      await expect(loginPage.$page).toHaveURL(/\/(dashboard|home|kyc|onboarding)/);
    },
  );
});
