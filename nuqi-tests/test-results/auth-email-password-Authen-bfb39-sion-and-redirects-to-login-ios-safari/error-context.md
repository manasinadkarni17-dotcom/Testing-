# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\email-password.spec.ts >> Authentication — Email + Password >> TC-AUTH-01-05 · Logout clears session and redirects to login
- Location: tests\auth\email-password.spec.ts:99:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="password-input"], input[name="password"], input[type="password"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[data-testid="password-input"], input[name="password"], input[type="password"]').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - img "Nuqi Wealth Logo" [ref=e5]
  - main [ref=e6]:
    - generic [ref=e7]:
      - img "NUQI Wealth Logo" [ref=e9]
      - heading "NUQI WEALTH GLOBAL" [level=1] [ref=e10]
      - link "https://uat.nuqiwealth.com" [ref=e11]:
        - /url: https://uat.nuqiwealth.com
      - paragraph [ref=e12]: NUQI is an independent investment advisory platform, regulated by the DFSA (Dubai Financial Services Authority) and based in the Dubai International Financial Centre (DIFC). Designed for both first-time investors beginning their wealth journey and seasoned investors looking to diversify globally, NUQI deploys in-house expertise and technology to build portfolios tailored to specific investor profiles and investment themes. The platform applies multiple criteria to select Stocks,and Curated Equity Portfolios, with Social Equity, Ethical Operations, Good Governance, and Environmental Protection as core investment principles. For investors seeking Shariah-compliant options, NUQI offers a dedicated screening framework aligned with Islamic finance principles.
      - generic [ref=e13]:
        - link "GET IT ON Google Play" [ref=e14]:
          - /url: https://play.google.com/store/apps/details?id=com.nuqiwealth.app
          - img [ref=e15]
          - generic [ref=e17]:
            - generic [ref=e18]: GET IT ON
            - generic [ref=e19]: Google Play
        - link "Download on the App Store" [ref=e20]:
          - /url: https://apps.apple.com/us/app/nuqi-wealth-global/id6738743106
          - img [ref=e21]
          - generic [ref=e23]:
            - generic [ref=e24]: Download on the
            - generic [ref=e25]: App Store
  - contentinfo [ref=e26]:
    - paragraph [ref=e27]: For the best experience, please download our mobile app.
```

# Test source

```ts
  1   | // ─────────────────────────────────────────────────────────────
  2   | //  LoginPage — Email/Password · Email+OTP · Google · Apple
  3   | // ─────────────────────────────────────────────────────────────
  4   | 
  5   | import { Page, expect } from '@playwright/test';
  6   | import { BasePage } from './BasePage';
  7   | import { UserCredentials } from '../types';
  8   | 
  9   | export class LoginPage extends BasePage {
  10  |   // ── Locators ───────────────────────────────────────────────
  11  | 
  12  |   // Email + Password login (returning user)
  13  |   readonly emailInput        = () => this.page.getByRole('textbox', { name: 'Email or Phone Number' });
  14  |   readonly passwordInput     = () => this.page.locator('[data-testid="password-input"], input[name="password"], input[type="password"]').first();
  15  |   readonly loginButton       = () => this.page.getByRole('button', { name: 'Sign In with Password' });
  16  | 
  17  |   // Email OTP login — matches the actual UAT flow recorded in Playwright:
  18  |   //   1. click emailModeBtn ("Email" exact)
  19  |   //   2. fill otpEmailInput ("Email Address")
  20  |   //   3. click continueWithEmailBtn ("Continue with Email")
  21  |   //   4. fill otpInput → submit
  22  |   readonly emailModeBtn          = () => this.page.getByRole('button', { name: 'Email', exact: true });
  23  |   readonly otpEmailInput         = () => this.page.getByRole('textbox', { name: 'Email Address' });
  24  |   readonly continueWithEmailBtn  = () => this.page.getByRole('button', { name: 'Continue with Email' });
  25  |   readonly otpInput              = () => this.page.locator('[data-testid="otp-input"], input[name="otp"], input[placeholder*="OTP"], input[placeholder*="code"]').first();
  26  |   readonly otpSubmitBtn          = () => this.page.locator('[data-testid="otp-submit"], button:has-text("Verify"), button:has-text("Submit"), button:has(svg.lucide-circle-check)').first();
  27  |   readonly resendOtpLink         = () => this.page.locator('[data-testid="resend-otp"], a:has-text("Resend"), button:has-text("Resend")').first();
  28  | 
  29  |   // Social login
  30  |   readonly googleLoginBtn    = () => this.page.locator('[data-testid="google-login"], button:has-text("Google"), [aria-label*="Google"]').first();
  31  |   readonly appleLoginBtn     = () => this.page.locator('[data-testid="apple-login"], button:has-text("Apple"), [aria-label*="Apple"]').first();
  32  | 
  33  |   // Other
  34  |   readonly forgotPwdLink     = () => this.page.locator('[data-testid="forgot-password"], a:has-text("Forgot")').first();
  35  |   readonly errorMessage      = () => this.page.locator('[data-testid="login-error"], .login-error, [role="alert"]').first();
  36  |   readonly signUpLink        = () => this.page.getByRole('button', { name: 'Sign Up' });
  37  |   readonly sendOtpBtn        = () => this.page.locator('[data-testid="send-otp"], button:has-text("Send OTP"), button:has-text("Get OTP")').first();
  38  | 
  39  |   constructor(page: Page) {
  40  |     super(page);
  41  |   }
  42  | 
  43  |   async navigate(): Promise<void> {
  44  |     await this.goto('/login');
  45  |   }
  46  | async switchToPasswordLogin(): Promise<void> {
  47  |   // Anchor regex to ^password$ so it never matches "Sign In with Password".
  48  |   const btn = this.page.getByRole('button', { name: /^password$/i })
  49  |     .or(this.page.getByRole('tab', { name: /^password$/i }));
  50  | 
  51  |   if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
  52  |     // Firefox hangs on pointer-based click for shadcn TabsTrigger; DOM .click() bypasses it.
  53  |     await btn.evaluate((el) => (el as HTMLElement).click());
  54  |   }
  55  | 
  56  |   // True gate: password input must be present regardless of which path we took.
> 57  |   await expect(this.passwordInput()).toBeVisible({ timeout: 10_000 });
      |                                      ^ Error: expect(locator).toBeVisible() failed
  58  | }
  59  |   async openLoginPage(): Promise<void> {
  60  |     await this.navigate();
  61  |     await expect(this.emailInput()).toBeVisible();
  62  |     await expect(this.passwordInput()).toBeVisible();
  63  |     await expect(this.loginButton()).toBeVisible();
  64  |   }
  65  | 
  66  |   async loginWithEmailPassword(credentials: UserCredentials): Promise<void> {
  67  |     await this.emailInput().fill(credentials.email);
  68  |     await this.passwordInput().fill(credentials.password);
  69  |     await expect(this.loginButton()).toBeEnabled();
  70  |     // Firefox hangs on pointer-based click for shadcn submit buttons; DOM .click() bypasses it.
  71  |     await this.loginButton().evaluate((el) => (el as HTMLElement).click());
  72  |     await this.waitForNavigation();
  73  |   }
  74  | 
  75  |   // ── OTP login flow (Email mode → Email Address input → Continue with Email) ─
  76  | 
  77  |   async loginWithOtp(email: string, otp: string): Promise<void> {
  78  |     // Step 1 — Select "Email" mode if the method-selector is present
  79  |     const modeBtn = this.emailModeBtn();
  80  |     if (await modeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  81  |       await modeBtn.click();
  82  |     }
  83  | 
  84  |     // Step 2 — Fill email address
  85  |     const emailEl = this.otpEmailInput();
  86  |     if (await emailEl.isVisible({ timeout: 3_000 }).catch(() => false)) {
  87  |       await emailEl.fill(email);
  88  |     } else {
  89  |       await this.emailInput().fill(email);
  90  |     }
  91  | 
  92  |     // Step 3 — Trigger OTP via "Continue with Email" (or legacy Send OTP)
  93  |     const continueBtn = this.continueWithEmailBtn();
  94  |     if (await continueBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  95  |       await continueBtn.click();
  96  |     } else {
  97  |       await this.requestOtp();
  98  |     }
  99  | 
  100 |     // Step 4 — Enter OTP
  101 |     await expect(this.otpInput()).toBeVisible({ timeout: 10_000 });
  102 |     await this.otpInput().fill(otp);
  103 | 
  104 |     // Step 5 — Click the circle-check confirm button (falls back to text-based submit)
  105 |     await expect(this.otpSubmitBtn()).toBeVisible({ timeout: 5_000 });
  106 |     await this.otpSubmitBtn().click();
  107 |     await this.waitForNavigation();
  108 |   }
  109 | 
  110 |   // ── Legacy helper kept for backward compatibility ─────────
  111 |   async requestOtp(): Promise<void> {
  112 |     const sendVisible = await this.sendOtpBtn()
  113 |       .isVisible({ timeout: 2_000 })
  114 |       .catch(() => false);
  115 |     if (sendVisible) {
  116 |       await this.sendOtpBtn().click();
  117 |     } else {
  118 |       await this.loginButton().click();
  119 |     }
  120 |     await expect(this.otpInput()).toBeVisible({ timeout: 10_000 });
  121 |   }
  122 | 
  123 |   async loginWithGoogle(): Promise<void> {
  124 |     const [popup] = await Promise.all([
  125 |       this.page.waitForEvent('popup').catch(() => null),
  126 |       this.googleLoginBtn().click(),
  127 |     ]);
  128 |     if (popup) {
  129 |       await popup.waitForLoadState();
  130 |       await popup.locator('input[type="email"]').fill(process.env.GOOGLE_TEST_EMAIL ?? '');
  131 |       await popup.locator('button:has-text("Next")').click();
  132 |       await popup.locator('input[type="password"]').fill(process.env.GOOGLE_TEST_PASSWORD ?? '');
  133 |       await popup.locator('button:has-text("Next")').click();
  134 |       await popup.waitForEvent('close', { timeout: 15_000 });
  135 |     }
  136 |     await this.waitForNavigation();
  137 |   }
  138 | 
  139 |   async loginWithApple(): Promise<void> {
  140 |     const [popup] = await Promise.all([
  141 |       this.page.waitForEvent('popup').catch(() => null),
  142 |       this.appleLoginBtn().click(),
  143 |     ]);
  144 |     if (popup) {
  145 |       await popup.waitForLoadState();
  146 |       await popup
  147 |         .locator('#account_name_text_field, input[name="accountName"]')
  148 |         .fill(process.env.APPLE_TEST_EMAIL ?? '');
  149 |       await popup.locator('#sign-in, button:has-text("Continue")').click();
  150 |       await popup
  151 |         .locator('#password_text_field, input[name="password"]')
  152 |         .fill(process.env.APPLE_TEST_PASSWORD ?? '');
  153 |       await popup.locator('#sign-in, button:has-text("Sign in")').click();
  154 |       await popup.waitForEvent('close', { timeout: 20_000 });
  155 |     }
  156 |     await this.waitForNavigation();
  157 |   }
```