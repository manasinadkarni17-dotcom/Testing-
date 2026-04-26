// ─────────────────────────────────────────────────────────────
//  KycPage — Fresh · Resume · Auto · Already Verified
//  URL: https://uat.nuqiwealth.com/kyc
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { KycData } from '../types';

export class KycPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────
  readonly kycBanner          = () => this.page.locator('[data-testid="kyc-banner"], .kyc-prompt, section:has-text("Complete your KYC")').first();
  readonly startKycBtn        = () => this.page.locator('[data-testid="start-kyc"], button:has-text("Start KYC"), button:has-text("Complete KYC"), button:has-text("Verify Identity")').first();
  readonly resumeKycBtn       = () => this.page.locator('[data-testid="resume-kyc"], button:has-text("Resume"), button:has-text("Continue KYC")').first();
  readonly verifiedBadge      = () => this.page.locator('[data-testid="kyc-verified"], .verified-badge, span:has-text("Verified"), [aria-label="KYC Verified"]').first();
  readonly kycSkipIndicator   = () => this.page.locator('[data-testid="kyc-complete"], .kyc-complete').first();

  // Personal details step
  readonly firstNameInput     = () => this.page.locator('[data-testid="first-name"], input[name="firstName"], input[placeholder*="First"]').first();
  readonly lastNameInput      = () => this.page.locator('[data-testid="last-name"], input[name="lastName"], input[placeholder*="Last"]').first();
  readonly dobInput           = () => this.page.locator('[data-testid="dob"], input[name="dob"], input[type="date"], input[placeholder*="Date"]').first();
  readonly nationalitySelect  = () => this.page.locator('[data-testid="nationality"], select[name="nationality"], [aria-label="Nationality"]').first();
  readonly phoneInput         = () => this.page.locator('[data-testid="phone"], input[name="phone"], input[type="tel"]').first();

  // Identity document step
  readonly idTypeSelect       = () => this.page.locator('[data-testid="id-type"], select[name="idType"], [aria-label*="Document Type"]').first();
  readonly idNumberInput      = () => this.page.locator('[data-testid="id-number"], input[name="idNumber"], input[placeholder*="Number"]').first();
  readonly idFrontUpload      = () => this.page.locator('[data-testid="id-front-upload"], input[type="file"]').first();
  readonly idBackUpload       = () => this.page.locator('[data-testid="id-back-upload"], input[type="file"]').nth(1);
  readonly selfieUpload       = () => this.page.locator('[data-testid="selfie-upload"], input[type="file"]').nth(2);

  // Address step
  readonly addressInput       = () => this.page.locator('[data-testid="address"], input[name="address"], textarea[name="address"]').first();
  readonly cityInput          = () => this.page.locator('[data-testid="city"], input[name="city"]').first();
  readonly countrySelect      = () => this.page.locator('[data-testid="country"], select[name="country"]').first();
  readonly postalInput        = () => this.page.locator('[data-testid="postal"], input[name="postalCode"], input[name="zipCode"]').first();

  // Navigation buttons
  readonly nextBtn            = () => this.page.locator('[data-testid="kyc-next"], button:has-text("Next"), button:has-text("Continue")').first();
  readonly submitKycBtn       = () => this.page.locator('[data-testid="kyc-submit"], button:has-text("Submit"), button:has-text("Confirm")').first();
  readonly kycProgressBar     = () => this.page.locator('[data-testid="kyc-progress"], .kyc-stepper, [role="progressbar"]').first();
  readonly kycSuccessScreen   = () => this.page.locator('[data-testid="kyc-success"], h2:has-text("Verified"), h1:has-text("KYC Complete"), .kyc-success').first();
  readonly faceIdModal        = () => this.page.locator('[data-testid="face-id-modal"], .face-verification, div:has-text("Face Verification")').first();

  constructor(page: Page) {
    super(page);
  }

  // ── KYC VARIANT: Check status ─────────────────────────────

  /**
   * TC-KYC-00
   * Returns whether KYC is already verified (skip KYC flows).
   */
  async isAlreadyVerified(): Promise<boolean> {
    return this.verifiedBadge().isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Returns whether a Resume KYC prompt is shown (incomplete KYC).
   */
  async hasIncompleteKyc(): Promise<boolean> {
    return this.resumeKycBtn().isVisible({ timeout: 3000 }).catch(() => false);
  }

  // ── KYC VARIANT A: Fresh KYC ──────────────────────────────

  /**
   * TC-KYC-01 Step 1 — Click Start KYC
   */
  async clickStartKyc(): Promise<void> {
    await expect(this.startKycBtn()).toBeVisible();
    await this.startKycBtn().click();
    await this.waitForNavigation();
  }

  /**
   * TC-KYC-01 Step 2 — Fill personal details
   */
  async fillPersonalDetails(data: KycData): Promise<void> {
    await this.firstNameInput().fill(data.firstName);
    await this.lastNameInput().fill(data.lastName);
    await this.dobInput().fill(data.dob);
    const natEl = this.nationalitySelect();
    if (await natEl.isVisible()) await natEl.selectOption({ label: data.nationality });
    await this.phoneInput().fill(data.phone);
    await this.nextBtn().click();
    await this.waitForNavigation();
  }

  /**
   * TC-KYC-01 Step 3 — Fill identity document details
   */
  async fillIdentityDocument(data: KycData, docFrontPath: string, docBackPath: string): Promise<void> {
    await this.idTypeSelect().selectOption({ label: data.idType });
    await this.idNumberInput().fill(data.idNumber);
    // Upload front image
    await this.idFrontUpload().setInputFiles(docFrontPath);
    // Upload back image (if applicable)
    const backUpload = this.idBackUpload();
    if (await backUpload.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backUpload.setInputFiles(docBackPath);
    }
    await this.nextBtn().click();
    await this.waitForNavigation();
  }

  /**
   * TC-KYC-01 Step 4 — Handle face/selfie verification (Facia.ai)
   */
  async completeFaceVerification(selfiePath: string): Promise<void> {
    // Platform uses Facia.ai partner — upload selfie image in UAT
    const selfie = this.selfieUpload();
    if (await selfie.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selfie.setInputFiles(selfiePath);
    }
    await this.nextBtn().click();
    await this.waitForNavigation();
  }

  /**
   * TC-KYC-01 Step 5 — Fill address details
   */
  async fillAddressDetails(data: KycData): Promise<void> {
    await this.addressInput().fill(data.address);
    await this.cityInput().fill(data.city);
    await this.countrySelect().selectOption({ label: data.country });
    await this.postalInput().fill(data.postalCode);
    await this.nextBtn().click();
    await this.waitForNavigation();
  }

  /**
   * TC-KYC-01 Step 6 — Submit KYC and confirm success
   */
  async submitKyc(): Promise<void> {
    await this.submitKycBtn().click();
    await this.waitForNavigation();
  }

  async assertKycSuccess(): Promise<void> {
    await expect(this.kycSuccessScreen()).toBeVisible({ timeout: 20_000 });
  }

  // ── KYC VARIANT B: Resume KYC ────────────────────────────

  /**
   * TC-KYC-02 — Resume an incomplete KYC session.
   */
  async resumeKyc(): Promise<void> {
    await expect(this.resumeKycBtn()).toBeVisible();
    await this.resumeKycBtn().click();
    await this.waitForNavigation();
    // Progress bar must be visible and > 0%
    await expect(this.kycProgressBar()).toBeVisible();
  }

  /**
   * TC-KYC-02 — Assert form fields are pre-populated (session state retained).
   */
  async assertResumedFieldsPopulated(expectedName: string): Promise<void> {
    await expect(this.firstNameInput()).toHaveValue(expectedName);
  }

  // ── KYC VARIANT C: Auto-KYC ──────────────────────────────

  /**
   * TC-KYC-03 — Auto-KYC via API pre-fill.
   * Fields should be pre-filled and read-only.
   */
  async assertAutoKycPreFilled(data: KycData): Promise<void> {
    await expect(this.firstNameInput()).toHaveValue(data.firstName);
    await expect(this.lastNameInput()).toHaveValue(data.lastName);
    // Fields are read-only in Auto-KYC
    await expect(this.firstNameInput()).toHaveAttribute('readonly');
  }

  async confirmAutoKyc(): Promise<void> {
    await this.submitKycBtn().click();
    await this.waitForNavigation();
  }

  // ── KYC VARIANT D: Already Verified ──────────────────────

  /**
   * TC-KYC-04 — Assert KYC is verified and no KYC prompt is shown.
   */
  async assertKycAlreadyVerified(): Promise<void> {
    await expect(this.verifiedBadge()).toBeVisible();
    await expect(this.kycBanner()).not.toBeVisible();
  }
}
