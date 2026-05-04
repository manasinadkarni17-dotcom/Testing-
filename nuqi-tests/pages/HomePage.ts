// ─────────────────────────────────────────────────────────────
//  HomePage — Post-login dashboard / home
//  URL: https://uat.nuqiwealth.com/dashboard  (or /home)
//
//  Sections covered:
//    1. App Header (logo, avatar, notifications)
//    2. Primary Navigation (Portfolio, Invest, Transactions, Profile)
//    3. My Funds / Portfolio widget
//    4. Add / Customise actions
//    5. Quick Wallet Actions (Add Funds, Transfer, Withdraw, History)
//    6. Curated Portfolios (Explore All / selective)
//    7. Available Funds
//    8. Sector Health Rating tabs (North America, Asia, Europe, Africa)
//    9. My Holdings tab
//   10. My Watchlist / All Watchlist toggle
//   11. Insight & News section
//   12. Recent Transfers — View All
//   13. KYC / Risk prompts
//   14. Mobile hamburger + drawer
//   15. Logout
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {

  // ── 1. App Header ─────────────────────────────────────────
  readonly appLogo = () =>
    this.page.locator('[data-testid="app-logo"], img[alt*="Nuqi"], img[alt*="logo"], .logo, header img')
      .first();

  readonly userAvatarBtn = () =>
    this.page.locator('[data-testid="user-avatar"], [aria-label="Profile"], .user-avatar, button:has(img[alt*="avatar"])')
      .first();

  readonly notificationBtn = () =>
    this.page.locator('[data-testid="notifications"], [aria-label*="notification"], button:has(svg.lucide-bell)')
      .first();

  // ── 2. Primary Navigation ──────────────────────────────────
  readonly navHome = () =>
    this.page.locator('[data-testid="nav-home"], a[href*="dashboard"], a[href*="/home"], nav a:has-text("Home")')
      .first();

  readonly navPortfolio = () =>
    this.page.locator('[data-testid="nav-portfolio"], a[href*="portfolio"], nav a:has-text("Portfolio")')
      .first();

  readonly navInvest = () =>
    this.page.locator('[data-testid="nav-invest"], a[href*="invest"], nav a:has-text("Invest")')
      .first();

  readonly navTransactions = () =>
    this.page.locator('[data-testid="nav-transactions"], a[href*="transaction"], nav a:has-text("Transactions"), nav a:has-text("History")')
      .first();

  readonly navProfile = () =>
    this.page.locator('[data-testid="nav-profile"], a[href*="profile"], nav a:has-text("Profile"), nav a:has-text("Account")')
      .first();

  // ── 3. My Funds / Portfolio Widget ────────────────────────
  readonly myFundsSection = () =>
    this.page.locator('[data-testid="my-funds"], .my-funds, section:has-text("My Funds"), .portfolio-widget')
      .first();

  readonly myFundsLink = () =>
    this.page.locator('[data-testid="my-funds-link"], a:has-text("My Funds"), button:has-text("My Funds")')
      .first();

  readonly portfolioWidget = () =>
    this.page.locator('[data-testid="portfolio-widget"], .portfolio-summary, .dashboard-portfolio')
      .first();

  readonly portfolioValueText = () =>
    this.page.locator('[data-testid="portfolio-value"], .portfolio-total, .total-value')
      .first();

  // ── 4. Add / Customise ────────────────────────────────────
  readonly addPageBtn = () =>
    this.page.locator('[data-testid="add-page"], button:has-text("Add"), a:has-text("Add"), button[aria-label*="Add"]')
      .or(this.page.locator('button:has(svg.lucide-plus), button[aria-label="Add page"]'))
      .first();

  readonly customiseBtn = () =>
    this.page.locator('[data-testid="customise"], [data-testid="customize"], button:has-text("Customise"), button:has-text("Customize"), a:has-text("Customise")')
      .first();

  // ── 5. Quick Wallet Actions ────────────────────────────────
  readonly walletActionsSection = () =>
    this.page.locator('[data-testid="wallet-actions"], .wallet-actions, section:has-text("Wallet"), div:has(> button:has-text("Add Funds"))')
      .first();

  readonly addFundsBtn = () =>
    this.page.locator('[data-testid="add-funds"], button:has-text("Add Funds"), a:has-text("Add Funds")')
      .first();

  readonly transferBtn = () =>
    this.page.locator('[data-testid="transfer"], button:has-text("Transfer"), a:has-text("Transfer")')
      .first();

  readonly withdrawBtn = () =>
    this.page.locator('[data-testid="withdraw"], button:has-text("Withdraw"), a:has-text("Withdraw")')
      .first();

  readonly walletHistoryBtn = () =>
    this.page.locator('[data-testid="wallet-history"], button:has-text("History"), a:has-text("History")')
      .first();

  // ── 6. Curated Portfolios ─────────────────────────────────
  readonly curatedPortfoliosSection = () =>
    this.page.locator('[data-testid="curated-portfolios"], .curated-portfolios, section:has-text("Curated Portfolio")')
      .first();

  readonly exploreAllCuratedBtn = () =>
    this.page.locator('[data-testid="explore-all-curated"], a:has-text("Explore All"), button:has-text("Explore All")')
      .first();

  readonly curatedPortfolioCards = () =>
    this.page.locator('[data-testid="curated-card"], .curated-item, .portfolio-card');

  readonly curatedPortfolioCard = (index = 0) =>
    this.curatedPortfolioCards().nth(index);

  // ── 7. Available Funds ────────────────────────────────────
  readonly availableFundsSection = () =>
    this.page.locator('[data-testid="available-funds"], .available-funds, section:has-text("Available Funds")')
      .first();

  readonly availableFundCards = () =>
    this.page.locator('[data-testid="fund-card"], .fund-item, .fund-card');

  readonly availableFundCard = (index = 0) =>
    this.availableFundCards().nth(index);

  // ── 8. Sector Health Rating Tabs ──────────────────────────
  readonly sectorHealthSection = () =>
    this.page.locator('[data-testid="sector-health"], .sector-health, section:has-text("Sector Health")')
      .first();

  readonly sectorTabNorthAmerica = () =>
    this.page.locator('[data-testid="sector-north-america"], button:has-text("North America"), [role="tab"]:has-text("North America")')
      .first();

  readonly sectorTabAsia = () =>
    this.page.locator('[data-testid="sector-asia"], button:has-text("Asia"), [role="tab"]:has-text("Asia")')
      .first();

  readonly sectorTabEurope = () =>
    this.page.locator('[data-testid="sector-europe"], button:has-text("Europe"), [role="tab"]:has-text("Europe")')
      .first();

  readonly sectorTabAfrica = () =>
    this.page.locator('[data-testid="sector-africa"], button:has-text("Africa"), [role="tab"]:has-text("Africa")')
      .first();

  readonly sectorHealthContent = () =>
    this.page.locator('[data-testid="sector-content"], .sector-content, [role="tabpanel"]')
      .first();

  // ── 9. My Holdings Tab ────────────────────────────────────
  readonly myHoldingsTab = () =>
    this.page.locator('[data-testid="my-holdings-tab"], button:has-text("My Holdings"), [role="tab"]:has-text("My Holdings")')
      .first();

  readonly holdingItems = () =>
    this.page.locator('[data-testid="holding-item"], .holding-row, .investment-item');

  // ── 10. Watchlist ─────────────────────────────────────────
  readonly myWatchlistTab = () =>
    this.page.locator('[data-testid="my-watchlist"], button:has-text("My Watchlist"), [role="tab"]:has-text("My Watchlist")')
      .first();

  readonly allWatchlistTab = () =>
    this.page.locator('[data-testid="all-watchlist"], button:has-text("All Watchlist"), [role="tab"]:has-text("All Watchlist"), button:has-text("All")')
      .first();

  readonly watchlistItems = () =>
    this.page.locator('[data-testid="watchlist-item"], .watchlist-item, .watchlist-row');

  // ── 11. Insight & News ────────────────────────────────────
  readonly insightNewsSection = () =>
    this.page.locator('[data-testid="insight-news"], .insights-news, section:has-text("Insight"), section:has-text("News")')
      .first();

  readonly insightNewsItems = () =>
    this.page.locator('[data-testid="news-item"], .news-card, .insight-item, article');

  readonly insightNewsItem = (index = 0) =>
    this.insightNewsItems().nth(index);

  // ── 12. Recent Transfers ──────────────────────────────────
  readonly recentTransfersSection = () =>
    this.page.locator('[data-testid="recent-transfers"], .recent-transfers, section:has-text("Recent Transfer")')
      .first();

  readonly recentTransferItems = () =>
    this.page.locator('[data-testid="transfer-item"], .transfer-row, .transaction-item');

  readonly viewAllTransfersBtn = () =>
    this.page.locator('[data-testid="view-all-transfers"], a:has-text("View All"), button:has-text("View All")')
      .first();

  // ── 13. KYC / Risk Prompts ────────────────────────────────
  readonly kycPrompt = () =>
    this.page.locator('[data-testid="kyc-prompt"], .kyc-banner, [role="alert"]:has-text("KYC")')
      .or(this.page.getByRole('heading', { name: 'KYC Verification', exact: true }))
      .first();

  readonly riskPrompt = () =>
    this.page.locator('[data-testid="risk-prompt"], .risk-banner, [role="alert"]:has-text("Risk")')
      .first();

  readonly startKycBtn = () =>
    this.page.locator('[data-testid="start-kyc"], button:has-text("Start KYC"), button:has-text("Complete KYC"), button:has-text("Verify Identity")')
      .first();

  readonly startRiskBtn = () =>
    this.page.locator('[data-testid="start-risk"], button:has-text("Start Assessment"), button:has-text("Take Quiz"), button:has-text("Set Risk Profile")')
      .first();

  readonly investNowBtn = () =>
    this.page.locator('[data-testid="invest-cta"], button:has-text("Invest Now"), a:has-text("Invest Now")')
      .first();

  // ── 14. Mobile Menu ───────────────────────────────────────
  readonly mobileMenuBtn = () =>
    this.page.locator('#root > div > header > button, button[aria-label="Menu"], button[aria-label="Toggle menu"], [data-testid="mobile-menu"]')
      .first();

  readonly mobileMenuDrawer = () =>
    this.page.locator('[data-testid="mobile-drawer"], .mobile-nav, [role="dialog"]')
      .first();

  readonly drawerNavPortfolio = () =>
    this.mobileMenuDrawer().locator('a:has-text("Portfolio"), a[href*="portfolio"]').first();

  readonly drawerNavInvest = () =>
    this.mobileMenuDrawer().locator('a:has-text("Invest"), a[href*="invest"]').first();

  readonly drawerNavTransactions = () =>
    this.mobileMenuDrawer().locator('a:has-text("Transactions"), a[href*="transaction"]').first();

  readonly drawerNavProfile = () =>
    this.mobileMenuDrawer().locator('a:has-text("Profile"), a[href*="profile"]').first();

  // ── 15. Logout ─────────────────────────────────────────────
  readonly logoutBtn = () =>
    this.page.getByRole('button',   { name: /log.?out|sign.?out/i })
      .or(this.page.getByRole('link',     { name: /log.?out|sign.?out/i }))
      .or(this.page.getByRole('menuitem', { name: /log.?out|sign.?out/i }))
      .or(this.page.locator('[data-testid*="logout"], [data-testid*="sign-out"]'))
      .or(this.page.locator('li, [role="listitem"]').filter({ hasText: /^log.?out$|^sign.?out$/i }))
      .or(this.page.locator('a, span, div').filter({ hasText: /^log.?out$|^sign.?out$/i }))
      .first();

  readonly logoutConfirmBtn = () =>
    this.page.locator('div.fixed div button:nth-child(2), [role="dialog"] button:nth-child(2)')
      .first();

  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ─────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.goto('/dashboard');
  }

  // ── Assertions ─────────────────────────────────────────────

  async assertHomeLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/(dashboard|home|onboarding|kyc|invest|$)/, { timeout: 15_000 });
  }

  async assertNavVisible(): Promise<void> {
    const navItems = [
      this.navPortfolio(),
      this.navInvest(),
      this.navTransactions(),
      this.navProfile(),
    ];
    let found = false;
    for (const item of navItems) {
      if (await item.isVisible({ timeout: 3_000 }).catch(() => false)) {
        found = true;
        break;
      }
    }
    if (!found) {
      await expect(this.mobileMenuBtn()).toBeVisible({ timeout: 5_000 });
    }
  }

  async assertNoKycPrompt(): Promise<void> {
    await expect(this.kycPrompt()).not.toBeVisible({ timeout: 3_000 });
  }

  async assertKycPromptVisible(): Promise<void> {
    await expect(this.kycPrompt()).toBeVisible({ timeout: 5_000 });
  }

  async assertNoRiskPrompt(): Promise<void> {
    await expect(this.riskPrompt()).not.toBeVisible({ timeout: 3_000 });
  }

  async assertRiskPromptVisible(): Promise<void> {
    await expect(this.riskPrompt()).toBeVisible({ timeout: 5_000 });
  }

  // ── Section visibility helpers ────────────────────────────

  async isSectionVisible(locator: ReturnType<typeof this.page.locator>, timeout = 5_000): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false);
  }

  // ── Wallet actions ────────────────────────────────────────

  async clickAddFunds(): Promise<void> {
    await this.addFundsBtn().click();
    await this.waitForNavigation();
  }

  async clickTransfer(): Promise<void> {
    await this.transferBtn().click();
    await this.waitForNavigation();
  }

  async clickWithdraw(): Promise<void> {
    await this.withdrawBtn().click();
    await this.waitForNavigation();
  }

  async clickWalletHistory(): Promise<void> {
    await this.walletHistoryBtn().click();
    await this.waitForNavigation();
  }

  // ── Sector Health tabs ────────────────────────────────────

  async switchSectorTab(region: 'North America' | 'Asia' | 'Europe' | 'Africa'): Promise<void> {
    const tabMap = {
      'North America': this.sectorTabNorthAmerica(),
      'Asia':          this.sectorTabAsia(),
      'Europe':        this.sectorTabEurope(),
      'Africa':        this.sectorTabAfrica(),
    };
    await tabMap[region].click();
    await this.page.waitForTimeout(500);
  }

  // ── Watchlist ─────────────────────────────────────────────

  async switchToMyWatchlist(): Promise<void> {
    await this.myWatchlistTab().click();
    await this.page.waitForTimeout(400);
  }

  async switchToAllWatchlist(): Promise<void> {
    await this.allWatchlistTab().click();
    await this.page.waitForTimeout(400);
  }

  // ── Mobile menu ───────────────────────────────────────────

  async openMobileMenu(): Promise<void> {
    const btn = this.mobileMenuBtn();
    if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await btn.click();
      await this.page.waitForTimeout(400);
    }
  }

  // ── Logout ─────────────────────────────────────────────────

  async logout(): Promise<void> {
    const toggleBtn = this.mobileMenuBtn();
    if (await toggleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await toggleBtn.click();
      await this.page.waitForTimeout(400);
    }
    await this.logoutBtn().evaluate((el) => (el as HTMLElement).click());
    if (await this.logoutConfirmBtn().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.logoutConfirmBtn().click();
    }
  }

  async assertLoggedOut(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/^https:\/\/uat\.nuqiwealth\.com\/(login)?$/, { timeout: 10_000 });
  }
}
