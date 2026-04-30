// ─────────────────────────────────────────────────────────────
//  LoginPage — Email/Password · Email+OTP · Google · Apple
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserCredentials } from '../types';

export class LoginPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────

  // Email + Password login (returning user)
  readonly emailInput        = () => this.page.getByRole('textbox', { name: 'Email or Phone Number' });
  readonly passwordInput     = () => this.page.locator('[data-testid="password-input"], input[name="password"], input[type="password"]').first();
  readonly loginButton       = () => this.page.getByRole('button', { name: 'Sign In with Password' });

  // Email OTP login — matches the actual UAT flow recorded in Playwright:
  //   1. click emailModeBtn ("Email" exact)
  //   2. fill otpEmailInput ("Email Address")
  //   3. click continueWithEmailBtn ("Continue with Email")
  //   4. fill otpInput → submit
  readonly emailModeBtn          = () => this.page.getByRole('button', { name: 'Email', exact: true });
  readonly otpEmailInput         = () => this.page.getByRole('textbox', { name: 'Email Address' });
  readonly continueWithEmailBtn  = () => this.page.getByRole('button', { name: 'Continue with Email' });
  readonly otpInput              = () => this.page.locator('[data-testid="otp-input"], input[name="otp"], input[placeholder*="OTP"], input[placeholder*="code"]').first();
  readonly otpSubmitBtn          = () => this.page.locator('[data-testid="otp-submit"], button:has-text("Verify"), button:has-text("Submit"), button:has(svg.lucide-circle-check)').first();
  readonly resendOtpLink         = () => this.page.locator('[data-testid="resend-otp"], a:has-text("Resend"), button:has-text("Resend")').first();

  // Social login
  readonly googleLoginBtn    = () => this.page.locator('[data-testid="google-login"], button:has-text("Google"), [aria-label*="Google"]').first();
  readonly appleLoginBtn     = () => this.page.locator('[data-testid="apple-login"], button:has-text("Apple"), [aria-label*="Apple"]').first();

  // Other
  readonly forgotPwdLink     = () => this.page.locator('[data-testid="forgot-password"], a:has-text("Forgot")').first();
  readonly errorMessage      = () => this.page.locator('[data-testid="login-error"], .login-error, [role="alert"]').first();
  readonly signUpLink        = () => this.page.getByRole('button', { name: 'Sign Up' });
  readonly sendOtpBtn        = () => this.page.locator('[data-testid="send-otp"], button:has-text("Send OTP"), button:has-text("Get OTP")').first();

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto('/login');
  }
async switchToPasswordLogin(): Promise<void> {
  // Anchor regex to ^password$ so it never matches "Sign In with Password".
  const btn = this.page.getByRole('button', { name: /^password$/i })
    .or(this.page.getByRole('tab', { name: /^password$/i }));

  if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    // Firefox hangs on pointer-based click for shadcn TabsTrigger; DOM .click() bypasses it.
    await btn.evaluate((el) => (el as HTMLElement).click());
  }

  // True gate: password input must be present regardless of which path we took.
  await expect(this.passwordInput()).toBeVisible({ timeout: 10_000 });
}
  async openLoginPage(): Promise<void> {
    await this.navigate();
    await expect(this.emailInput()).toBeVisible();
    await expect(this.passwordInput()).toBeVisible();
    await expect(this.loginButton()).toBeVisible();
  }

  async loginWithEmailPassword(credentials: UserCredentials): Promise<void> {
    await this.emailInput().fill(credentials.email);
    await this.passwordInput().fill(credentials.password);
    await expect(this.loginButton()).toBeEnabled();
    // Firefox hangs on pointer-based click for shadcn submit buttons; DOM .click() bypasses it.
    await this.loginButton().evaluate((el) => (el as HTMLElement).click());
    await this.waitForNavigation();
  }

  // ── OTP login flow (Email mode → Email Address input → Continue with Email) ─

  async loginWithOtp(email: string, otp: string): Promise<void> {
    // Step 1 — Select "Email" mode if the method-selector is present
    const modeBtn = this.emailModeBtn();
    if (await modeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await modeBtn.click();
    }

    // Step 2 — Fill email address
    const emailEl = this.otpEmailInput();
    if (await emailEl.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailEl.fill(email);
    } else {
      await this.emailInput().fill(email);
    }

    // Step 3 — Trigger OTP via "Continue with Email" (or legacy Send OTP)
    const continueBtn = this.continueWithEmailBtn();
    if (await continueBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await continueBtn.click();
    } else {
      await this.requestOtp();
    }

    // Step 4 — Enter OTP
    await expect(this.otpInput()).toBeVisible({ timeout: 10_000 });
    await this.otpInput().fill(otp);

    // Step 5 — Click the circle-check confirm button (falls back to text-based submit)
    await expect(this.otpSubmitBtn()).toBeVisible({ timeout: 5_000 });
    await this.otpSubmitBtn().click();
    await this.waitForNavigation();
  }

  // ── Legacy helper kept for backward compatibility ─────────
  async requestOtp(): Promise<void> {
    const sendVisible = await this.sendOtpBtn()
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    if (sendVisible) {
      await this.sendOtpBtn().click();
    } else {
      await this.loginButton().click();
    }
    await expect(this.otpInput()).toBeVisible({ timeout: 10_000 });
  }

  async loginWithGoogle(): Promise<void> {
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup').catch(() => null),
      this.googleLoginBtn().click(),
    ]);
    if (popup) {
      await popup.waitForLoadState();
      await popup.locator('input[type="email"]').fill(process.env.GOOGLE_TEST_EMAIL ?? '');
      await popup.locator('button:has-text("Next")').click();
      await popup.locator('input[type="password"]').fill(process.env.GOOGLE_TEST_PASSWORD ?? '');
      await popup.locator('button:has-text("Next")').click();
      await popup.waitForEvent('close', { timeout: 15_000 });
    }
    await this.waitForNavigation();
  }

  async loginWithApple(): Promise<void> {
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup').catch(() => null),
      this.appleLoginBtn().click(),
    ]);
    if (popup) {
      await popup.waitForLoadState();
      await popup
        .locator('#account_name_text_field, input[name="accountName"]')
        .fill(process.env.APPLE_TEST_EMAIL ?? '');
      await popup.locator('#sign-in, button:has-text("Continue")').click();
      await popup
        .locator('#password_text_field, input[name="password"]')
        .fill(process.env.APPLE_TEST_PASSWORD ?? '');
      await popup.locator('#sign-in, button:has-text("Sign in")').click();
      await popup.waitForEvent('close', { timeout: 20_000 });
    }
    await this.waitForNavigation();
  }

  async assertLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(
      /\/(dashboard|kyc|onboarding|home|portfolio)/,
      { timeout: 15_000 },
    );
  }

  async assertLoginError(message: string): Promise<void> {
    await expect(this.errorMessage()).toBeVisible();
    await expect(this.errorMessage()).toContainText(message);
  }
}