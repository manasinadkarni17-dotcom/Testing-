// ─────────────────────────────────────────────────────────────
//  KycPage — Fresh · Resume · Auto · Already Verified
//  URL: https://uat.nuqiwealth.com/kyc
//
//  Actual KYC flow:
//    1. KYC overview modal → "Start KYC Verification"
//    2. Select Document Type (Aadhaar/Passport radio) → outer "Proceed"
//    3. Facia.ai iframe loads:
//         a. Check Vuetify consent checkbox ("I agree with Privacy Policy and Terms of Use")
//         b. iframe "Proceed" button enables → click it → ready to capture
//         c. Face + document capture (camera, cannot be automated headlessly)
//    4. Risk Profiling
//    5. AML Profiling → Submit
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { KycData } from '../types';

export class KycPage extends BasePage {
  // ── General ────────────────────────────────────────────────
  readonly kycBanner        = () => this.page.locator('[data-testid="kyc-banner"], .kyc-prompt, section:has-text("Complete your KYC")')
                                      .or(this.page.getByRole('heading', { name: 'KYC Verification', exact: true }))
                                      .first();
  readonly startKycBtn      = () => this.page.locator('[data-testid="start-kyc"], button:has-text("Start KYC"), button:has-text("Complete KYC"), button:has-text("Verify Identity")').first();
  readonly resumeKycBtn     = () => this.page.locator('[data-testid="resume-kyc"], button:has-text("Resume"), button:has-text("Continue KYC")').first();
  readonly verifiedBadge    = () => this.page.locator('[data-testid="kyc-verified"], .verified-badge, span:has-text("Verified"), [aria-label="KYC Verified"]').first();
  readonly kycSkipIndicator = () => this.page.locator('[data-testid="kyc-complete"], .kyc-complete').first();

  // ── Step 1: Document type selection ───────────────────────
  readonly docTypeHeading   = () => this.page.getByRole('heading', { name: 'Select Document Type', exact: true });
  // Radios are sr-only — interact via the parent <label>
  readonly idTypeLabel      = (value: 'aadhaar' | 'passport') =>
                                this.page.locator(`label:has(input[type="radio"][value="${value}"])`);
  readonly idTypeSelect     = () => this.page.locator('[data-testid="id-type"], input[type="radio"][name="document"]').first();

  // ── Step 2: Outer app wrapper shown while Facia.ai iframe loads ──
  readonly verificationTipsHeading = () => this.page.getByRole('heading', { name: 'Verification Tips' });

  // ── Step 2: Facia.ai iframe (face + document verification) ───
  // All capture happens inside this cross-origin iframe — no file inputs in outer DOM
  readonly faciaConsentCheckbox = () => this.page.frameLocator('iframe').first()
                                            .locator('.v-input--selection-controls__ripple').first();
  readonly faciaProceedBtn      = () => this.page.frameLocator('iframe').first()
                                            .getByRole('button', { name: /proceed/i });

  // ── Step 3 / 4: Risk & AML headings ───────────────────────
  readonly riskProfilingHeading = () => this.page.locator('[data-testid="risk-profiling"]')
                                          .or(this.page.getByRole('heading', { name: /risk profil/i }))
                                          .first();
  readonly amlProfilingHeading  = () => this.page.locator('[data-testid="aml-profiling"]')
                                          .or(this.page.getByRole('heading', { name: /aml|compliance/i }))
                                          .first();

  // ── Navigation ─────────────────────────────────────────────
  // Outer app button text is "Proceed" (not "Next" / "Continue")
  readonly nextBtn          = () => this.page.locator('[data-testid="kyc-next"], button:has-text("Proceed"), button:has-text("Next"), button:has-text("Continue")').first();
  readonly submitKycBtn     = () => this.page.locator('[data-testid="kyc-submit"], button:has-text("Submit"), button:has-text("Confirm")').first();

  // No stepper/progressbar in DOM — docTypeHeading confirms we are on an active step
  readonly kycProgressBar   = () => this.page.locator('[data-testid="kyc-progress"], .kyc-stepper, [role="progressbar"]')
                                      .or(this.page.getByRole('heading', { name: 'Select Document Type', exact: true }))
                                      .first();
  readonly kycSuccessScreen = () => this.page.locator('[data-testid="kyc-success"], h2:has-text("Verified"), h1:has-text("KYC Complete"), .kyc-success').first();

  // ── Personal details (auto-KYC pre-fill assertions only) ──
  readonly firstNameInput   = () => this.page.locator('[data-testid="first-name"], input[name="firstName"], input[placeholder*="First"]').first();
  readonly lastNameInput    = () => this.page.locator('[data-testid="last-name"], input[name="lastName"], input[placeholder*="Last"]').first();
  readonly dobInput         = () => this.page.locator('[data-testid="dob"], input[name="dob"], input[type="date"], input[placeholder*="Date"]').first();
  readonly nationalitySelect = () => this.page.locator('[data-testid="nationality"], select[name="nationality"], [aria-label="Nationality"]').first();
  readonly phoneInput       = () => this.page.locator('[data-testid="phone"], input[name="phone"], input[type="tel"]').first();

  constructor(page: Page) {
    super(page);
  }

  // ── Status checks ─────────────────────────────────────────

  async isAlreadyVerified(): Promise<boolean> {
    return this.verifiedBadge().isVisible({ timeout: 3000 }).catch(() => false);
  }

  async hasIncompleteKyc(): Promise<boolean> {
    return this.resumeKycBtn().isVisible({ timeout: 3000 }).catch(() => false);
  }

  // ── KYC VARIANT A: Fresh KYC ──────────────────────────────

  async clickStartKyc(): Promise<void> {
    await expect(this.startKycBtn()).toBeVisible({ timeout: 10_000 });
    await this.startKycBtn().click();
    await expect(this.docTypeHeading()).toBeVisible({ timeout: 10_000 });
  }

  async selectDocumentType(type: 'aadhaar' | 'passport'): Promise<void> {
    await this.idTypeLabel(type).click();
    await expect(this.nextBtn()).toBeEnabled({ timeout: 5_000 });
    await this.nextBtn().click();
    // Confirm outer app loaded the Facia.ai verification wrapper
    await expect(this.verificationTipsHeading()).toBeVisible({ timeout: 10_000 });
  }

  // Accepts the Facia.ai privacy/terms consent inside the embedded iframe.
  // After this the iframe advances to "ready to capture" state.
  async acceptFaciaConsent(): Promise<void> {
    await this.faciaConsentCheckbox().click();
    await expect(this.faciaProceedBtn()).toBeEnabled({ timeout: 5_000 });
    await this.faciaProceedBtn().click();
  }

  // Combines document type selection + Facia.ai consent acceptance.
  // Camera capture itself (face + document) cannot be automated headlessly.
  async fillIdentityDocument(data: KycData): Promise<void> {
    await this.selectDocumentType(data.idType as 'aadhaar' | 'passport');
    await this.acceptFaciaConsent();
  }

  // Placeholder — Facia.ai face/document capture requires a live camera or sandbox.
  // Override in environment-specific fixtures if a Facia.ai test credential is available.
  async completeFaceVerification(): Promise<void> {
    // No-op in default headless runs; Facia.ai iframe handles capture interactively.
  }

  async submitKyc(): Promise<void> {
    await this.submitKycBtn().click();
    await this.waitForNavigation();
  }

  async assertKycSuccess(): Promise<void> {
    await expect(this.kycSuccessScreen()).toBeVisible({ timeout: 20_000 });
  }

  // ── KYC VARIANT B: Resume KYC ────────────────────────────

  async resumeKyc(): Promise<void> {
    await expect(this.resumeKycBtn()).toBeVisible();
    await this.resumeKycBtn().click();
    await this.waitForNavigation();
    await expect(this.kycProgressBar()).toBeVisible();
  }

  async assertResumedFieldsPopulated(expectedName: string): Promise<void> {
    await expect(this.firstNameInput()).toHaveValue(expectedName);
  }

  // ── KYC VARIANT C: Auto-KYC ──────────────────────────────

  async assertAutoKycPreFilled(data: KycData): Promise<void> {
    await expect(this.firstNameInput()).toHaveValue(data.firstName);
    await expect(this.lastNameInput()).toHaveValue(data.lastName);
    await expect(this.firstNameInput()).toHaveAttribute('readonly');
  }

  async confirmAutoKyc(): Promise<void> {
    await this.submitKycBtn().click();
    await this.waitForNavigation();
  }

  // ── KYC VARIANT D: Already Verified ──────────────────────

  async assertKycAlreadyVerified(): Promise<void> {
    await expect(this.verifiedBadge()).toBeVisible();
    await expect(this.kycBanner()).not.toBeVisible();
  }
}
