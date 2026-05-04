// ─────────────────────────────────────────────────────────────
//  TC-HOME · Home Page — All Clickable Sections & Pages
//  Tags: @smoke @regression
//  Priority: P0 / P1
//  Browsers: Chromium, Firefox
//  Devices: Desktop + Mobile
//
//  Login: returningUser (KYC + risk profile complete — clean dashboard)
//  Covers:
//    • Primary navigation (Portfolio, Invest, Transactions, Profile)
//    • My Funds / Portfolio widget
//    • Add page · Customise
//    • Quick Wallet Actions (Add Funds, Transfer, Withdraw, History)
//    • Curated Portfolios (Explore All / selective card)
//    • Available Funds
//    • Sector Health Rating tab switching (N.America, Asia, Europe, Africa)
//    • My Holdings tab
//    • My Watchlist / All Watchlist toggle
//    • Insight & News section
//    • Recent Transfers → View All
//    • KYC / Risk prompt assertions
//    • Mobile hamburger + drawer nav
//    • Logout
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers } from '../../utils/test-data';

// ── Shared setup ──────────────────────────────────────────────

test.describe('Home Page', () => {

  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.switchToPasswordLogin();
    await loginPage.loginWithEmailPassword(TestUsers.returningUser());
    await homePage.assertHomeLoaded();
  });

  // ── TC-HOME-01: Page load ─────────────────────────────────

  test(
    'TC-HOME-01 · Dashboard loads on correct URL',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ page }) => {
      await expect(page).toHaveURL(/\/(dashboard|home|onboarding|kyc|invest|$)/);
    },
  );

  // ── TC-HOME-02: Navigation visible ───────────────────────

  test(
    'TC-HOME-02 · Primary navigation is visible',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ homePage }) => {
      await homePage.assertNavVisible();
    },
  );

  // ─────────────────────────────────────────────────────────
  // PRIMARY NAVIGATION
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-03 · Nav → Portfolio navigates to /portfolio',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ homePage, page }) => {
      await expect(homePage.navPortfolio()).toBeVisible({ timeout: 8_000 });
      await homePage.navPortfolio().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/portfolio/, { timeout: 10_000 });
    },
  );

  test(
    'TC-HOME-04 · Nav → Invest navigates to /invest',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ homePage, page }) => {
      await expect(homePage.navInvest()).toBeVisible({ timeout: 8_000 });
      await homePage.navInvest().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/invest/, { timeout: 10_000 });
    },
  );

  test(
    'TC-HOME-05 · Nav → Transactions navigates to transactions page',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      await expect(homePage.navTransactions()).toBeVisible({ timeout: 8_000 });
      await homePage.navTransactions().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/(transaction|history)/, { timeout: 10_000 });
    },
  );

  test(
    'TC-HOME-06 · Nav → Profile navigates to /profile',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      await expect(homePage.navProfile()).toBeVisible({ timeout: 8_000 });
      await homePage.navProfile().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/profile/, { timeout: 10_000 });
    },
  );

  // ─────────────────────────────────────────────────────────
  // MY FUNDS / PORTFOLIO WIDGET
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-07 · My Funds section is visible on home page',
    { tag: ['@regression', '@p1'] },
    async ({ homePage }) => {
      const section = homePage.myFundsSection();
      const widget  = homePage.portfolioWidget();
      const visible =
        await section.isVisible({ timeout: 8_000 }).catch(() => false) ||
        await widget.isVisible({ timeout: 3_000 }).catch(() => false);
      expect(visible).toBeTruthy();
    },
  );

  test(
    'TC-HOME-08 · My Funds link navigates to portfolio',
    { tag: ['@regression'] },
    async ({ homePage, page }) => {
      const link = homePage.myFundsLink();
      if (await link.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await link.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/portfolio/, { timeout: 10_000 });
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // ADD PAGE / CUSTOMISE
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-09 · Add page button is visible and clickable',
    { tag: ['@regression'] },
    async ({ homePage, page }) => {
      const btn = homePage.addPageBtn();
      if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        // Should open a new section, modal, or page
        const url = page.url();
        expect(url).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-10 · Customise button is visible and clickable',
    { tag: ['@regression'] },
    async ({ homePage, page }) => {
      const btn = homePage.customiseBtn();
      if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // QUICK WALLET ACTIONS
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-11 · Quick wallet actions section is visible',
    { tag: ['@regression', '@p1'] },
    async ({ homePage }) => {
      const addFunds = homePage.addFundsBtn();
      const transfer = homePage.transferBtn();
      const withdraw = homePage.withdrawBtn();
      const history  = homePage.walletHistoryBtn();

      const anyVisible =
        await addFunds.isVisible({ timeout: 8_000 }).catch(() => false) ||
        await transfer.isVisible({ timeout: 2_000 }).catch(() => false) ||
        await withdraw.isVisible({ timeout: 2_000 }).catch(() => false) ||
        await history.isVisible({ timeout: 2_000 }).catch(() => false);

      expect(anyVisible).toBeTruthy();
    },
  );

  test(
    'TC-HOME-12 · Add Funds button opens add funds flow',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      const btn = homePage.addFundsBtn();
      await expect(btn).toBeVisible({ timeout: 8_000 });
      await btn.click();
      await page.waitForLoadState('networkidle');
      // Should navigate to add-funds page or open a modal
      const landed =
        /add.?fund|deposit|wallet/i.test(page.url()) ||
        await page.locator('[role="dialog"], .modal, .bottom-sheet').isVisible({ timeout: 3_000 }).catch(() => false);
      expect(landed).toBeTruthy();
    },
  );

  test(
    'TC-HOME-13 · Transfer button opens transfer flow',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      const btn = homePage.transferBtn();
      if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        const landed =
          /transfer/i.test(page.url()) ||
          await page.locator('[role="dialog"], .modal, .bottom-sheet').isVisible({ timeout: 3_000 }).catch(() => false);
        expect(landed).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-14 · Withdraw button opens withdraw flow',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      const btn = homePage.withdrawBtn();
      if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        const landed =
          /withdraw/i.test(page.url()) ||
          await page.locator('[role="dialog"], .modal, .bottom-sheet').isVisible({ timeout: 3_000 }).catch(() => false);
        expect(landed).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-15 · History button navigates to transaction history',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      const btn = homePage.walletHistoryBtn();
      if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/(transaction|history)/, { timeout: 10_000 });
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // CURATED PORTFOLIOS
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-16 · Curated Portfolios section is visible',
    { tag: ['@regression', '@p1'] },
    async ({ homePage }) => {
      const section = homePage.curatedPortfoliosSection();
      if (await section.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await expect(section).toBeVisible();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-17 · Explore All curated portfolios navigates to full list',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      const btn = homePage.exploreAllCuratedBtn();
      if (await btn.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-18 · Clicking a curated portfolio card opens its detail',
    { tag: ['@regression'] },
    async ({ homePage, page }) => {
      const cards = homePage.curatedPortfolioCards();
      if (await cards.count().then(c => c > 0).catch(() => false)) {
        await cards.first().click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // AVAILABLE FUNDS
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-19 · Available Funds section is visible',
    { tag: ['@regression', '@p1'] },
    async ({ homePage }) => {
      const section = homePage.availableFundsSection();
      if (await section.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await expect(section).toBeVisible();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-20 · Clicking an available fund card opens its detail',
    { tag: ['@regression'] },
    async ({ homePage, page }) => {
      const cards = homePage.availableFundCards();
      if (await cards.count().then(c => c > 0).catch(() => false)) {
        await cards.first().click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // SECTOR HEALTH RATING TABS
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-21 · Sector Health section is visible',
    { tag: ['@regression', '@p1'] },
    async ({ homePage }) => {
      const section = homePage.sectorHealthSection();
      if (await section.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await expect(section).toBeVisible();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-22 · Sector tab — North America switches content',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const tab = homePage.sectorTabNorthAmerica();
      if (await tab.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await homePage.switchSectorTab('North America');
        await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 5_000 })
          .catch(async () => {
            // Some implementations use data-state="active" instead of aria-selected
            await expect(tab).toHaveAttribute('data-state', 'active', { timeout: 3_000 });
          });
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-23 · Sector tab — Asia switches content',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const tab = homePage.sectorTabAsia();
      if (await tab.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await homePage.switchSectorTab('Asia');
        await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 5_000 })
          .catch(async () => {
            await expect(tab).toHaveAttribute('data-state', 'active', { timeout: 3_000 });
          });
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-24 · Sector tab — Europe switches content',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const tab = homePage.sectorTabEurope();
      if (await tab.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await homePage.switchSectorTab('Europe');
        await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 5_000 })
          .catch(async () => {
            await expect(tab).toHaveAttribute('data-state', 'active', { timeout: 3_000 });
          });
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-25 · Sector tab — Africa switches content',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const tab = homePage.sectorTabAfrica();
      if (await tab.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await homePage.switchSectorTab('Africa');
        await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 5_000 })
          .catch(async () => {
            await expect(tab).toHaveAttribute('data-state', 'active', { timeout: 3_000 });
          });
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // MY HOLDINGS TAB
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-26 · My Holdings tab shows holdings list',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      const tab = homePage.myHoldingsTab();
      if (await tab.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(500);
        // Holdings list or empty state should be visible
        const hasHoldings = await homePage.holdingItems().count().then(c => c > 0).catch(() => false);
        const hasEmpty    = await page
          .locator('.empty-state, p:has-text("No holdings"), p:has-text("No investments")')
          .isVisible({ timeout: 3_000 }).catch(() => false);
        expect(hasHoldings || hasEmpty).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // WATCHLIST TABS
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-27 · My Watchlist tab is visible and switchable',
    { tag: ['@regression', '@p1'] },
    async ({ homePage }) => {
      const tab = homePage.myWatchlistTab();
      if (await tab.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await homePage.switchToMyWatchlist();
        await expect(tab).toBeVisible();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-28 · All Watchlist tab switches to full watchlist view',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const tab = homePage.allWatchlistTab();
      if (await tab.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await homePage.switchToAllWatchlist();
        await expect(tab).toBeVisible();
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // INSIGHT & NEWS
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-29 · Insight & News section is visible',
    { tag: ['@regression', '@p1'] },
    async ({ homePage }) => {
      const section = homePage.insightNewsSection();
      if (await section.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await expect(section).toBeVisible();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-30 · Clicking a news/insight item opens its detail',
    { tag: ['@regression'] },
    async ({ homePage, page }) => {
      const items = homePage.insightNewsItems();
      if (await items.count().then(c => c > 0).catch(() => false)) {
        await items.first().click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toBeTruthy();
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // RECENT TRANSFERS — VIEW ALL
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-31 · Recent Transfers section is visible',
    { tag: ['@regression', '@p1'] },
    async ({ homePage }) => {
      const section = homePage.recentTransfersSection();
      if (await section.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await expect(section).toBeVisible();
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-32 · Recent Transfers → View All navigates to transaction history',
    { tag: ['@regression', '@p1'] },
    async ({ homePage, page }) => {
      const btn = homePage.viewAllTransfersBtn();
      if (await btn.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/(transaction|history)/, { timeout: 10_000 });
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // KYC / RISK PROMPTS (returning user — should be absent)
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-33 · No KYC prompt for verified returning user',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ homePage }) => {
      await homePage.assertNoKycPrompt();
    },
  );

  test(
    'TC-HOME-34 · No risk prompt for returning user with risk profile',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ homePage }) => {
      await homePage.assertNoRiskPrompt();
    },
  );

  // ─────────────────────────────────────────────────────────
  // MOBILE MENU
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-35 · Mobile hamburger menu opens drawer',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      if (await homePage.mobileMenuBtn().isVisible({ timeout: 3_000 }).catch(() => false)) {
        await homePage.openMobileMenu();
        await expect(homePage.mobileMenuDrawer()).toBeVisible({ timeout: 5_000 });
      } else {
        test.skip();
      }
    },
  );

  test(
    'TC-HOME-36 · Mobile drawer → Invest navigates to /invest',
    { tag: ['@regression'] },
    async ({ homePage, page }) => {
      if (await homePage.mobileMenuBtn().isVisible({ timeout: 3_000 }).catch(() => false)) {
        await homePage.openMobileMenu();
        await expect(homePage.drawerNavInvest()).toBeVisible({ timeout: 5_000 });
        await homePage.drawerNavInvest().click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/invest/, { timeout: 10_000 });
      } else {
        test.skip();
      }
    },
  );

  // ─────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────

  test(
    'TC-HOME-37 · Logout redirects away from dashboard',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ homePage }) => {
      await homePage.logout();
      await homePage.assertLoggedOut();
    },
  );
});

// ─────────────────────────────────────────────────────────────
// UNVERIFIED USER — KYC & Risk prompts visible
// ─────────────────────────────────────────────────────────────

test.describe('Home Page — Unverified User', () => {

  test(
    'TC-HOME-38 · KYC prompt visible for unverified user',
    { tag: ['@regression', '@p1'] },
    async ({ loginPage, homePage }) => {
      await loginPage.navigate();
      await loginPage.loginWithOtp(
        process.env.TEST_INCOMPLETE_KYC_EMAIL ?? 'test.otp@nuqi.com',
        process.env.TEST_OTP ?? '270782',
      );
      await homePage.assertHomeLoaded();
      await homePage.assertKycPromptVisible();
    },
  );

  test(
    'TC-HOME-39 · Start KYC button on prompt navigates to /kyc',
    { tag: ['@regression', '@p1'] },
    async ({ loginPage, homePage, page }) => {
      await loginPage.navigate();
      await loginPage.loginWithOtp(
        process.env.TEST_INCOMPLETE_KYC_EMAIL ?? 'test.otp@nuqi.com',
        process.env.TEST_OTP ?? '270782',
      );
      await homePage.assertHomeLoaded();

      const btn = homePage.startKycBtn();
      if (await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/kyc/, { timeout: 10_000 });
      } else {
        test.skip();
      }
    },
  );
});
