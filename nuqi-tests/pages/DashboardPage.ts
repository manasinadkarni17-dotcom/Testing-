// ─────────────────────────────────────────────────────────────
//  DashboardPage — Main dashboard after login
//  URL: https://uat.nuqiwealth.com/dashboard  (or /home)
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────
  readonly welcomeMessage      = () => this.page.locator('[data-testid="welcome-message"], h1:has-text("Welcome"), .greeting').first();
  readonly userAvatar          = () => this.page.locator('[data-testid="user-avatar"], .user-avatar, [aria-label="Profile"]').first();
  readonly portfolioWidget     = () => this.page.locator('[data-testid="portfolio-widget"], .portfolio-summary, .dashboard-portfolio').first();
  readonly investNowCta        = () => this.page.locator('[data-testid="invest-cta"], button:has-text("Invest Now"), a:has-text("Invest")').first();
  readonly kycPrompt           = () => this.page.locator('[data-testid="kyc-prompt"], .kyc-banner, [role="alert"]:has-text("KYC")')
                                         .or(this.page.getByRole('heading', { name: 'KYC Verification', exact: true }))
                                         .first();
  readonly riskPrompt          = () => this.page.locator('[data-testid="risk-prompt"], .risk-banner, [role="alert"]:has-text("Risk")').first();
  readonly marketSummary       = () => this.page.locator('[data-testid="market-summary"], .market-widget').first();
  readonly newsSection         = () => this.page.locator('[data-testid="news-section"], .news-widget, .market-news').first();

  readonly logoutBtn = () =>
    this.page.getByRole('button',   { name: /log.?out|sign.?out/i })
      .or(this.page.getByRole('link',     { name: /log.?out|sign.?out/i }))
      .or(this.page.getByRole('menuitem', { name: /log.?out|sign.?out/i }))
      .or(this.page.locator('[data-testid*="logout"], [data-testid*="sign-out"]'))
      .or(this.page.locator('li, [role="listitem"]').filter({ hasText: /^log.?out$|^sign.?out$/i }))
      .or(this.page.locator('a, span, div').filter({ hasText: /^log.?out$|^sign.?out$/i }))
      .first();
  readonly logoutConfirmBtn    = () => this.page.locator('div.fixed div button:nth-child(2), [role="dialog"] button:nth-child(2)').first();

  // ── Nav ───────────────────────────────────────────────────
  readonly navHome             = () => this.page.locator('[data-testid="nav-home"], a[href*="dashboard"], nav a:has-text("Home")').first();
  readonly navPortfolio        = () => this.page.locator('[data-testid="nav-portfolio"], a[href*="portfolio"]').first();
  readonly navInvest           = () => this.page.locator('[data-testid="nav-invest"], a[href*="invest"]').first();
  readonly navTransactions     = () => this.page.locator('[data-testid="nav-transactions"], a[href*="transaction"]').first();
  readonly navProfile          = () => this.page.locator('[data-testid="nav-profile"], a[href*="profile"]').first();

  // Mobile nav (hamburger) — icon-only SVG button in the root header
  readonly mobileMenuBtn       = () => this.page.locator('#root > div > header > button, button[aria-label="Menu"], button[aria-label="Toggle menu"], [data-testid="mobile-menu"]').first();
  readonly mobileMenuDrawer    = () => this.page.locator('[data-testid="mobile-drawer"], .mobile-nav, [role="dialog"]').first();

  constructor(page: Page) {
    super(page);
  }

  // ── TC-DASH-01: Dashboard loaded ─────────────────────────

  async assertDashboardLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/(dashboard|home|onboarding|kyc|invest|$)/, { timeout: 15000 });
  }

  async assertReturningUserLanded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL('https://uat.nuqiwealth.com/', { timeout: 15000 });
  }

  async assertLoggedOut(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // App redirects to root after logout, not /login
    await expect(this.page).toHaveURL(/^https:\/\/uat\.nuqiwealth\.com\/(login)?$/, { timeout: 10000 });
  }

  async logout(): Promise<void> {
    const toggleBtn = this.mobileMenuBtn();
    if (await toggleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toggleBtn.click();
      // Give the drawer's CSS transition time to complete before we act on its contents
      await this.page.waitForTimeout(400);
    }

    // locator.evaluate(el => el.click()) resolves the element via the normal
    // Playwright locator (with retry) then calls the DOM .click() API directly,
    // bypassing all visibility / position pre-checks. This is necessary because
    // the logout <li> lives inside a CSS-transformed drawer (translateX(-100%))
    // that may already be closed by the time Playwright's normal click runs.
    await this.logoutBtn().evaluate((el) => (el as HTMLElement).click());

    if (await this.logoutConfirmBtn().isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.logoutConfirmBtn().click();
    }
  }

  async assertWelcomeVisible(): Promise<void> {
    await expect(this.welcomeMessage()).toBeVisible({ timeout: 8000 });
  }

  // ── TC-DASH-02: KYC prompt visible for unverified users ──

  async assertKycPromptVisible(): Promise<void> {
    await expect(this.kycPrompt()).toBeVisible({ timeout: 5000 });
  }

  async assertNoKycPrompt(): Promise<void> {
    await expect(this.kycPrompt()).not.toBeVisible({ timeout: 3000 });
  }

  // ── TC-DASH-03: Risk prompt visible ──────────────────────

  async assertRiskPromptVisible(): Promise<void> {
    await expect(this.riskPrompt()).toBeVisible({ timeout: 5000 });
  }

  async assertNoRiskPrompt(): Promise<void> {
    await expect(this.riskPrompt()).not.toBeVisible({ timeout: 3000 });
  }

  // ── Navigation helpers ────────────────────────────────────

  async goToPortfolio(): Promise<void> {
    await this.navPortfolio().click();
    await this.waitForNavigation();
  }

  async goToInvest(): Promise<void> {
    await this.navInvest().click();
    await this.waitForNavigation();
  }

  async goToTransactions(): Promise<void> {
    await this.navTransactions().click();
    await this.waitForNavigation();
  }

  // ── Mobile menu helpers ───────────────────────────────────

  async openMobileMenu(): Promise<void> {
    const btn = this.mobileMenuBtn();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await expect(this.mobileMenuDrawer()).toBeVisible();
    }
  }

  async assertMobileNavVisible(): Promise<void> {
    // On mobile, bottom nav or hamburger must be visible
    const bottomNav = this.page.locator('.bottom-nav, [data-testid="bottom-nav"]');
    const hamburger = this.mobileMenuBtn();
    const either = (await bottomNav.isVisible().catch(() => false)) ||
                   (await hamburger.isVisible().catch(() => false));
    expect(either).toBeTruthy();
  }
}
