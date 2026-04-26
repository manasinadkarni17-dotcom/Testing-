// ─────────────────────────────────────────────────────────────
//  S07 · Power User — Multi-buy × 3 + Partial Sell
//  S08 · Power User — Plan + Direct mix + Full Exit
//  Tags: @e2e @power @regression
//  Priority: P1
//  Browsers: Chromium, WebKit
//  Devices: Desktop
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestBuyOrder, MinBuyOrder } from '../../utils/test-data';
import { POWER_USER_STATE, RETURNING_USER_STATE } from '../../fixtures/auth.setup';
import { RiskProfile } from '../../types';

// ── S07 ──────────────────────────────────────────────────────

test.describe('S07 · Power User — Multi-Buy × 3 + Partial Sell', () => {

  test.use({ storageState: POWER_USER_STATE });

  test(
    'S07 · Buy 3 instruments sequentially — portfolio aggregates — partial sell',
    { tag: ['@e2e', '@power', '@regression', '@p1'] },
    async ({
      page,
      investPage,
      buyPage,
      portfolioPage,
      sellPage,
      reconciliationPage,
    }) => {
      let navValueBefore = 0;

      // ── STAGE 1: Buy Instrument 1 ─────────────────────────
      await test.step('Stage 1: Buy instrument 1 (standard amount)', async () => {
        await page.goto('/invest');
        await investPage.openDirectInvestment();
        await investPage.instrumentCards().nth(0).click();
        await investPage.waitForNavigation();
        await buyPage.performStandardBuy(TestBuyOrder);
      });

      // ── STAGE 2: Buy Instrument 2 ─────────────────────────
      await test.step('Stage 2: Buy instrument 2 (standard amount)', async () => {
        await page.goto('/invest');
        await investPage.openDirectInvestment();
        await investPage.instrumentCards().nth(1).click();
        await investPage.waitForNavigation();
        await buyPage.performStandardBuy({ ...TestBuyOrder, amount: 300 });
      });

      // ── STAGE 3: Buy Instrument 3 ─────────────────────────
      await test.step('Stage 3: Buy instrument 3 (minimum amount)', async () => {
        await page.goto('/invest');
        await investPage.openDirectInvestment();
        await investPage.instrumentCards().nth(2).click();
        await investPage.waitForNavigation();
        await buyPage.clickBuyButton();
        await buyPage.enterMinimumAllowedAmount();
        await buyPage.acceptTermsAndConfirm();
        await buyPage.assertBuySuccess();
      });

      // ── STAGE 4: Portfolio — assert all 3 holdings ────────
      await test.step('Stage 4: Portfolio shows aggregated NAV across 3 instruments', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        // At least 3 holdings exist
        const count = await portfolioPage.holdingItems().count();
        expect(count).toBeGreaterThanOrEqual(3);
        navValueBefore = await portfolioPage.getPortfolioTotalValue();
        expect(navValueBefore).toBeGreaterThan(0);
      });

      // ── STAGE 5: Partial Sell on first holding ────────────
      await test.step('Stage 5: Partial sell (50%) on first holding', async () => {
        await page.goto('/portfolio');
        await portfolioPage.sellBtn().first().click();
        await sellPage.waitForNavigation();
        await sellPage.assertSellFormOpened();
        await sellPage.sellByPresetPercentage(50);
        await sellPage.confirmPartialSell();
        await sellPage.assertPartialSellSuccess();
      });

      // ── STAGE 6: Portfolio — holdings still present ───────
      await test.step('Stage 6: Portfolio still has remaining holdings', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        const countAfter = await portfolioPage.holdingItems().count();
        expect(countAfter).toBeGreaterThanOrEqual(1);
      });

      // ── STAGE 7: Reconciliation — all 4 transactions ─────
      await test.step('Stage 7: Reconciliation — 3 buys + 1 sell recorded', async () => {
        await reconciliationPage.gotoTransactions();
        await reconciliationPage.assertPageLoaded();
        const rows = reconciliationPage.transactionRows();
        await expect(rows.first()).toBeVisible();
        // At minimum 4 transactions visible
        expect(await rows.count()).toBeGreaterThanOrEqual(4);
      });
    },
  );
});

// ── S08 ──────────────────────────────────────────────────────

test.describe('S08 · Power User — Plan + Direct + Full Exit', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  test(
    'S08 · Google login → plan buy → direct buy (alt payment) → full exit → reconcile',
    { tag: ['@e2e', '@power', '@p1'] },
    async ({
      page,
      investPage,
      buyPage,
      portfolioPage,
      sellPage,
      reconciliationPage,
    }) => {

      // ── STAGE 1: Create Investment Plan ───────────────────
      await test.step('Stage 1: Create Investment Plan', async () => {
        await page.goto('/invest');
        await investPage.openCreatePlan();
        await investPage.planNameInput().fill('Power User Plan');
        await investPage.targetAmountInput().fill('20000');
        await investPage.createPlanSubmitBtn().click();
        await investPage.waitForNavigation();
        await investPage.assertPlanCreated();
      });

      // ── STAGE 2: Buy via Plan ─────────────────────────────
      await test.step('Stage 2: Buy instrument under plan (standard)', async () => {
        await page.goto('/invest');
        await investPage.openDirectInvestment();
        await investPage.instrumentCards().first().click();
        await investPage.waitForNavigation();
        await buyPage.performStandardBuy(TestBuyOrder);
      });

      // ── STAGE 3: Buy via Direct + Alternate Payment ───────
      await test.step('Stage 3: Direct investment with alternate payment method', async () => {
        await page.goto('/invest');
        await investPage.openDirectInvestment();
        await investPage.instrumentCards().nth(1).click();
        await investPage.waitForNavigation();
        await buyPage.clickBuyButton();
        await buyPage.enterBuyAmount(TestBuyOrder.amount);

        // Try alternate payment
        const bankOption = buyPage.bankTransferOption();
        if (await bankOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await bankOption.click();
        }
        await buyPage.acceptTermsAndConfirm();
        await buyPage.assertBuySuccess();
      });

      // ── STAGE 4: Portfolio overview ───────────────────────
      await test.step('Stage 4: Portfolio shows 2 holdings', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        const count = await portfolioPage.holdingItems().count();
        expect(count).toBeGreaterThanOrEqual(2);
      });

      // ── STAGE 5: Full Exit on first holding ───────────────
      await test.step('Stage 5: Full Exit on first holding', async () => {
        await page.goto('/portfolio');
        await portfolioPage.sellBtn().first().click();
        await sellPage.waitForNavigation();
        await sellPage.assertSellFormOpened();
        await sellPage.selectFullExit();
        await sellPage.confirmFullExit();
        await sellPage.assertFullExitSuccess();
      });

      // ── STAGE 6: Portfolio — second holding still visible ─
      await test.step('Stage 6: Second holding still in portfolio after full exit of first', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        const countAfter = await portfolioPage.holdingItems().count();
        expect(countAfter).toBeGreaterThanOrEqual(1);
      });

      // ── STAGE 7: Reconciliation ───────────────────────────
      await test.step('Stage 7: Reconciliation shows buy + sell transactions', async () => {
        await reconciliationPage.gotoTransactions();
        await reconciliationPage.assertPageLoaded();
        await reconciliationPage.assertLatestTransactionVisible();
        await reconciliationPage.assertSummaryCardsHaveValues();
      });
    },
  );
});
