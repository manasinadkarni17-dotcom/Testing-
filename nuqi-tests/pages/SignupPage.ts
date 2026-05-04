import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TermsAndConditionsPage } from './TermsAndConditionsPage';
import type { RegistrationData } from '../types';

export class SignupPage extends BasePage {

  // ─────────────────────────────────────────────────────────────
  // STEP 1: EMAIL
  // ─────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly signUpTab: Locator;
  readonly emailAddressInput: Locator;
  readonly continueWithEmailButton: Locator;
  readonly googleButton: Locator;
  readonly appleButton: Locator;
  readonly loginLink: Locator;

  // ─────────────────────────────────────────────────────────────
  // STEP 2: OTP
  // ─────────────────────────────────────────────────────────────
  readonly otpHeading: Locator;
  readonly otpSingleInput: Locator;
  readonly otpDigitInputs: Locator;
  readonly otpContinueButton: Locator;

  // ─────────────────────────────────────────────────────────────
  // STEP 3: TERMS
  // ─────────────────────────────────────────────────────────────
  readonly tcHeading: Locator;
  readonly termsFinalAcceptButton: Locator;

  // ─────────────────────────────────────────────────────────────
  // STEP 4: REGISTRATION
  // ─────────────────────────────────────────────────────────────
  readonly profileHeading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly countryFlagButton: Locator;
  readonly phoneNumberInput: Locator;
  readonly completeRegistrationButton: Locator;

  // ─────────────────────────────────────────────────────────────
  // STEP 5: KYC
  // ─────────────────────────────────────────────────────────────
  readonly kycHeading: Locator;
  readonly skipForNowBtn: Locator;

  constructor(page: Page) {
    super(page);

    // STEP 1
    this.pageHeading = page.getByRole('heading', { name: 'Create Your Account' });
    this.signUpTab = page.getByRole('button', { name: 'Sign Up' });
    this.emailAddressInput = page.getByRole('textbox', { name: 'Email Address' });
    this.continueWithEmailButton = page.getByRole('button', { name: 'Continue with Email' });
    this.googleButton = page.getByRole('button', { name: /google/i });
    this.appleButton = page.getByRole('button', { name: /apple/i });
    this.loginLink = page.getByRole('link', { name: 'Log In' });

    // STEP 2
    this.otpHeading = page.getByRole('heading', { name: 'Verify OTP' });
    this.otpSingleInput = page.locator('input[name="otp"], input[placeholder*="code"]');
    this.otpDigitInputs = page.locator('input[maxlength="1"]');
    this.otpContinueButton = page.locator('button:has(svg.lucide-circle-check)');

    // STEP 3
    this.tcHeading = page.getByRole('heading', { name: 'Terms & Conditions' });
    this.termsFinalAcceptButton = page.getByRole('button', { name: 'Accept & Continue' });

    // STEP 4
    this.profileHeading = page.getByRole('heading', { name: 'Complete Your Profile' });
    this.firstNameInput = page.locator('input[name="first_name"]');
    this.lastNameInput = page.locator('input[name="last_name"]');
    this.dateOfBirthInput = page.locator('input[name="date_of_birth"]');
    this.countryFlagButton = page.locator('button:has(img[alt="flag"])');
    this.phoneNumberInput = page.getByRole('textbox', { name: 'Enter your phone number' });
    this.completeRegistrationButton = page.getByRole('button', { name: 'Complete Registration' });

    // STEP 5
    this.kycHeading = page.getByRole('heading', { name: 'KYC Verification' });
    this.skipForNowBtn = page.getByRole('button', { name: 'Skip for now' });
  }

  // ─────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────

  async clickSignUpTab() {
    await this.signUpTab.waitFor({ state: 'visible' });
    // WebKit clips the button outside the viewport via overflow:hidden on a parent.
    // DOM .click() bypasses the viewport check while still firing the real click event.
    await this.signUpTab.evaluate((el) => (el as HTMLElement).click());
    await this.emailAddressInput.waitFor();
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 1: EMAIL
  // ─────────────────────────────────────────────────────────────

  async submitEmailForSignup(email: string) {
    await this.emailAddressInput.click();
    await this.emailAddressInput.pressSequentially(email);
    await expect(this.emailAddressInput).toHaveValue(email);
    await this.continueWithEmailButton.click();

    await this.otpSingleInput
      .or(this.otpDigitInputs.first())
      .waitFor({ state: 'visible', timeout: 30_000 });
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 2: OTP
  // ─────────────────────────────────────────────────────────────

  async isOTPScreenVisible(): Promise<boolean> {
    return (
      (await this.otpDigitInputs.count()) >= 4 ||
      (await this.otpSingleInput.isVisible().catch(() => false))
    );
  }

  async fillOTP(otp: string) {
    if (await this.otpSingleInput.isVisible().catch(() => false)) {
      await this.otpSingleInput.fill(otp);
      return;
    }

    for (let i = 0; i < otp.length; i++) {
      await this.otpDigitInputs.nth(i).fill(otp[i]);
    }
  }

  async submitOTP() {
    if (await this.otpContinueButton.isVisible().catch(() => false)) {
      await this.otpContinueButton.click();
    }

    // URL change is okay here (reliable step)
    await this.page.waitForURL('**/termsandcondition', { timeout: 15_000 });
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: TERMS
  // ─────────────────────────────────────────────────────────────

  async waitForTermsPage() {
    await expect(this.tcHeading).toBeVisible({ timeout: 15_000 });
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 4: REGISTRATION
  // ─────────────────────────────────────────────────────────────

  async waitForDetailsPage() {
    await expect(this.profileHeading).toBeVisible({ timeout: 15_000 });
  }

  async fillPhoneNumber(phoneNumber: string, countryCode: string): Promise<void> {
    await this.countryFlagButton.click();

    // Wait for the search box — confirms the dropdown is open.
    const searchBox = this.page.getByPlaceholder(/search country/i);
    await searchBox.waitFor({ state: 'visible', timeout: 5_000 });
    await searchBox.fill(countryCode);

    // The dropdown renders options as <button> elements (e.g. "India India +91").
    // Exclude the flag trigger button (which has img[alt="flag"]) to avoid re-matching it.
    await this.page
      .locator('button:not(:has(img[alt="flag"]))')
      .filter({ hasText: countryCode })
      .first()
      .click();

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    await this.phoneNumberInput.fill(digitsOnly);
  }

  async fillRegistrationForm(data: RegistrationData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.dateOfBirthInput.fill(data.dateOfBirth);
    await this.fillPhoneNumber(data.phoneNumber, data.phoneCountryCode);
  }

  async completeRegistration() {
    await expect(this.completeRegistrationButton).toBeEnabled({ timeout: 20_000 });
    await this.completeRegistrationButton.click();
    // Wait for the registration page to leave rather than asserting a specific URL —
    // more resilient to slow UAT API responses and URL structure changes.
    await expect(this.profileHeading).not.toBeVisible({ timeout: 40_000 });
  }

  async acceptAllTerms(): Promise<void> {
    const termsPage = new TermsAndConditionsPage(this.page);
    await termsPage.acceptAll();
  }
  // ─────────────────────────────────────────────────────────────
  // STEP 5: KYC
  // ─────────────────────────────────────────────────────────────

  async waitForKYCPage() {
    await expect(this.kycHeading).toBeVisible({ timeout: 20_000 });
  }

  async skipKYC() {
    await this.skipForNowBtn.waitFor({ state: 'visible' });
    await this.skipForNowBtn.click();
  }

  // ─────────────────────────────────────────────────────────────
  // OAUTH
  // ─────────────────────────────────────────────────────────────

  async continueWithGoogle(page: Page) {
    const [result] = await Promise.all([
      Promise.race([
        page.waitForEvent('popup', { timeout: 15_000 }).then(p => p),
        page.waitForURL(url => /google|oauth|accounts/i.test(url.toString()), { timeout: 15_000 }).then(() => page),
      ]),
      this.googleButton.click(),
    ]);
    return result;
  }

  async continueWithApple(page: Page) {
    const [result] = await Promise.all([
      Promise.race([
        page.waitForEvent('popup', { timeout: 15_000 }).then(p => p),
        page.waitForURL(url => /apple|oauth|appleid/i.test(url.toString()), { timeout: 15_000 }).then(() => page),
      ]),
      this.appleButton.click(),
    ]);
    return result;
  }
}