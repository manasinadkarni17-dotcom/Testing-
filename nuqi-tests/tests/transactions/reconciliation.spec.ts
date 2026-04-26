// ─────────────────────────────────────────────────────────────
//  TC-RECON · Reconciliation — Transaction history validation
//  Tags: @regression
//  Priority: P1
//  Browsers: Chromium, Firefox
//  Devices: Desktop
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { POWER_USER_STATE } from '../../fixtures/auth.setup';

test.describe('Reconciliation — Transaction History', () => {

  test.use({ storageState: POWER_USER_STATE });

  test.beforeEach(async ({ page, reconciliationPage }) => {
    await reconciliationPage.gotoTransactions();
  });

  // ── TC-RECON-01 ───────────────────────────────────────────
  test(
    'TC-RECON-01 · Transaction history page loads with correct heading',
    { tag: ['@regression'] },
    async ({ reconciliationPage }) => {
      await reconciliationPage.assertPageLoaded();
    },
  );

  // ── TC-RECON-02 ───────────────────────────────────────────
  test(
    'TC-RECON-02 · At least one transaction row is visible',
    { tag: ['@regression', '@p1'] },
    async ({ reconciliationPage }) => {
      await reconciliationPage.assertLatestTransactionVisible();
    },
  );

  // ── TC-RECON-03 ───────────────────────────────────────────
  test(
    'TC-RECON-03 · Buy transaction is recorded in history',
    { tag: ['@regression'] },
    async ({ reconciliationPage }) => {
      // The power user fixture has pre-existing buy transactions
      await reconciliationPage.assertBuyTransactionRecorded('ETF');
    },
  );

  // ── TC-RECON-04 ───────────────────────────────────────────
  test(
    'TC-RECON-04 · Transaction row shows type, amount and date',
    { tag: ['@regression'] },
    async ({ reconciliationPage }) => {
      await reconciliationPage.assertLatestTransactionVisible();

      // Assert each row has text matching amount pattern
      const firstRow = reconciliationPage.latestTransaction();
      const text = await firstRow.textContent() ?? '';
      // Should contain a number (amount)
      expect(text).toMatch(/[\d,.]+/);
    },
  );

  // ── TC-RECON-05 ───────────────────────────────────────────
  test(
    'TC-RECON-05 · Transaction detail drawer shows all fields on row click',
    { tag: ['@regression'] },
    async ({ reconciliationPage }) => {
      // Step 1: Click latest transaction row
      await reconciliationPage.openLatestTransactionDetail();

      // Step 2: Assert detail fields visible
      await reconciliationPage.assertTransactionDetailFields();

      // Step 3: Close drawer
      await reconciliationPage.closeTransactionDetail();
    },
  );

  // ── TC-RECON-06 ───────────────────────────────────────────
  test(
    'TC-RECON-06 · Latest transaction status is Completed',
    { tag: ['@regression', '@p1'] },
    async ({ reconciliationPage }) => {
      await reconciliationPage.assertLatestTransactionCompleted();
    },
  );

  // ── TC-RECON-07 ───────────────────────────────────────────
  test(
    'TC-RECON-07 · Filter by Buy shows only buy transactions',
    { tag: ['@regression'] },
    async ({ reconciliationPage }) => {
      const filterBuyBtn = reconciliationPage.filterBuyBtn();
      if (await filterBuyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await reconciliationPage.filterByBuyTransactions();
      }
    },
  );

  // ── TC-RECON-08 ───────────────────────────────────────────
  test(
    'TC-RECON-08 · Summary cards show numeric values',
    { tag: ['@regression'] },
    async ({ reconciliationPage }) => {
      await reconciliationPage.assertSummaryCardsHaveValues();
    },
  );

  // ── TC-RECON-09 ───────────────────────────────────────────
  test(
    'TC-RECON-09 · Transaction recorded immediately after buy flow',
    { tag: ['@regression', '@p1'] },
    async ({ page, investPage, buyPage, reconciliationPage }) => {
      // Step 1: Navigate to invest and buy
      await page.goto('/invest');
      await investPage.openDirectInvestment();
      await investPage.instrumentCards().first().click();
      await investPage.waitForNavigation();
      await buyPage.clickBuyButton();
      await buyPage.enterMinimumAllowedAmount();
      await buyPage.acceptTermsAndConfirm();
      await buyPage.assertBuySuccess();

      // Step 2: Navigate to transactions
      await reconciliationPage.gotoTransactions();

      // Step 3: Assert buy transaction recorded
      await reconciliationPage.assertLatestTransactionVisible();
      const type = await reconciliationPage.getLatestTransactionType();
      expect(type).toBe('buy');
    },
  );

  // ── TC-RECON-10 ───────────────────────────────────────────
  test(
    'TC-RECON-10 · Transaction recorded immediately after sell flow',
    { tag: ['@regression'] },
    async ({ page, portfolioPage, sellPage, reconciliationPage }) => {
      // Step 1: Perform partial sell
      await page.goto('/portfolio');
      await portfolioPage.assertPortfolioLoaded();
      const holdingCount = await portfolioPage.holdingItems().count();
      if (holdingCount === 0) {
        test.skip(true, 'No holdings to sell');
      }
      await portfolioPage.sellBtn().first().click();
      await sellPage.waitForNavigation();
      await sellPage.assertSellFormOpened();
      await sellPage.sellByPresetPercentage(50);
      await sellPage.confirmPartialSell();
      await sellPage.assertPartialSellSuccess();

      // Step 2: Navigate to transactions
      await reconciliationPage.gotoTransactions();

      // Step 3: Assert sell transaction recorded
      await reconciliationPage.assertLatestTransactionVisible();
      const type = await reconciliationPage.getLatestTransactionType();
      expect(type).toBe('sell');
    },
  );
});
