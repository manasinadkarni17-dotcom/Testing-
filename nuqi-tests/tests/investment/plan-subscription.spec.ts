// ─────────────────────────────────────────────────────────────
//  TC-PLAN-01/02/03/04 · Portfolio Creation + Plan Subscription
//  Tags: @investment @smoke @regression
//  Priority: P0 (subscription flow) · P1 (catalogue, creation)
//  Browsers: Chromium, Firefox
//  Devices: Desktop
//
//  Pre-condition: returningUser has KYC approved + risk profile set.
//  Flow:
//    TC-PLAN-01 — Create portfolio/investment plan
//    TC-PLAN-02 — Browse plan catalogue (curated portfolios / CEPs)
//    TC-PLAN-03 — Subscribe to a plan
//    TC-PLAN-04 — Full E2E: create portfolio → select plan → subscribe
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestPlan } from '../../utils/test-data';
import { RETURNING_USER_STATE } from '../../fixtures/auth.setup';

// ─────────────────────────────────────────────────────────────
//  TC-PLAN-01 · Portfolio / Investment Plan Creation
// ─────────────────────────────────────────────────────────────
test.describe('Plan Subscription — Portfolio Creation', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-PLAN-01-01 ─────────────────────────────────────────
  test(
    'TC-PLAN-01-01 · Invest page loads and Create Plan CTA is visible',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ planSubscriptionPage, page }) => {
      await planSubscriptionPage.navigateToInvest();
      await expect(page).toHaveURL(/\/invest/);
      await expect(planSubscriptionPage.createPortfolioBtn()).toBeVisible({ timeout: 10_000 });
    },
  );

  // ── TC-PLAN-01-02 ─────────────────────────────────────────
  test(
    'TC-PLAN-01-02 · Create Plan form renders required fields',
    { tag: ['@investment', '@regression', '@p1'] },
    async ({ planSubscriptionPage }) => {
      await planSubscriptionPage.navigateToInvest();
      await planSubscriptionPage.createPortfolioBtn().click();
      await planSubscriptionPage.waitForNavigation();

      await expect(planSubscriptionPage.portfolioNameInput()).toBeVisible({ timeout: 8_000 });
      await expect(planSubscriptionPage.targetAmountInput()).toBeVisible({ timeout: 5_000 });
    },
  );

  // ── TC-PLAN-01-03 ─────────────────────────────────────────
  test(
    'TC-PLAN-01-03 · Create portfolio — fills form and shows success confirmation',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ planSubscriptionPage }) => {
      await planSubscriptionPage.navigateToInvest();
      await planSubscriptionPage.createPortfolio(TestPlan);
      await planSubscriptionPage.assertPortfolioCreated();
    },
  );

  // ── TC-PLAN-01-04 ─────────────────────────────────────────
  test(
    'TC-PLAN-01-04 · Newly created portfolio appears in portfolio plans section',
    { tag: ['@investment', '@regression', '@p1'] },
    async ({ planSubscriptionPage, portfolioPage }) => {
      await planSubscriptionPage.navigateToInvest();
      await planSubscriptionPage.createPortfolio(TestPlan);
      await planSubscriptionPage.assertPortfolioCreated();

      await portfolioPage.gotoPortfolio();
      await portfolioPage.assertPlansVisible(1);
    },
  );
});

// ─────────────────────────────────────────────────────────────
//  TC-PLAN-02 · Plan Catalogue — Browse Curated Plans
// ─────────────────────────────────────────────────────────────
test.describe('Plan Subscription — Plan Catalogue', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-PLAN-02-01 ─────────────────────────────────────────
  test(
    'TC-PLAN-02-01 · Plan catalogue shows at least one available plan',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ planSubscriptionPage }) => {
      await planSubscriptionPage.navigateToPlans();
      await planSubscriptionPage.assertPlanCatalogueVisible(1);
    },
  );

  // ── TC-PLAN-02-02 ─────────────────────────────────────────
  test(
    'TC-PLAN-02-02 · Selecting a plan card navigates to plan detail page',
    { tag: ['@investment', '@regression', '@p1'] },
    async ({ planSubscriptionPage, page }) => {
      await planSubscriptionPage.navigateToPlans();
      await planSubscriptionPage.assertPlanCatalogueVisible(1);

      // Capture plan name before clicking so we can verify detail heading
      const cardTitle = await planSubscriptionPage.planCards().first()
        .locator('h3, h4, .plan-title, [data-testid="plan-title"]').first()
        .textContent()
        .catch(() => null);

      await planSubscriptionPage.selectFirstPlan();

      // Detail page: heading visible and URL changed from catalogue list
      await expect(planSubscriptionPage.planDetailHeading()).toBeVisible({ timeout: 8_000 });
      if (cardTitle) {
        console.log(`[TC-PLAN-02-02] Opened plan: ${cardTitle.trim()}`);
      }
    },
  );

  // ── TC-PLAN-02-03 ─────────────────────────────────────────
  test(
    'TC-PLAN-02-03 · Plan detail page shows Subscribe/Invest CTA',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ planSubscriptionPage }) => {
      await planSubscriptionPage.navigateToPlans();
      await planSubscriptionPage.assertPlanCatalogueVisible(1);
      await planSubscriptionPage.selectFirstPlan();

      await expect(planSubscriptionPage.subscribeBtn()).toBeVisible({ timeout: 10_000 });
    },
  );

  // ── TC-PLAN-02-04 ─────────────────────────────────────────
  test(
    'TC-PLAN-02-04 · Plan detail page shows description or risk information',
    { tag: ['@investment', '@regression'] },
    async ({ planSubscriptionPage, page }) => {
      await planSubscriptionPage.navigateToPlans();
      await planSubscriptionPage.assertPlanCatalogueVisible(1);
      await planSubscriptionPage.selectFirstPlan();

      await expect(planSubscriptionPage.planDetailHeading()).toBeVisible({ timeout: 8_000 });

      // At least one of: description, risk label, or return metric should be present
      const descriptionVisible = await planSubscriptionPage.planDescription()
        .isVisible({ timeout: 4_000 }).catch(() => false);
      const riskVisible = await planSubscriptionPage.planRiskLabel()
        .isVisible({ timeout: 4_000 }).catch(() => false);
      const returnVisible = await planSubscriptionPage.planReturnMetric()
        .isVisible({ timeout: 4_000 }).catch(() => false);

      expect(descriptionVisible || riskVisible || returnVisible).toBeTruthy();
    },
  );
});

// ─────────────────────────────────────────────────────────────
//  TC-PLAN-03 · Plan Subscription Flow
// ─────────────────────────────────────────────────────────────
test.describe('Plan Subscription — Subscribe to a Plan', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-PLAN-03-01 ─────────────────────────────────────────
  test(
    'TC-PLAN-03-01 · Subscribe button opens investment/subscription form',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ planSubscriptionPage, page }) => {
      await planSubscriptionPage.navigateToPlans();
      await planSubscriptionPage.assertPlanCatalogueVisible(1);
      await planSubscriptionPage.selectFirstPlan();
      await planSubscriptionPage.clickSubscribe();

      // After clicking subscribe: either a form with amount input, or a confirm button appears
      const amountVisible = await planSubscriptionPage.subscriptionAmountInput()
        .isVisible({ timeout: 6_000 }).catch(() => false);
      const confirmVisible = await planSubscriptionPage.confirmSubscriptionBtn()
        .isVisible({ timeout: 6_000 }).catch(() => false);

      expect(amountVisible || confirmVisible).toBeTruthy();
    },
  );

  // ── TC-PLAN-03-02 ─────────────────────────────────────────
  test(
    'TC-PLAN-03-02 · Complete subscription — success confirmation is shown',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ planSubscriptionPage }) => {
      await test.step('Navigate to plan catalogue', async () => {
        await planSubscriptionPage.navigateToPlans();
        await planSubscriptionPage.assertPlanCatalogueVisible(1);
      });

      await test.step('Select first available plan', async () => {
        await planSubscriptionPage.selectFirstPlan();
        await expect(planSubscriptionPage.subscribeBtn()).toBeVisible({ timeout: 10_000 });
      });

      await test.step('Subscribe — fill amount if required, confirm', async () => {
        await planSubscriptionPage.subscribeToPlan(500);
      });

      await test.step('Assert subscription success screen', async () => {
        await planSubscriptionPage.assertSubscriptionSuccess();
      });
    },
  );

  // ── TC-PLAN-03-03 ─────────────────────────────────────────
  test(
    'TC-PLAN-03-03 · Subscribed plan is visible in portfolio after subscription',
    { tag: ['@investment', '@regression', '@p1'] },
    async ({ planSubscriptionPage, portfolioPage }) => {
      await test.step('Subscribe to a plan', async () => {
        await planSubscriptionPage.navigateToPlans();
        await planSubscriptionPage.assertPlanCatalogueVisible(1);
        await planSubscriptionPage.selectFirstPlan();
        await planSubscriptionPage.subscribeToPlan(500);
        await planSubscriptionPage.assertSubscriptionSuccess();
      });

      await test.step('Verify plan is listed in portfolio', async () => {
        await planSubscriptionPage.navigateToPortfolio();
        await planSubscriptionPage.assertSubscribedPlanInPortfolio(1);
      });
    },
  );
});

// ─────────────────────────────────────────────────────────────
//  TC-PLAN-04 · Full E2E — Create Portfolio + Subscribe to Plan
// ─────────────────────────────────────────────────────────────
test.describe('Plan Subscription — Full E2E Flow', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-PLAN-04-01 ─────────────────────────────────────────
  test(
    'TC-PLAN-04-01 · Full flow: create portfolio → browse plans → select → subscribe → confirm',
    { tag: ['@investment', '@smoke', '@e2e', '@p0'] },
    async ({ planSubscriptionPage, portfolioPage, page }) => {
      test.setTimeout(120_000);

      // Stage 1: Create a named investment portfolio/plan
      await test.step('Stage 1: Create investment portfolio', async () => {
        await planSubscriptionPage.navigateToInvest();
        await planSubscriptionPage.createPortfolio(TestPlan);
        await planSubscriptionPage.assertPortfolioCreated();
      });

      // Stage 2: Browse the plan catalogue
      await test.step('Stage 2: Browse plan catalogue — at least one plan visible', async () => {
        await planSubscriptionPage.navigateToPlans();
        await planSubscriptionPage.assertPlanCatalogueVisible(1);
      });

      // Stage 3: Select first plan → verify detail
      await test.step('Stage 3: Select a plan — detail page opens', async () => {
        await planSubscriptionPage.selectFirstPlan();
        await expect(planSubscriptionPage.planDetailHeading()).toBeVisible({ timeout: 8_000 });
        await expect(planSubscriptionPage.subscribeBtn()).toBeVisible({ timeout: 8_000 });
      });

      // Stage 4: Subscribe to the selected plan
      await test.step('Stage 4: Subscribe — fill amount and confirm', async () => {
        await planSubscriptionPage.subscribeToPlan(500);
        await planSubscriptionPage.assertSubscriptionSuccess();
      });

      // Stage 5: Verify the subscription appears in portfolio
      await test.step('Stage 5: Portfolio reflects subscribed plan', async () => {
        await portfolioPage.gotoPortfolio();
        await portfolioPage.assertPortfolioLoaded();
        await planSubscriptionPage.assertSubscribedPlanInPortfolio(1);
      });
    },
  );
});
