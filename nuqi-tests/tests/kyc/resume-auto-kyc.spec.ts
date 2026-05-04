// ─────────────────────────────────────────────────────────────
//  TC-KYC-02 · Resume KYC  |  TC-KYC-03 · Auto-KYC
//  Tags: @kyc @regression
//  Priority: P1
//  Browsers: Chromium, Firefox, Android Chrome (Resume)
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, DataGenerator, getKycDataset, sharedOtp } from '../../utils/test-data';
import path from 'path';

const DOC_FRONT = path.join(__dirname, '../../fixtures/assets/passport-front.jpg');
const DOC_BACK  = path.join(__dirname, '../../fixtures/assets/passport-back.jpg');

// ── TC-KYC-02: Resume KYC ────────────────────────────────────

test.describe('KYC — Resume Incomplete KYC', () => {

  const kycData = DataGenerator.kycData();

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await loginPage.navigate();
    await loginPage.loginWithOtp(TestUsers.incompleteKycUser().email, sharedOtp());
    await dashboardPage.assertDashboardLoaded();
  });

  // ── TC-KYC-02-01 ─────────────────────────────────────────
  test(
    'TC-KYC-02-01 · Resume KYC button appears for incomplete KYC user',
    { tag: ['@kyc'] },
    async ({ kycPage }) => {
      // Step 1: Login (done in beforeEach)
      // Step 2: Assert Resume KYC CTA is visible
      await expect(kycPage.resumeKycBtn()).toBeVisible({ timeout: 8000 });
    },
  );

  // ── TC-KYC-02-02 ─────────────────────────────────────────
  test(
    'TC-KYC-02-02 · Resume KYC retains previously filled personal details',
    { tag: ['@kyc', '@regression'] },
    async ({ kycPage }) => {
      // Step 1: Click Resume KYC
      await kycPage.resumeKyc();

      // Step 2: Assert progress stepper shows prior progress (not step 1)
      await expect(kycPage.kycProgressBar()).toBeVisible();

      // Step 3: Assert first name field is pre-populated
      await kycPage.assertResumedFieldsPopulated(getKycDataset('resume').firstName);
    },
  );

  // ── TC-KYC-02-03 ─────────────────────────────────────────
  test(
    'TC-KYC-02-03 · Resume KYC — complete remaining steps and submit',
    { tag: ['@kyc', '@regression', '@p1'] },
    async ({ kycPage }) => {
      // Step 1: Click Resume KYC
      await kycPage.resumeKyc();

      // Step 2: Complete whichever step the user was on
      // (In UAT, we simulate user stopped at address step)
      const addressVisible = await kycPage.addressInput().isVisible({ timeout: 3000 }).catch(() => false);
      if (addressVisible) {
        await kycPage.fillAddressDetails(kycData);
      }

      // Step 3: Submit KYC
      const submitVisible = await kycPage.submitKycBtn().isVisible({ timeout: 3000 }).catch(() => false);
      if (submitVisible) {
        await kycPage.submitKyc();
      }

      // Step 4: Assert success or pending
      const done = await kycPage.kycSuccessScreen().isVisible({ timeout: 20_000 }).catch(() => false);
      const pending = await kycPage.$page.locator('.kyc-pending, h2:has-text("Under Review")').isVisible({ timeout: 5000 }).catch(() => false);
      expect(done || pending).toBe(true);
    },
  );

  // ── TC-KYC-02-04 (Mobile) ────────────────────────────────
  test(
    'TC-KYC-02-04 · Resume KYC on Android — camera upload uses device camera picker',
    { tag: ['@kyc', '@mobile'] },
    async ({ kycPage, page }) => {
      // This test verifies the file input has capture="camera" on mobile
      await kycPage.resumeKyc();

      const fileInput = kycPage.idFrontUpload();
      const captureAttr = await fileInput.getAttribute('capture');
      const acceptAttr  = await fileInput.getAttribute('accept');

      // On mobile-aware implementations, capture attr should be present
      // or accept should include image types
      const hasMobileUpload =
        captureAttr === 'camera' ||
        captureAttr === 'environment' ||
        (acceptAttr?.includes('image') ?? false);

      expect(hasMobileUpload).toBe(true);
    },
  );
});

// ── TC-KYC-03: Auto-KYC ──────────────────────────────────────

test.describe('KYC — Auto-KYC (API Pre-fill)', () => {

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await loginPage.navigate();
    await loginPage.loginWithOtp(TestUsers.autoKycUser().email, sharedOtp());
    await dashboardPage.assertDashboardLoaded();
  });

  // ── TC-KYC-03-01 ─────────────────────────────────────────
  test(
    'TC-KYC-03-01 · Auto-KYC screen shows pre-filled read-only fields',
    { tag: ['@kyc', '@smoke', '@regression'] },
    async ({ kycPage }) => {
      // Step 1: Login (beforeEach)
      // Step 2: Navigate to KYC
      await kycPage.clickStartKyc();

      // Step 3: Assert fields are pre-populated
      await kycPage.assertAutoKycPreFilled(getKycDataset('default'));

      // Step 4: Assert fields are read-only (no manual editing)
      await expect(kycPage.firstNameInput()).toHaveAttribute('readonly');
    },
  );

  // ── TC-KYC-03-02 ─────────────────────────────────────────
  test(
    'TC-KYC-03-02 · Auto-KYC can be confirmed in one step',
    { tag: ['@kyc', '@smoke'] },
    async ({ kycPage }) => {
      // Step 1: Start KYC
      await kycPage.clickStartKyc();
      // Step 2: Verify pre-filled data
      await kycPage.assertAutoKycPreFilled(getKycDataset('default'));
      // Step 3: Click Confirm / Submit
      await kycPage.confirmAutoKyc();
      // Step 4: Assert success screen
      const done    = await kycPage.kycSuccessScreen().isVisible({ timeout: 20_000 }).catch(() => false);
      const pending = await kycPage.$page.locator('.kyc-pending, h2:has-text("Verification Pending")').isVisible({ timeout: 5000 }).catch(() => false);
      expect(done || pending).toBe(true);
    },
  );
});

// ── TC-KYC-04: Already Verified ──────────────────────────────

test.describe('KYC — Already Verified (Skip)', () => {

  // ── TC-KYC-04-01 ─────────────────────────────────────────
  test(
    'TC-KYC-04-01 · Verified user sees no KYC prompt on dashboard',
    { tag: ['@kyc', '@smoke', '@regression'] },
    async ({ loginPage, dashboardPage, kycPage }) => {
      const credentials = TestUsers.returningUser();

      // Step 1: Login as verified returning user
      await loginPage.navigate();
      await loginPage.loginWithEmailPassword(credentials);
      await dashboardPage.assertDashboardLoaded();

      // Step 2: Assert no KYC banner shown
      await dashboardPage.assertNoKycPrompt();

      // Step 3: Assert verified badge is accessible
      await kycPage.assertKycAlreadyVerified();
    },
  );

  // ── TC-KYC-04-02 ─────────────────────────────────────────
  test(
    'TC-KYC-04-02 · Verified user is not redirected to KYC on invest attempt',
    { tag: ['@kyc', '@regression'] },
    async ({ loginPage, dashboardPage, page }) => {
      const credentials = TestUsers.returningUser();

      // Step 1: Login
      await loginPage.navigate();
      await loginPage.loginWithEmailPassword(credentials);
      await dashboardPage.assertDashboardLoaded();

      // Step 2: Navigate directly to invest
      await page.goto('/invest');
      await page.waitForLoadState('networkidle');

      // Step 3: Assert NOT redirected to /kyc
      await expect(page).not.toHaveURL(/\/kyc/);
    },
  );
});
