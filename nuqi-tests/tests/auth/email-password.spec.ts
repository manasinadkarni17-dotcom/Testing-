// ─────────────────────────────────────────────────────────────
//  TC-AUTH-01 · Email + Password Login
//  Tags: @smoke @auth
//  Priority: P0
//  Browsers: Chromium, Firefox, WebKit
//  Devices: Desktop
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers } from '../../utils/test-data';

test.describe('Authentication — Email + Password', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.switchToPasswordLogin();
  });

  // ── TC-AUTH-01-01 ─────────────────────────────────────────
  test(
    'TC-AUTH-01-01 · Login page renders all required elements',
    { tag: ['@smoke', '@auth'] },
    async ({ loginPage }) => {
      // Step 1: Navigate to /login
      // Step 2: Assert email input visible
    //  Step 3: Email input
    await expect(loginPage.emailInput()).toBeVisible();
    await expect(loginPage.emailInput()).toBeEditable();

    // Step 4: Password input
    await expect(loginPage.passwordInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toHaveAttribute('type', 'password');

    // Step 5: Login button
    await expect(loginPage.loginButton()).toBeVisible();

    // Step 6: Sign Up button
    await expect(loginPage.signUpLink()).toBeVisible();

    },
  );

  // ── TC-AUTH-01-02 ─────────────────────────────────────────
  test(
    'TC-AUTH-01-02 · Successful login with valid email and password',
    { tag: ['@smoke', '@auth', '@p0'] },
    async ({ loginPage, dashboardPage }) => {
      const credentials = TestUsers.returningUser();

      // Step 1: Navigate to /login
      // Step 2: Enter valid email
      await loginPage.emailInput().fill(credentials.email);
      // Step 3: Enter valid password
      await loginPage.passwordInput().fill(credentials.password);
      // Step 4: Assert Login button becomes enabled
      await expect(loginPage.loginButton()).toBeEnabled();
      // Step 5: Click Login
      await loginPage.loginButton().click();
      // Step 6: Returning user lands on root after login
      await dashboardPage.assertReturningUserLanded();
    },
  );

  // ── TC-AUTH-01-03 ─────────────────────────────────────────
  test(
    'TC-AUTH-01-03 · Password field masks input',
    { tag: ['@auth'] },
    async ({ loginPage }) => {
      // Step 1: Type into password field
      await loginPage.passwordInput().fill('MySecret123');
      // Step 2: Assert input type is password (masked)
      await expect(loginPage.passwordInput()).toHaveAttribute('type', 'password');
    },
  );

  // ── TC-AUTH-01-04 ─────────────────────────────────────────
  test(
    'TC-AUTH-01-04 · Session persists on page reload after login',
    { tag: ['@auth', '@regression'] },
    async ({ loginPage, dashboardPage, page }) => {
      const credentials = TestUsers.returningUser();

      // Step 1: Login
      await loginPage.loginWithEmailPassword(credentials);
       await dashboardPage.assertReturningUserLanded();
      const urlAfterLogin = page.url();

      // Step 2: Reload page
      await page.reload();
      await dashboardPage.assertReturningUserLanded();

      // Step 3: Assert still on authenticated page (not redirected to /login)
      await expect(page).not.toHaveURL(/\/login/);
      expect(page.url()).toBe(urlAfterLogin);
    },
  );

  // ── TC-AUTH-01-05 ─────────────────────────────────────────
  test(
    'TC-AUTH-01-05 · Logout clears session and redirects to login',
    { tag: ['@auth', '@regression'] },
    async ({ loginPage, dashboardPage, page }) => {
      const credentials = TestUsers.returningUser();

      // Step 1: Login
      await loginPage.loginWithEmailPassword(credentials);
      await dashboardPage.assertReturningUserLanded();

      // Step 2: Click logout and confirm
      await dashboardPage.logout();

      // Step 3: Assert redirected away from authenticated area
      await dashboardPage.assertLoggedOut();

      // Step 4: Assert protected route is not accessible
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/^https:\/\/uat\.nuqiwealth\.com\/(login)?$/);
    },
  );
});
