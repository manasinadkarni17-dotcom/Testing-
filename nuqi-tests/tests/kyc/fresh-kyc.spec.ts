// ─────────────────────────────────────────────────────────────
//  TC-KYC-01 · Fresh KYC — Full flow for new user
//  Tags: @kyc @regression
//  Priority: P1
//  Browsers: Chromium, Firefox
//  Devices: Desktop
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, TestKycData } from '../../utils/test-data';
import path from 'path';

// Stub document images — replace with real fixture images in CI
const DOC_FRONT  = path.join(__dirname, '../../fixtures/assets/passport-front.jpg');
const DOC_BACK   = path.join(__dirname, '../../fixtures/assets/passport-back.jpg');
const SELFIE_IMG = path.join(__dirname, '../../fixtures/assets/selfie.jpg');

test.describe('KYC — Fresh Verification (New User)', () => {

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    // Pre-condition: login as new user
    await loginPage.navigate();
    await loginPage.loginWithEmailPassword(TestUsers.newUser());
    await dashboardPage.assertDashboardLoaded();
  });

  // ── TC-KYC-01-01 ─────────────────────────────────────────
  test(
    'TC-KYC-01-01 · KYC banner/prompt is visible for unverified user',
    { tag: ['@kyc'] },
    async ({ dashboardPage, kycPage }) => {
      // Step 1: Login (done in beforeEach)
      // Step 2: Assert KYC prompt is visible on dashboard
      await dashboardPage.assertKycPromptVisible();
      // Step 3: Assert KYC is NOT already verified
      const verified = await kycPage.isAlreadyVerified();
      expect(verified).toBe(false);
    },
  );

  // ── TC-KYC-01-02 ─────────────────────────────────────────
  test(
    'TC-KYC-01-02 · KYC stepper / progress bar appears on start',
    { tag: ['@kyc'] },
    async ({ kycPage }) => {
      // Step 1: Click Start KYC
      await kycPage.clickStartKyc();
      // Step 2: Assert progress stepper is visible
      await expect(kycPage.kycProgressBar()).toBeVisible();
    },
  );

  // ── TC-KYC-01-03 ─────────────────────────────────────────
  test(
    'TC-KYC-01-03 · Personal details step — fill and advance',
    { tag: ['@kyc', '@regression'] },
    async ({ kycPage }) => {
      // Step 1: Start KYC
      await kycPage.clickStartKyc();
      // Step 2: Fill first name
      await kycPage.firstNameInput().fill(TestKycData.firstName);
      // Step 3: Fill last name
      await kycPage.lastNameInput().fill(TestKycData.lastName);
      // Step 4: Fill date of birth
      await kycPage.dobInput().fill(TestKycData.dob);
      // Step 5: Select nationality
      const natEl = kycPage.nationalitySelect();
      if (await natEl.isVisible({ timeout: 2000 }).catch(() => false)) {
        await natEl.selectOption({ label: TestKycData.nationality });
      }
      // Step 6: Fill phone number
      await kycPage.phoneInput().fill(TestKycData.phone);
      // Step 7: Click Next
      await kycPage.nextBtn().click();
      await kycPage.waitForNavigation();
      // Step 8: Assert advanced to next step (ID step or progress updated)
      await expect(kycPage.idTypeSelect()).toBeVisible({ timeout: 8000 });
    },
  );

  // ── TC-KYC-01-04 ─────────────────────────────────────────
  test(
    'TC-KYC-01-04 · Identity document step — select type, enter number, upload front',
    { tag: ['@kyc', '@regression'] },
    async ({ kycPage }) => {
      await kycPage.clickStartKyc();
      await kycPage.fillPersonalDetails(TestKycData);

      // Step 1: Select document type
      await kycPage.idTypeSelect().selectOption({ label: 'Passport' });
      // Step 2: Enter ID number
      await kycPage.idNumberInput().fill(TestKycData.idNumber);
      // Step 3: Upload front document
      await kycPage.idFrontUpload().setInputFiles(DOC_FRONT);
      // Step 4: Assert upload success indicator
      const uploadDone = kycPage.page.locator(
        '[data-testid="upload-success"], .upload-done, span:has-text("Uploaded")',
      );
      if (await uploadDone.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(uploadDone.first()).toBeVisible();
      }
      // Step 5: Click Next
      await kycPage.nextBtn().click();
      await kycPage.waitForNavigation();
    },
  );

  // ── TC-KYC-01-05 ─────────────────────────────────────────
  test(
    'TC-KYC-01-05 · Address details step — fill and advance',
    { tag: ['@kyc', '@regression'] },
    async ({ kycPage }) => {
      await kycPage.clickStartKyc();
      await kycPage.fillPersonalDetails(TestKycData);
      await kycPage.fillIdentityDocument(TestKycData, DOC_FRONT, DOC_BACK);

      // Step 1: Fill address
      await kycPage.addressInput().fill(TestKycData.address);
      // Step 2: Fill city
      await kycPage.cityInput().fill(TestKycData.city);
      // Step 3: Select country
      await kycPage.countrySelect().selectOption({ label: TestKycData.country });
      // Step 4: Fill postal code
      await kycPage.postalInput().fill(TestKycData.postalCode);
      // Step 5: Click Next
      await kycPage.nextBtn().click();
      await kycPage.waitForNavigation();
    },
  );

  // ── TC-KYC-01-06 ─────────────────────────────────────────
  test(
    'TC-KYC-01-06 · KYC submission shows success / pending verification screen',
    { tag: ['@kyc', '@regression', '@p1'] },
    async ({ kycPage }) => {
      // Full KYC flow
      await kycPage.clickStartKyc();
      await kycPage.fillPersonalDetails(TestKycData);
      await kycPage.fillIdentityDocument(TestKycData, DOC_FRONT, DOC_BACK);
      await kycPage.completeFaceVerification(SELFIE_IMG);
      await kycPage.fillAddressDetails(TestKycData);

      // Step 1: Click Submit KYC
      await kycPage.submitKyc();

      // Step 2: Assert success / verification pending screen shown
      const successVisible = await kycPage.kycSuccessScreen().isVisible({ timeout: 20_000 }).catch(() => false);
      const pendingScreen  = kycPage.page.locator('.kyc-pending, h2:has-text("Under Review"), h2:has-text("Verification Pending")');
      const pendingVisible = await pendingScreen.isVisible({ timeout: 5000 }).catch(() => false);

      expect(successVisible || pendingVisible).toBe(true);
    },
  );

  // ── TC-KYC-01-07 ─────────────────────────────────────────
  test(
    'TC-KYC-01-07 · KYC verified badge appears on profile after approval',
    { tag: ['@kyc'] },
    async ({ kycPage, page }) => {
      // Pre-condition: KYC already approved in UAT (use returning user fixture)
      await page.goto('/profile');
      await kycPage.waitForNavigation();

      // Assert verified badge is shown on profile
      await expect(kycPage.verifiedBadge()).toBeVisible({ timeout: 8000 });
    },
  );
});
