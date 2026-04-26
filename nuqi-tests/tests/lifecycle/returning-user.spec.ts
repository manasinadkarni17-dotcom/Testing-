// ─────────────────────────────────────────────────────────────
//  S04 · Returning User — skip KYC + skip risk + full exit
//  S09 · Fast-Track — verified user buys in fewest steps
//  Tags: @smoke @e2e @regression @p0
//  Browsers: Chromium, Firefox
//  Devices: Desktop
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, TestBuyOrder } from '../../utils/test-data';
import { RETURNING_USER_STATE } from '../../fixtures/auth.setup';

// ── S04 ──────────────────────────────────────────────────────

test.describe('S04 · Returning User — Skip KYC + Skip Risk + Full Exit', () => {

  test(
    'S04 · OTP login → skip KYC → skip risk → recommend → buy → sell all → reconcile',
    { tag: ['@smoke', '@e2e', '@regression', '@p0'] },
    async ({
      page,
      loginPage,
      dashboardPage,
      kycPage,
      riskPage,
      investPage,
      buyPage,
      portfolioPage,
      sellPage,
      reconciliationPage,
    }) => {

      // ── STAGE 1: Login (OTP) ───────────────────────────────
      await test.step('Stage 1: Login via Email + OTP', async () => {
        const creds = TestUsers.otpUser();
        const otp   = process.env.TEST_OTP ?? '123456';
        await loginPage.navigate();
        await loginPage.loginWithOtp(creds.email, otp);
        await dashboardPage.assertDashboardLoaded();
      });

      // ── STAGE 2: KYC — Already Verified ──────────────────
      await test.step('Stage 2: KYC already verified — no prompt shown', async () => {
        await dashboardPage.assertNoKycPrompt();
        await kycPage.assertKycAlreadyVerified();
      });

      // ── STAGE 3: Risk — Already Completed ────────────────
      await test.step('Stage 3: Risk profile already complete — no prompt', async () => {
        await dashboardPage.assertNoRiskPrompt();
        await riskPage.assertRiskAlreadyComplete();
      });

      // ── STAGE 4: Invest via Recommendation Engine ─────────
      await test.step('Stage 4: Invest via Recommendation Engine', async () => {
        await page.goto('/invest');
        await investPage.openRecommendations();
        await investPage.assertRecommendationsVisible(1);
        await investPage.selectFirstRecommendation();
      });

      // ── STAGE 5: Buy (Standard) ───────────────────────────
      await test.step('Stage 5: Standard Buy', async () => {
        await buyPage.performStandardBuy(TestBuyOrder);
      });

      // ── STAGE 6: Portfolio ────────────────────────────────
      await test.step('Stage 6: View Portfolio', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        await expect(portfolioPage.holdingItems().first()).toBeVisible({ timeout: 15_000 });
      });

      // ── STAGE 7: Sell — Full Exit ─────────────────────────
      await test.step('Stage 7: Full Exit', async () => {
        await portfolioPage.sellBtn().first().click();
        await sellPage.waitForNavigation();
        await sellPage.assertSellFormOpened();
        await sellPage.selectFullExit();
        await sellPage.confirmFullExit();
        await sellPage.assertFullExitSuccess();
      });

      // ── STAGE 8: Reconciliation ───────────────────────────
      await test.step('Stage 8: Reconciliation — buy + sell recorded', async () => {
        await reconciliationPage.gotoTransactions();
        await reconciliationPage.assertPageLoaded();
        await reconciliationPage.assertLatestTransactionVisible();
      });
    },
  );
});

// ── S09: Fast-Track ───────────────────────────────────────────

test.describe('S09 · Fast-Track — Verified User Buys in Fewest Steps', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  test(
    'S09 · Dashboard CTA → buy → portfolio (minimum steps)',
    { tag: ['@smoke', '@e2e', '@p0'] },
    async ({
      page,
      dashboardPage,
      investPage,
      buyPage,
      portfolioPage,
      reconciliationPage,
    }) => {

      // ── STAGE 1: Already logged in (storageState) ─────────
      await test.step('Stage 1: Navigate to dashboard (pre-auth)', async () => {
        await page.goto('/dashboard');
        await dashboardPage.assertDashboardLoaded();
        // Assert no prompts (verified user)
        await dashboardPage.assertNoKycPrompt();
        await dashboardPage.assertNoRiskPrompt();
      });

      // ── STAGE 2: Click Invest CTA ─────────────────────────
      await test.step('Stage 2: Click Invest Now CTA', async () => {
        await investPage.clickDashboardInvestCta();
        await expect(page).toHaveURL(/\/(invest|portfolio|plan)/);
      });

      // ── STAGE 3: Select instrument ────────────────────────
      await test.step('Stage 3: Select instrument from catalogue', async () => {
        await investPage.openDirectInvestment();
        await investPage.instrumentCards().first().click();
        await investPage.waitForNavigation();
      });

      // ── STAGE 4: Buy (Standard) ───────────────────────────
      await test.step('Stage 4: Standard Buy', async () => {
        await buyPage.performStandardBuy(TestBuyOrder);
      });

      // ── STAGE 5: Portfolio ────────────────────────────────
      await test.step('Stage 5: Assert holding in portfolio', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        await expect(portfolioPage.holdingItems().first()).toBeVisible({ timeout: 15_000 });
      });

      // ── STAGE 6: Reconciliation ───────────────────────────
      await test.step('Stage 6: Reconciliation check', async () => {
        await reconciliationPage.gotoTransactions();
        await reconciliationPage.assertLatestTransactionVisible();
      });
    },
  );
});
