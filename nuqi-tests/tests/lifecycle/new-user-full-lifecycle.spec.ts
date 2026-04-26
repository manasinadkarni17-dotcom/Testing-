// ─────────────────────────────────────────────────────────────
//  S01 · Full Lifecycle — New Investor (Email + Password)
//  Tags: @smoke @e2e @regression @p0
//  Browsers: Chromium, Firefox
//  Devices: Desktop
//
//  Flow: Login (Email+PW) → KYC (Fresh) → Risk (Conservative)
//        → Invest (Plan) → Buy (Standard) → Portfolio
//        → Sell (Partial) → Reconciliation
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, TestKycData, TestPlan, TestBuyOrder, TestSellOrder } from '../../utils/test-data';
import { RiskProfile } from '../../types';
import path from 'path';

const DOC_FRONT  = path.join(__dirname, '../../fixtures/assets/passport-front.jpg');
const DOC_BACK   = path.join(__dirname, '../../fixtures/assets/passport-back.jpg');
const SELFIE_IMG = path.join(__dirname, '../../fixtures/assets/selfie.jpg');

test.describe('S01 · Full Lifecycle — New Investor', () => {

  test(
    'S01 · Complete investor lifecycle from registration to reconciliation',
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

      // ── STAGE 1: Login ──────────────────────────────────────
      await test.step('Stage 1: Login with Email + Password', async () => {
        await loginPage.openLoginPage();
        await loginPage.loginWithEmailPassword(TestUsers.newUser());
        await dashboardPage.assertDashboardLoaded();
        await expect(page).toHaveURL(/\/(dashboard|home|kyc|onboarding)/);
      });

      // ── STAGE 2: KYC ──────────────────────────────────────
      await test.step('Stage 2: Complete Fresh KYC', async () => {
        await dashboardPage.assertKycPromptVisible();
        await kycPage.clickStartKyc();
        await kycPage.fillPersonalDetails(TestKycData);
        await kycPage.fillIdentityDocument(TestKycData, DOC_FRONT, DOC_BACK);
        await kycPage.completeFaceVerification(SELFIE_IMG);
        await kycPage.fillAddressDetails(TestKycData);
        await kycPage.submitKyc();
        // Accept either success or pending verification
        const done    = await kycPage.kycSuccessScreen().isVisible({ timeout: 20_000 }).catch(() => false);
        const pending = await page.locator('.kyc-pending, h2:has-text("Under Review")').isVisible({ timeout: 5000 }).catch(() => false);
        expect(done || pending).toBe(true);
      });

      // ── STAGE 3: Risk Profiling ────────────────────────────
      await test.step('Stage 3: Complete Risk Profiling — Conservative', async () => {
        await riskPage.startRiskAssessment();
        await riskPage.answerQuestionnaire(RiskProfile.Conservative);
        await riskPage.submitAssessment();
        await riskPage.assertRiskResult(RiskProfile.Conservative);
        await riskPage.proceedToInvest();
      });

      // ── STAGE 4: Investment — Create Plan ─────────────────
      await test.step('Stage 4: Create Investment Plan', async () => {
        await investPage.openCreatePlan();
        await investPage.fillAndSubmitPlan(TestPlan);
        await investPage.assertPlanCreated();
      });

      // ── STAGE 5: Buy ──────────────────────────────────────
      await test.step('Stage 5: Standard Buy', async () => {
        await page.goto('/invest');
        await investPage.openDirectInvestment();
        await investPage.instrumentCards().first().click();
        await investPage.waitForNavigation();
        await buyPage.performStandardBuy(TestBuyOrder);
      });

      // ── STAGE 6: Portfolio ────────────────────────────────
      await test.step('Stage 6: View Portfolio — assert holding visible', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        await portfolioPage.assertChartVisible();
        await expect(portfolioPage.holdingItems().first()).toBeVisible({ timeout: 15_000 });
      });

      // ── STAGE 7: Sell (Partial) ───────────────────────────
      await test.step('Stage 7: Partial Sell — 50%', async () => {
        await portfolioPage.sellBtn().first().click();
        await sellPage.waitForNavigation();
        await sellPage.assertSellFormOpened();
        await sellPage.sellByPresetPercentage(50);
        await sellPage.confirmPartialSell();
        await sellPage.assertPartialSellSuccess();
      });

      // ── STAGE 8: Reconciliation ───────────────────────────
      await test.step('Stage 8: Reconciliation — verify buy + sell recorded', async () => {
        await reconciliationPage.gotoTransactions();
        await reconciliationPage.assertPageLoaded();
        await reconciliationPage.assertLatestTransactionVisible();
        await reconciliationPage.assertSummaryCardsHaveValues();
      });
    },
  );
});
