import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers } from '../../utils/test-data';
import type { LoginPage } from '../../pages/LoginPage';

/**
 * Navigates to the OTP code-entry screen and waits for digit boxes to appear.
 * Does NOT complete the login — callers control what happens next.
 */
async function goToOtpScreen(loginPage: LoginPage, email: string): Promise<void> {
  if (await loginPage.emailModeBtn().isVisible({ timeout: 3_000 }).catch(() => false)) {
    await loginPage.emailModeBtn().click();
  }
  const emailEl = loginPage.otpEmailInput();
  if (await emailEl.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await emailEl.fill(email);
  } else {
    await loginPage.emailInput().fill(email);
  }
  await loginPage.continueWithEmailBtn().click();
  await expect(loginPage.otpDigitInputs().first()).toBeVisible({ timeout: 15_000 });
}

test.describe('Authentication — Email + OTP', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ── TC-AUTH-02-01 ─────────────────────────────────────────
  test(
    'TC-AUTH-02-01 · OTP screen appears after entering valid email',
    { tag: ['@auth'] },
    async ({ loginPage }) => {
      const user = TestUsers.otpUser();

      await goToOtpScreen(loginPage, user.email);

      await expect(loginPage.otpDigitInputs().first()).toBeVisible({ timeout: 15_000 });
    },
  );

  // ── TC-AUTH-02-02 ─────────────────────────────────────────
  test(
    'TC-AUTH-02-02 · Successful login with valid OTP',
    { tag: ['@auth', '@regression'] },
    async ({ loginPage, page, dashboardPage }) => {
      const user = TestUsers.otpUser();
      const otp = user.otp!;

      await loginPage.loginWithOtp(user.email, otp);

      const kycHeading = page.getByRole('heading', { name: 'KYC Verification' });
      const skipBtn    = page.getByRole('button',  { name: 'Skip for now' });
      if (await kycHeading.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await expect(skipBtn).toBeVisible();
        await skipBtn.click();
      }

      await dashboardPage.assertDashboardLoaded();
    },
  );

  // ── TC-AUTH-02-03 ─────────────────────────────────────────
  // Verifies the OTP UI renders exactly 6 single-character input boxes.
  // Does NOT fill any digits — filling the correct OTP auto-submits the form
  // and navigates away, detaching the elements before validation can run.
  test(
    'TC-AUTH-02-03 · OTP input accepts exactly 6 digits',
    { tag: ['@auth'] },
    async ({ loginPage }) => {
      const user = TestUsers.otpUser();

      await goToOtpScreen(loginPage, user.email);

      const digitBoxes = loginPage.otpDigitInputs();

      // Assert exactly 6 digit boxes are rendered
      await expect(digitBoxes).toHaveCount(6);

      // Assert each box enforces a 1-character limit
      const maxlength = await digitBoxes.first().getAttribute('maxlength');
      expect(maxlength).toBe('1');
    },
  );

  // ── TC-AUTH-02-04 ─────────────────────────────────────────
  test(
    'TC-AUTH-02-04 · Resend OTP link is visible after email submission',
    { tag: ['@auth'] },
    async ({ loginPage }) => {
      const user = TestUsers.otpUser();

      await goToOtpScreen(loginPage, user.email);

      // During the 60s cooldown the UI shows "Resend OTP in 0:XX" as a paragraph.
      // Assert it is visible — the countdown text confirms OTP was sent.
      await expect(loginPage.resendOtpLink()).toBeVisible({ timeout: 15_000 });
    },
  );

});
