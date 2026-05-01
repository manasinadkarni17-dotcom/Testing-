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
  // Consolidated OTP input (single field fallback)
  readonly otpInput              = () => this.page.locator('[data-testid="otp-input"], input[name="otp"], input[placeholder*="OTP"], input[placeholder*="code"], input[autocomplete="one-time-code"]').first();
  // Split OTP digit boxes (6 individual maxlength="1" inputs — UAT renders this layout)
  readonly otpDigitInputs        = () => this.page.locator('input[maxlength="1"]');
  readonly otpSubmitBtn          = () => this.page.locator('[data-testid="otp-submit"], button:has-text("Verify"), button:has-text("Submit"), button:has(svg.lucide-circle-check)').first();
  // During cooldown the UI renders "Resend OTP in 0:XX" as a <p>; after cooldown it becomes a button/link.
  readonly resendOtpLink         = () => this.page.locator('[data-testid="resend-otp"], a:has-text("Resend"), button:has-text("Resend"), p:has-text("Resend OTP")').first();

  // Social login — method-selector tabs
  readonly googleTabBtn      = () => this.page.getByRole('button', { name: 'Google', exact: true });
  readonly appleTabBtn       = () => this.page.getByRole('button', { name: 'Apple',  exact: true });
  // Social login — OAuth trigger buttons (visible after selecting the tab above)
  readonly googleLoginBtn    = () => this.page.getByRole('button', { name: 'Sign In with Google' });
  readonly appleLoginBtn     = () => this.page.getByRole('button', { name: 'Sign In with Apple'  });

  // Other
  readonly forgotPwdLink     = () => this.page.locator('[data-testid="forgot-password"], a:has-text("Forgot")').first();
  readonly errorMessage      = () => this.page.locator('[data-testid="login-error"], .login-error, [role="alert"]').first();
  readonly signUpLink        = () => this.page.getByRole('button', { name: 'Sign Up' });
  readonly sendOtpBtn        = () => this.page.locator('[data-testid="send-otp"], button:has-text("Send OTP"), button:has-text("Get OTP")').first();

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    const desktopUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    // page.route() intercepts at the network layer and overrides UA for ALL
    // browsers. setExtraHTTPHeaders alone does not override User-Agent in WebKit
    // (iOS Safari) because Playwright sets it through a separate protocol call.
    await this.page.route('**/*', async (route) => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          'user-agent': desktopUA,
          'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
        },
      });
    });

    await this.goto('/login');
  }

async switchToPasswordLogin(): Promise<void> {
  // After logout the app may redirect to the marketing root page rather than
  // /login, or the mobile UA may not yet be overridden. Re-navigate to /login
  // (which installs the desktop UA route) if the email input is absent.
  const onLoginForm = await this.emailInput().isVisible({ timeout: 3_000 }).catch(() => false);
  if (!onLoginForm) {
    await this.navigate();
  }

  // Anchor regex to ^password$ so it never matches "Sign In with Password".
  const btn = this.page.getByRole('button', { name: /^password$/i })
    .or(this.page.getByRole('tab', { name: /^password$/i }));

  if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    // Firefox hangs on pointer-based click for shadcn TabsTrigger; DOM .click() bypasses it.
    await btn.evaluate((el) => (el as HTMLElement).click());
  }

  // True gate: password input must be present regardless of which path we took.
  await expect(this.passwordInput()).toBeVisible({ timeout: 20_000 });
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

    // Step 4 — Enter OTP: fill digit-by-digit for split boxes, single fill for consolidated input
    const digitBoxes = this.otpDigitInputs();
    await expect(digitBoxes.first().or(this.otpInput())).toBeVisible({ timeout: 10_000 });
    const digitCount = await digitBoxes.count();
    if (digitCount >= 4) {
      for (let i = 0; i < otp.length; i++) {
        await digitBoxes.nth(i).fill(otp[i]);
      }
    } else {
      await this.otpInput().fill(otp);
    }

    // Step 5 — Submit (some UIs auto-submit after the last digit; click confirm if still visible)
    const submitBtn = this.otpSubmitBtn();
    if (await submitBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await submitBtn.click();
    }
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
      await this.continueWithEmailBtn().click();
    }
    await expect(this.otpDigitInputs().first().or(this.otpInput())).toBeVisible({ timeout: 10_000 });
  }

  async loginWithGoogle(): Promise<void> {
    await this.googleTabBtn().click();
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
    await this.appleTabBtn().click();
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