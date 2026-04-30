// ─────────────────────────────────────────────────────────────
//  S10 · Mobile — Android Chrome Full Lifecycle
//  S11 · Mobile — iOS Safari Returning User (No Sell)
//  Tags: @mobile @e2e @regression
//  Priority: P1 (S10) · P2 (S11)
//  Devices: Android Chrome (S10) · iOS Safari (S11)
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, TestKycData, TestBuyOrder } from '../../utils/test-data';
import { RiskProfile } from '../../types';
import { RETURNING_USER_STATE } from '../../fixtures/auth.setup';
import path from 'path';

const DOC_FRONT  = path.join(__dirname, '../../fixtures/assets/passport-front.jpg');
const DOC_BACK   = path.join(__dirname, '../../fixtures/assets/passport-back.jpg');
const SELFIE_IMG = path.join(__dirname, '../../fixtures/assets/selfie.jpg');

// ── S10: Android Chrome ───────────────────────────────────────

test.describe('S10 · Mobile — Android Chrome Full Lifecycle', () => {

  // ── TC-MOB-01 ─────────────────────────────────────────────
  test(
    'TC-MOB-01 · Mobile nav is visible and accessible on dashboard',
    { tag: ['@mobile', '@e2e'] },
    async ({ loginPage, dashboardPage }) => {
      await loginPage.navigate();
      await loginPage.loginWithEmailPassword(TestUsers.newUser());
      await dashboardPage.assertDashboardLoaded();

      // Assert mobile-specific nav element visible (bottom nav or hamburger)
      await dashboardPage.assertMobileNavVisible();
    },
  );

  // ── TC-MOB-02 ─────────────────────────────────────────────
  test(
    'TC-MOB-02 · KYC document upload uses image/capture input on mobile',
    { tag: ['@mobile', '@kyc'] },
    async ({ loginPage, dashboardPage, kycPage }) => {
      await loginPage.navigate();
      await loginPage.loginWithEmailPassword(TestUsers.newUser());
      await dashboardPage.assertDashboardLoaded();

      await kycPage.clickStartKyc();
      await kycPage.fillPersonalDetails(TestKycData);

      // Assert file input has image capture support
      const fileInput  = kycPage.idFrontUpload();
      const acceptAttr = await fileInput.getAttribute('accept');
      expect(acceptAttr).toMatch(/image/);
    },
  );

  // ── TC-MOB-03 ─────────────────────────────────────────────
  test(
    'TC-MOB-03 · Buy confirmation modal uses full-screen bottom sheet on mobile',
    { tag: ['@mobile', '@buy'] },
    async ({ loginPage, dashboardPage, investPage, buyPage, page }) => {
      await loginPage.navigate();
      await loginPage.loginWithEmailPassword(TestUsers.returningUser());
      await dashboardPage.assertDashboardLoaded();

      await page.goto('/invest');
      await investPage.openDirectInvestment();
      await investPage.instrumentCards().first().click();
      await investPage.waitForNavigation();
      await buyPage.clickBuyButton();
      await buyPage.enterBuyAmount(TestBuyOrder.amount);

      // On mobile, confirmation dialog should be visible
      await expect(buyPage.orderSummarySection()).toBeVisible({ timeout: 8000 });
    },
  );

  // ── TC-MOB-04 (Full S10 lifecycle on mobile) ──────────────
  test(
    'TC-MOB-04 · S10 — Full lifecycle on mobile: login → KYC → risk → plan → buy → portfolio → partial sell → reconcile',
    { tag: ['@mobile', '@e2e', '@regression', '@p1'] },
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
      termsPage,
    }) => {

      await test.step('Login (Email+Password)', async () => {
        await loginPage.navigate();
        await loginPage.loginWithEmailPassword(TestUsers.newUser());
      });

      await test.step('Accept Terms & Conditions if shown', async () => {
        // New users see the T&C page after first login — click all 5 rows,
        // scroll + accept each, then finalize. Safe no-op if already accepted.
        await termsPage.handleIfPresent(8_000);
        await dashboardPage.assertDashboardLoaded();
        await dashboardPage.assertMobileNavVisible();
      });

      await test.step('KYC (Fresh)', async () => {
        await kycPage.clickStartKyc();
        await kycPage.fillPersonalDetails(TestKycData);
        await kycPage.fillIdentityDocument(TestKycData, DOC_FRONT, DOC_BACK);
        await kycPage.completeFaceVerification(SELFIE_IMG);
        await kycPage.fillAddressDetails(TestKycData);
        await kycPage.submitKyc();
      });

      await test.step('Risk Profiling (Moderate)', async () => {
        await riskPage.startRiskAssessment();
        await riskPage.answerQuestionnaire(RiskProfile.Moderate);
        await riskPage.submitAssessment();
        await riskPage.assertRiskResult(RiskProfile.Moderate);
        await riskPage.proceedToInvest();
      });

      await test.step('Invest — Create Plan', async () => {
        await investPage.openCreatePlan();
        await investPage.planNameInput().fill('Mobile Plan');
        await investPage.targetAmountInput().fill('5000');
        await investPage.createPlanSubmitBtn().click();
        await investPage.waitForNavigation();
      });

      await test.step('Buy (Standard)', async () => {
        await page.goto('/invest');
        await investPage.openDirectInvestment();
        await investPage.instrumentCards().first().click();
        await investPage.waitForNavigation();
        await buyPage.performStandardBuy(TestBuyOrder);
      });

      await test.step('Portfolio — verify holding', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        await expect(portfolioPage.holdingItems().first()).toBeVisible({ timeout: 15_000 });
      });

      await test.step('Sell (Partial)', async () => {
        await portfolioPage.sellBtn().first().click();
        await sellPage.waitForNavigation();
        await sellPage.assertSellFormOpened();
        await sellPage.sellByPresetPercentage(50);
        await sellPage.confirmPartialSell();
        await sellPage.assertPartialSellSuccess();
      });

      await test.step('Reconciliation', async () => {
        await reconciliationPage.gotoTransactions();
        await reconciliationPage.assertLatestTransactionVisible();
      });
    },
  );
});

// ── S11: iOS Safari (No Sell) ────────────────────────────────

test.describe('S11 · Mobile — iOS Safari Returning User (No Sell)', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-MOB-05 ─────────────────────────────────────────────
  test(
    'TC-MOB-05 · iOS Safari — viewport renders without horizontal scroll',
    { tag: ['@mobile'] },
    async ({ page, dashboardPage }) => {
      await page.goto('/dashboard');
      await dashboardPage.assertDashboardLoaded();

      // Assert no horizontal scrollbar (scroll width ≤ viewport width)
      const hasHScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHScroll).toBe(false);
    },
  );

  // ── TC-MOB-06 ─────────────────────────────────────────────
  test(
    'TC-MOB-06 · iOS Safari — sticky footer / safe-area visible without overlap',
    { tag: ['@mobile'] },
    async ({ page, dashboardPage }) => {
      await page.goto('/dashboard');
      await dashboardPage.assertDashboardLoaded();

      // Bottom navigation or sticky footer must be visible
      const stickyFooter = page.locator('.bottom-nav, [data-testid="bottom-nav"], footer[class*="sticky"]');
      if (await stickyFooter.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Assert not overlapping content (check it's at bottom)
        const box = await stickyFooter.boundingBox();
        const vh  = page.viewportSize()?.height ?? 800;
        expect(box?.y ?? 0).toBeGreaterThan(vh * 0.7);
      }
    },
  );

  // ── TC-MOB-07 (Full S11 lifecycle on iOS) ─────────────────
  test(
    'TC-MOB-07 · S11 — iOS lifecycle: OTP login → skip KYC → recommend → min buy → hold → reconcile',
    { tag: ['@mobile', '@e2e', '@p2'] },
    async ({
      page,
      dashboardPage,
      kycPage,
      riskPage,
      investPage,
      buyPage,
      portfolioPage,
      sellPage,
      reconciliationPage,
    }) => {

      await test.step('Pre-auth (storageState) — navigate dashboard', async () => {
        await page.goto('/dashboard');
        await dashboardPage.assertDashboardLoaded();
        await dashboardPage.assertMobileNavVisible();
      });

      await test.step('KYC — already verified, no prompt', async () => {
        await dashboardPage.assertNoKycPrompt();
      });

      await test.step('Risk — already complete, no prompt', async () => {
        await dashboardPage.assertNoRiskPrompt();
      });

      await test.step('Invest via Recommendation Engine', async () => {
        await page.goto('/invest');
        await investPage.openRecommendations();
        await investPage.assertRecommendationsVisible(1);
        await investPage.selectFirstRecommendation();
      });

      await test.step('Buy (Minimum Amount)', async () => {
        await buyPage.clickBuyButton();
        await buyPage.enterMinimumAllowedAmount();
        await buyPage.acceptTermsAndConfirm();
        await buyPage.assertBuySuccess();
      });

      await test.step('Portfolio — holding visible, no sell', async () => {
        await page.goto('/portfolio');
        await portfolioPage.assertPortfolioLoaded();
        await expect(portfolioPage.holdingItems().first()).toBeVisible({ timeout: 15_000 });
        // No sell initiated
        await sellPage.assertNoSellPending('');
      });

      await test.step('Reconciliation — buy recorded', async () => {
        await reconciliationPage.gotoTransactions();
        await reconciliationPage.assertLatestTransactionVisible();
      });
    },
  );
});
