import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, DataGenerator, sharedOtp } from '../../utils/test-data';

test.describe('KYC — Fresh Verification (New User)', () => {

  const kycData = DataGenerator.kycDataById('default');

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await loginPage.navigate();
    await loginPage.loginWithOtp(TestUsers.incompleteKycUser().email, sharedOtp());
    await dashboardPage.assertDashboardLoaded();
  });

  // ── TC-KYC-01-01 ─────────────────────────────────────────
  test(
    'TC-KYC-01-01 · KYC banner/prompt is visible for unverified user',
    { tag: ['@kyc'] },
    async ({ dashboardPage, kycPage }) => {
      await dashboardPage.assertKycPromptVisible();
      const verified = await kycPage.isAlreadyVerified();
      expect(verified).toBe(false);
    },
  );

  // ── TC-KYC-01-02 ─────────────────────────────────────────
  test(
    'TC-KYC-01-02 · First KYC step is visible after clicking Start',
    { tag: ['@kyc'] },
    async ({ kycPage }) => {
      await kycPage.clickStartKyc();
      // kycProgressBar falls back to the "Select Document Type" heading
      await expect(kycPage.kycProgressBar()).toBeVisible();
    },
  );

  // ── TC-KYC-01-03 ─────────────────────────────────────────
  // Step 1: Select document type → outer Proceed → Facia.ai iframe loads
  test(
    'TC-KYC-01-03 · Document type selection — select type and advance to verification',
    { tag: ['@kyc', '@regression'] },
    async ({ kycPage }) => {
      await kycPage.clickStartKyc();

      // Select Aadhar radio via its label (radio input is sr-only)
      await kycPage.idTypeLabel('aadhaar').click();

      // Proceed enables immediately after radio selection
      await expect(kycPage.nextBtn()).toBeEnabled({ timeout: 5_000 });
      await kycPage.nextBtn().click();

      // Outer app shows "Verification Tips" while Facia.ai iframe loads
      await expect(kycPage.verificationTipsHeading()).toBeVisible({ timeout: 10_000 });
    },
  );

  // ── TC-KYC-01-04 ─────────────────────────────────────────
  // Unique: KycData-driven combined flow via fillIdentityDocument().
  // Uses the kycData object (idType from test-data) to drive the full
  // automatable path in one helper call. Asserts the consent gate is
  // cleared — distinct from 01-04 (button state) and 01-05 (iframe load).
  test(
    'TC-KYC-01-04 · KYC flow reaches Facia.ai capture screen via fillIdentityDocument()',
    { tag: ['@kyc', '@p1'] },
    async ({ kycPage }) => {
      await kycPage.clickStartKyc();
      // fillIdentityDocument: selectDocumentType(kycData.idType) + acceptFaciaConsent()
      await kycPage.fillIdentityDocument(kycData);

      // Consent gate cleared — Facia.ai is in capture/ready state
      await expect(kycPage.faciaConsentCheckbox()).not.toBeVisible({ timeout: 8_000 });
    },
  );

  // ── TC-KYC-01-05 ─────────────────────────────────────────
  // After KYC is approved the verifiedBadge on /profile confirms the
  // KYC flag is true in the backend.  That flag is the gate that unlocks
  // risk profiling, so this test continues from the badge check all the
  // way to the risk profiling entry point to prove the path is open.
  test(
    'TC-KYC-01-05 · KYC verified badge on profile → risk profiling accessible',
    { tag: ['@kyc', '@regression'] },
    async ({ kycPage, riskPage, page }) => {

      // Step 1 — KYC verified badge visible on /profile (flag = true)
      await test.step('Assert KYC verified badge on /profile', async () => {
        await page.goto('/profile');
        await kycPage.waitForNavigation();
        await expect(kycPage.verifiedBadge()).toBeVisible({ timeout: 8_000 });
      });

      // Step 2 — Navigate to risk profiling via /profile/risk
      // If KYC flag is true the app must NOT redirect back to /kyc.
      await test.step('Navigate to /profile/risk — no KYC redirect', async () => {
        await page.goto('/profile/risk');
        await kycPage.waitForNavigation();
        await expect(page).not.toHaveURL(/\/kyc/, { timeout: 8_000 });
      });

      // Step 3 — Risk profiling entry point is reachable
      // Either the "Start Assessment" button or the first question is visible,
      // confirming the KYC gate was cleared and risk profiling is accessible.
      await test.step('Risk profiling entry point is accessible', async () => {
        const startVisible = await riskPage.startRiskBtn().isVisible({ timeout: 5_000 }).catch(() => false);
        const questionVisible = await riskPage.questionText().isVisible({ timeout: 3_000 }).catch(() => false);
        expect(startVisible || questionVisible).toBeTruthy();
      });
    },
  );
});
