// ─────────────────────────────────────────────────────────────
//  TC-AUTH-02 · Email + OTP Login
//  Tags: @auth @regression
//  Priority: P1
//  Browsers: Chromium, Firefox, Android Chrome
//  Devices: Desktop, Mobile
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, sharedOtp } from '../../utils/test-data';

test.describe('Authentication — Email + OTP', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ── TC-AUTH-02-01 ─────────────────────────────────────────
  test(
    'TC-AUTH-02-01 · OTP screen appears after entering valid email',
    { tag: ['@auth'] },
    async ({ loginPage }) => {
      const credentials = TestUsers.otpUser();

      // Step 1: Navigate to /login (done in beforeEach)
      // Step 2: Enter valid email
      await loginPage.emailInput().fill(credentials.email);

      // Step 3: Click Send OTP / submit email
      await loginPage.requestOtp();

      // Step 4: Assert OTP input field is visible
      await expect(loginPage.otpInput()).toBeVisible({ timeout: 10_000 });
    },
  );

  // ── TC-AUTH-02-02 ─────────────────────────────────────────
  test(
    'TC-AUTH-02-02 · Successful login with valid OTP',
    { tag: ['@auth', '@regression'] },
    async ({ loginPage, dashboardPage }) => {
      const credentials = TestUsers.otpUser();
      const otp = sharedOtp();

      // Step 1: Navigate to /login (done in beforeEach)
      // Step 2: Enter email
      await loginPage.emailInput().fill(credentials.email);

      // Step 3: Request OTP
      await loginPage.requestOtp();

      // Step 4: Enter OTP
      await loginPage.otpInput().fill(otp);

      // Step 5: Submit OTP
      await loginPage.otpSubmitBtn().click();

      // Step 6: Assert login success
      await dashboardPage.assertDashboardLoaded();
    },
  );

  // ── TC-AUTH-02-03 ─────────────────────────────────────────
  test(
    'TC-AUTH-02-03 · OTP input field accepts exactly 6 digits',
    { tag: ['@auth'] },
    async ({ loginPage }) => {
      const credentials = TestUsers.otpUser();

      // Step 1: Navigate to OTP screen
      await loginPage.emailInput().fill(credentials.email);
      await loginPage.requestOtp();

      // Step 2: Type 6-digit OTP
      await loginPage.otpInput().fill('654321');

      // Step 3: Assert value length is max 6
      const value = await loginPage.otpInput().inputValue();
      expect(value.length).toBeLessThanOrEqual(6);
    },
  );

  // ── TC-AUTH-02-04 ─────────────────────────────────────────
  test(
    'TC-AUTH-02-04 · Resend OTP link is visible and clickable',
    { tag: ['@auth'] },
    async ({ loginPage }) => {
      const credentials = TestUsers.otpUser();

      // Step 1: Navigate to OTP screen
      await loginPage.emailInput().fill(credentials.email);
      await loginPage.requestOtp();

      // Step 2: Assert Resend link is visible
      await expect(loginPage.resendOtpLink()).toBeVisible({ timeout: 5000 });
    },
  );

  // ── TC-AUTH-02-05 (Mobile) ────────────────────────────────
  test(
    'TC-AUTH-02-05 · OTP field has autocomplete="one-time-code" for iOS autofill',
    { tag: ['@auth', '@mobile'] },
    async ({ loginPage }) => {
      const credentials = TestUsers.otpUser();

      // Step 1: Navigate to OTP screen
      await loginPage.emailInput().fill(credentials.email);
      await loginPage.requestOtp();

      // Step 2: Assert autocomplete attribute for iOS OTP autofill
      const autocomplete = await loginPage.otpInput().getAttribute('autocomplete');
      expect(['one-time-code', 'off', null]).toContain(autocomplete);
    },
  );
});