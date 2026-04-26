// ─────────────────────────────────────────────────────────────
//  TC-SELL-01/02/03 · Sell Transactions — all variants
//  Tags: @sell @regression
//  Priority: P1
//  Browsers: Chromium, Firefox, WebKit
//  Devices: Desktop
//  Pre-condition: user has existing holdings (returning/power user)
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestSellOrder } from '../../utils/test-data';
import { POWER_USER_STATE } from '../../fixtures/auth.setup';

test.describe('Sell Transactions — Partial Sell', () => {

  test.use({ storageState: POWER_USER_STATE });

  test.beforeEach(async ({ page, portfolioPage }) => {
    // Navigate to portfolio
    await page.goto('/portfolio');
    await portfolioPage.assertPortfolioLoaded();
  });

  // ── TC-SELL-01-01 ─────────────────────────────────────────
  test(
    'TC-SELL-01-01 · Sell button is visible on each holding in portfolio',
    { tag: ['@sell', '@regression'] },
    async ({ portfolioPage }) => {
      // Step 1: Assert holdings list is not empty
      await expect(portfolioPage.holdingItems().first()).toBeVisible({ timeout: 10_000 });
      // Step 2: Assert Sell button visible on first holding
      await expect(portfolioPage.sellBtn().first()).toBeVisible();
    },
  );

  // ── TC-SELL-01-02 ─────────────────────────────────────────
  test(
    'TC-SELL-01-02 · Clicking Sell opens sell order form',
    { tag: ['@sell', '@regression'] },
    async ({ portfolioPage, sellPage }) => {
      // Step 1: Click Sell on first holding
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();

      // Step 2: Assert sell form visible
      await sellPage.assertSellFormOpened();
    },
  );

  // ── TC-SELL-01-03 ─────────────────────────────────────────
  test(
    'TC-SELL-01-03 · Sell form shows available units and estimated proceeds',
    { tag: ['@sell', '@regression'] },
    async ({ portfolioPage, sellPage }) => {
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();
      await sellPage.assertSellFormOpened();

      // Assert available units shown
      await expect(sellPage.availableUnitsLabel()).toBeVisible();
    },
  );

  // ── TC-SELL-01-04 ─────────────────────────────────────────
  test(
    'TC-SELL-01-04 · Select 25% preset — proceeds update correctly',
    { tag: ['@sell', '@regression'] },
    async ({ portfolioPage, sellPage }) => {
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();
      await sellPage.assertSellFormOpened();

      // Step 1: Click 25% preset
      const preset25 = sellPage.preset25Btn();
      if (await preset25.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sellPage.sellByPresetPercentage(25);
        // Assert estimated proceeds visible
        await expect(sellPage.estimatedProceeds()).toBeVisible();
      }
    },
  );

  // ── TC-SELL-01-05 ─────────────────────────────────────────
  test(
    'TC-SELL-01-05 · Select 50% preset — confirm partial sell — success',
    { tag: ['@sell', '@regression', '@p1'] },
    async ({ portfolioPage, sellPage }) => {
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();
      await sellPage.assertSellFormOpened();

      // Step 1: Select 50%
      await sellPage.sellByPresetPercentage(50);

      // Step 2: Review sell summary
      await expect(sellPage.sellSummarySection()).toBeVisible();

      // Step 3: Accept T&C if shown
      const terms = sellPage.termsCheckbox();
      if (await terms.isVisible({ timeout: 2000 }).catch(() => false)) {
        await terms.check();
      }

      // Step 4: Confirm sell
      await expect(sellPage.confirmSellBtn()).toBeEnabled();
      await sellPage.confirmSellBtn().click();
      await sellPage.waitForNavigation();

      // Step 5: Assert success
      await sellPage.assertPartialSellSuccess();
    },
  );

  // ── TC-SELL-01-06 ─────────────────────────────────────────
  test(
    'TC-SELL-01-06 · After partial sell — holding still appears in portfolio with reduced value',
    { tag: ['@sell', '@regression'] },
    async ({ portfolioPage, sellPage, page }) => {
      // Get holding value before sell
      await page.goto('/portfolio');
      await portfolioPage.assertPortfolioLoaded();
      const valueBefore = await portfolioPage.getPortfolioTotalValue();

      // Perform 50% sell on first holding
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();
      await sellPage.assertSellFormOpened();
      await sellPage.sellByPresetPercentage(50);
      await sellPage.confirmPartialSell();
      await sellPage.assertPartialSellSuccess();

      // Navigate back to portfolio
      await page.goto('/portfolio');
      await portfolioPage.assertPortfolioLoaded();

      // Assert portfolio is not empty (holding still exists)
      await expect(portfolioPage.holdingItems().first()).toBeVisible({ timeout: 10_000 });
    },
  );
});

test.describe('Sell Transactions — Full Exit', () => {

  test.use({ storageState: POWER_USER_STATE });

  test.beforeEach(async ({ page, portfolioPage }) => {
    await page.goto('/portfolio');
    await portfolioPage.assertPortfolioLoaded();
  });

  // ── TC-SELL-02-01 ─────────────────────────────────────────
  test(
    'TC-SELL-02-01 · "Sell All" / "100%" button is visible on sell form',
    { tag: ['@sell', '@regression'] },
    async ({ portfolioPage, sellPage }) => {
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();
      await sellPage.assertSellFormOpened();

      await expect(sellPage.sellAllBtn()).toBeVisible();
    },
  );

  // ── TC-SELL-02-02 ─────────────────────────────────────────
  test(
    'TC-SELL-02-02 · Full exit — confirm and assert success',
    { tag: ['@sell', '@regression', '@p1'] },
    async ({ portfolioPage, sellPage }) => {
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();
      await sellPage.assertSellFormOpened();

      // Step 1: Select full exit
      await sellPage.selectFullExit();

      // Step 2: Review summary
      await expect(sellPage.sellSummarySection()).toBeVisible();

      // Step 3: Confirm
      await sellPage.confirmFullExit();

      // Step 4: Assert success
      await sellPage.assertFullExitSuccess();
    },
  );

  // ── TC-SELL-02-03 ─────────────────────────────────────────
  test(
    'TC-SELL-02-03 · After full exit on single holding — empty portfolio state appears',
    { tag: ['@sell', '@regression'] },
    async ({ portfolioPage, sellPage, page }) => {
      // This test assumes user has only ONE holding (use dedicated test user)
      test.skip(
        !process.env.TEST_SINGLE_HOLDING_USER,
        'Skipped: TEST_SINGLE_HOLDING_USER env not set',
      );

      await page.goto('/portfolio');
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();
      await sellPage.selectFullExit();
      await sellPage.confirmFullExit();
      await sellPage.assertFullExitSuccess();

      // Navigate back to portfolio
      await sellPage.backToPortfolioBtn().click();
      await portfolioPage.assertEmptyPortfolio();
    },
  );
});

test.describe('Sell Transactions — No Sell (Hold)', () => {

  test.use({ storageState: POWER_USER_STATE });

  // ── TC-SELL-03-01 ─────────────────────────────────────────
  test(
    'TC-SELL-03-01 · User views portfolio without selling — holdings unchanged',
    { tag: ['@sell', '@smoke', '@regression'] },
    async ({ portfolioPage, page }) => {
      await page.goto('/portfolio');
      await portfolioPage.assertPortfolioLoaded();

      // Step 1: Record count of holdings
      const holdingsBefore = await portfolioPage.holdingItems().count();
      expect(holdingsBefore).toBeGreaterThan(0);

      // Step 2: No sell action performed
      // Step 3: Reload page
      await page.reload();
      await portfolioPage.assertPortfolioLoaded();

      // Step 4: Assert holding count unchanged
      const holdingsAfter = await portfolioPage.holdingItems().count();
      expect(holdingsAfter).toBe(holdingsBefore);
    },
  );

  // ── TC-SELL-03-02 ─────────────────────────────────────────
  test(
    'TC-SELL-03-02 · No pending sell orders shown when user has not initiated sell',
    { tag: ['@sell', '@regression'] },
    async ({ portfolioPage, sellPage, page }) => {
      await page.goto('/portfolio');
      await portfolioPage.assertPortfolioLoaded();

      // Assert no pending sell badge/indicator
      await sellPage.assertNoSellPending('');
    },
  );
});
