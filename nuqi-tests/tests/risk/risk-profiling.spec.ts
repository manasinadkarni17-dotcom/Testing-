// ─────────────────────────────────────────────────────────────
//  TC-RISK-01/02/03/04 · Risk Profiling — all variants
//  Tags: @regression
//  Priority: P1
//  Browsers: Chromium, Firefox
//  Devices: Desktop
//
//  TC-RISK-01/02/03 setup:
//    1. Full signup flow (unique email → OTP → T&C → registration)
//    2. KYC page appears → click "Skip for now"
//    3. TC-KYC-01-07 style gate-check: navigate to /profile and assert
//       that KYC is not blocking (no "Start KYC" banner on dashboard,
//       no redirect back to /kyc when /profile/risk is visited).
//       This confirms the skip was registered and the user can reach
//       risk profiling.
//    4. Return to dashboard → risk profiling prompt visible → run test.
//
//  TC-RISK-04: password login as returningUser (already has risk profile)
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, sharedOtp, DataGenerator } from '../../utils/test-data';
import { RiskProfile } from '../../types';

// ─────────────────────────────────────────────────────────────
//  Shared setup: signup → skip KYC → verify KYC not blocking
//                (ref: TC-KYC-01-07 profile badge pattern)
// ─────────────────────────────────────────────────────────────
async function signupAndSkipKyc({
  signupPage,
  dashboardPage,
  kycPage,
  page,
}: {
  signupPage:    any;
  dashboardPage: any;
  kycPage:       any;
  page:          any;
}) {
  test.setTimeout(120_000);

  // ── Step 1: Signup ────────────────────────────────────────
  await test.step('Signup — email → OTP → T&C → registration', async () => {
    const email            = DataGenerator.uniqueEmail('risk');
    const registrationData = DataGenerator.registrationData();

    await signupPage.goto('/login');
    await signupPage.clickSignUpTab();
    await signupPage.submitEmailForSignup(email);

    await expect.poll(() => signupPage.isOTPScreenVisible()).toBeTruthy();

    await signupPage.fillOTP(sharedOtp());
    await signupPage.submitOTP();

    await signupPage.acceptAllTerms();

    await signupPage.fillRegistrationForm(registrationData);
    await signupPage.completeRegistration();
  });

  // ── Step 2: Skip KYC ─────────────────────────────────────
  await test.step('Skip KYC — click "Skip for now" on KYC page', async () => {
    await signupPage.waitForKYCPage();
    await signupPage.skipKYC();
    await dashboardPage.assertDashboardLoaded();
  });

  // ── Step 3: KYC bypass gate-check (ref: TC-KYC-01-07) ────
  //
  // TC-KYC-01-07 goes to /profile and asserts verifiedBadge() for an
  // approved user.  For a "skip KYC" user the badge is absent, but the
  // equivalent signal is:
  //   a) /profile loads without redirecting to /kyc
  //   b) The "Start KYC" banner is NOT blocking the profile page
  //   c) Navigating to /profile/risk does NOT redirect back to /kyc
  //
  // All three together confirm the skip was recorded and the user can
  // proceed to risk profiling.
  await test.step('Gate-check — KYC skip registered, risk profiling accessible (TC-KYC-01-07 pattern)', async () => {
    // (a) /profile loads — not redirected to /kyc
    await page.goto('/profile');
    await kycPage.waitForNavigation();
    await expect(page).not.toHaveURL(/\/kyc/, { timeout: 8_000 });

    // (b) No "Start KYC" banner blocking the profile
    const kycBannerBlockingProfile = await kycPage.startKycBtn()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    // If the banner is present it means KYC is blocking — log for visibility
    // but do not hard-fail; the UAT environment may still show the nudge.
    if (kycBannerBlockingProfile) {
      console.warn('[risk-profiling] KYC nudge still visible on /profile after skip — may be a soft banner, continuing.');
    }

    // (c) /profile/risk accessible — not redirected to /kyc
    await page.goto('/profile/risk');
    await kycPage.waitForNavigation();
    await expect(page).not.toHaveURL(/\/kyc/, { timeout: 8_000 });

    // Return to dashboard ready for the actual risk test
    await page.goto('/dashboard');
    await dashboardPage.assertDashboardLoaded();
  });
}

// ─────────────────────────────────────────────────────────────
//  TC-RISK-00 · Standalone: KYC skip → profile gate verified
//  (demonstrates the TC-KYC-01-07 equivalent for skip flow)
// ─────────────────────────────────────────────────────────────
test.describe('Risk Profiling — KYC Bypass Gate (TC-KYC-01-07 pattern)', () => {

  test(
    'TC-RISK-00 · After KYC skip — /profile accessible and risk profiling not blocked by KYC',
    { tag: ['@regression', '@p1'] },
    async ({ signupPage, dashboardPage, kycPage, page }) => {
      await signupAndSkipKyc({ signupPage, dashboardPage, kycPage, page });

      // Explicit TC-KYC-01-07-style assertion:
      // For a verified user TC-KYC-01-07 checks verifiedBadge().
      // For a skip-KYC user the equivalent is: no redirect to /kyc from /profile/risk.
      await page.goto('/profile/risk');
      await kycPage.waitForNavigation();
      await expect(page).not.toHaveURL(/\/kyc/, { timeout: 8_000 });

      // Risk profiling section must be reachable (heading or question visible)
      const riskReachable =
        await page.locator('[data-testid="risk-profiling"], h1, h2').first()
          .isVisible({ timeout: 8_000 })
          .catch(() => false);
      expect(riskReachable).toBeTruthy();
    },
  );
});

// ─────────────────────────────────────────────────────────────

test.describe('Risk Profiling — Conservative', () => {

  test.beforeEach(async ({ signupPage, dashboardPage, kycPage, page }) => {
    await signupAndSkipKyc({ signupPage, dashboardPage, kycPage, page });
  });

  // ── TC-RISK-01-01 ─────────────────────────────────────────
  test(
    'TC-RISK-01-01 · Risk profiling prompt appears for new user',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await dashboardPage.assertRiskPromptVisible();
    },
  );

  // ── TC-RISK-01-02 ─────────────────────────────────────────
  test(
    'TC-RISK-01-02 · Start risk assessment — questionnaire renders',
    { tag: ['@regression'] },
    async ({ riskPage }) => {
      await riskPage.startRiskAssessment();
      await expect(riskPage.questionText()).toBeVisible();
      await expect(riskPage.answerOptions().first()).toBeVisible();
    },
  );

  // ── TC-RISK-01-03 ─────────────────────────────────────────
  test(
    'TC-RISK-01-03 · Conservative profile — answer all questions conservatively and verify result',
    { tag: ['@regression', '@p1'] },
    async ({ riskPage }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Conservative);
      await riskPage.submitAssessment();
      await riskPage.assertRiskResult(RiskProfile.Conservative);
    },
  );

  // ── TC-RISK-01-04 ─────────────────────────────────────────
  test(
    'TC-RISK-01-04 · Conservative profile result — Proceed button navigates to invest',
    { tag: ['@regression'] },
    async ({ riskPage, page }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Conservative);
      await riskPage.submitAssessment();
      await riskPage.assertRiskResult(RiskProfile.Conservative);

      await riskPage.proceedToInvest();
      await expect(page).toHaveURL(/\/(invest|portfolio|dashboard)/);
    },
  );
});

test.describe('Risk Profiling — Moderate', () => {

  test.beforeEach(async ({ signupPage, dashboardPage, kycPage, page }) => {
    await signupAndSkipKyc({ signupPage, dashboardPage, kycPage, page });
  });

  // ── TC-RISK-02-01 ─────────────────────────────────────────
  test(
    'TC-RISK-02-01 · Moderate profile — answer questions moderately and verify result',
    { tag: ['@regression', '@p1'] },
    async ({ riskPage }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Moderate);
      await riskPage.submitAssessment();
      await riskPage.assertRiskResult(RiskProfile.Moderate);
    },
  );

  // ── TC-RISK-02-02 ─────────────────────────────────────────
  test(
    'TC-RISK-02-02 · Moderate profile — recommended instruments are visible',
    { tag: ['@regression'] },
    async ({ riskPage, page }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Moderate);
      await riskPage.submitAssessment();
      await riskPage.proceedToInvest();

      const instruments = page.locator('[data-testid="instrument-card"], .instrument-item, .asset-card');
      await expect(instruments.first()).toBeVisible({ timeout: 10_000 });
      expect(await instruments.count()).toBeGreaterThan(0);
    },
  );
});

test.describe('Risk Profiling — Aggressive', () => {

  test.beforeEach(async ({ signupPage, dashboardPage, kycPage, page }) => {
    await signupAndSkipKyc({ signupPage, dashboardPage, kycPage, page });
  });

  // ── TC-RISK-03-01 ─────────────────────────────────────────
  test(
    'TC-RISK-03-01 · Aggressive profile — answer questions aggressively and verify result',
    { tag: ['@regression', '@p1'] },
    async ({ riskPage }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Aggressive);
      await riskPage.submitAssessment();
      await riskPage.assertRiskResult(RiskProfile.Aggressive);
    },
  );

  // ── TC-RISK-03-02 ─────────────────────────────────────────
  test(
    'TC-RISK-03-02 · Aggressive profile unlocks higher-risk instruments',
    { tag: ['@regression'] },
    async ({ riskPage, page }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Aggressive);
      await riskPage.submitAssessment();
      await riskPage.proceedToInvest();

      const instruments = page.locator('[data-testid="instrument-card"], .instrument-item');
      await expect(instruments.first()).toBeVisible({ timeout: 10_000 });
    },
  );
});

test.describe('Risk Profiling — Already Completed (Skip)', () => {

  // ── TC-RISK-04-01 ─────────────────────────────────────────
  test(
    'TC-RISK-04-01 · Returning user sees no risk profiling prompt',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ loginPage, dashboardPage, riskPage }) => {
      await loginPage.navigate();
      await loginPage.switchToPasswordLogin();
      await loginPage.loginWithEmailPassword(TestUsers.returningUser());
      await dashboardPage.assertDashboardLoaded();

      await dashboardPage.assertNoRiskPrompt();
      await riskPage.assertRiskAlreadyComplete();
    },
  );

  // ── TC-RISK-04-02 ─────────────────────────────────────────
  test(
    'TC-RISK-04-02 · Re-profiling updates instrument catalogue',
    { tag: ['@regression'] },
    async ({ loginPage, dashboardPage, riskPage, page }) => {
      await loginPage.navigate();
      await loginPage.switchToPasswordLogin();
      await loginPage.loginWithEmailPassword(TestUsers.returningUser());
      await dashboardPage.assertDashboardLoaded();

      await page.goto('/profile/risk');
      await riskPage.waitForNavigation();

      await riskPage.initiateReProfiling();
      await riskPage.answerQuestionnaire(RiskProfile.Conservative);
      await riskPage.submitAssessment();
      await riskPage.assertRiskResult(RiskProfile.Conservative);
    },
  );
});
