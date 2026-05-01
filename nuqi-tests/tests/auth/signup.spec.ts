// ─────────────────────────────────────────────────────────────
// Authentication — Signup (STABLE E2E + UI SANITY)
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { sharedOtp, DataGenerator } from '../../utils/test-data';

test.describe('Authentication — Signup', () => {

  test.beforeEach(async ({ signupPage }) => {
    await signupPage.goto('/login');
    await signupPage.clickSignUpTab();
  });

  // ─────────────────────────────────────────────────────────────
  // UI SANITY
  // ─────────────────────────────────────────────────────────────

  test('TC-SIGNUP-01 · Email input and Continue button visible', async ({ signupPage }) => {
    await expect(signupPage.emailAddressInput).toBeVisible();
    await expect(signupPage.continueWithEmailButton).toBeVisible();
  });

  test('TC-SIGNUP-02 · Google button visible', async ({ signupPage }) => {
    await expect(signupPage.googleButton).toBeVisible({ timeout: 8000 });
  });

  test('TC-SIGNUP-03 · Apple button visible', async ({ signupPage }) => {
    await expect(signupPage.appleButton).toBeVisible({ timeout: 8000 });
  });

  // ─────────────────────────────────────────────────────────────
  // E2E FLOW (FIXED & STABLE)
  // ─────────────────────────────────────────────────────────────

  test('TC-SIGNUP-04 · Full signup flow', async ({ signupPage, dashboardPage }) => {
    test.setTimeout(90_000);

    const email            = DataGenerator.uniqueEmail('signup');
    const otp              = sharedOtp();
    const registrationData = DataGenerator.registrationData();

    await signupPage.submitEmailForSignup(email);

    await expect.poll(() => signupPage.isOTPScreenVisible()).toBeTruthy();

    await signupPage.fillOTP(otp);
    await signupPage.submitOTP();

    await signupPage.acceptAllTerms();

    await signupPage.fillRegistrationForm(registrationData);

    await signupPage.completeRegistration();
    
    await signupPage.waitForKYCPage();

    await signupPage.skipKYC();

    await dashboardPage.assertDashboardLoaded();
  });

  // ─────────────────────────────────────────────────────────────
  // OAUTH FLOW (FIXED POPUP STABILITY)
  // ─────────────────────────────────────────────────────────────

  test('TC-SIGNUP-05 · Google OAuth popup opens', async ({ page, signupPage }) => {
    const popup = await signupPage.continueWithGoogle(page);
    await expect(popup).toBeTruthy();
  });

  test('TC-SIGNUP-06 · Apple OAuth popup opens', async ({ page, signupPage }) => {
    const popup = await signupPage.continueWithApple(page);
    await expect(popup).toBeTruthy();
  });

});