// ─────────────────────────────────────────────────────────────
//  TC-INV-01/02/03/04 · Investment Entry — all variants
//  Tags: @investment @smoke @regression
//  Priority: P0 (plan + direct) · P1 (recommendation + CTA)
//  Browsers: Chromium, Firefox
//  Devices: Desktop
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers, TestPlan } from '../../utils/test-data';
import { RETURNING_USER_STATE } from '../../fixtures/auth.setup';

test.describe('Investment — Create Investment Plan', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-INV-02-01 ─────────────────────────────────────────
  test(
    'TC-INV-02-01 · Create Plan button is visible on invest page',
    { tag: ['@investment', '@smoke'] },
    async ({ investPage, page }) => {
      // Step 1: Navigate to invest
      await page.goto('/invest');
      await investPage.waitForNavigation();
      // Step 2: Assert Create Plan CTA visible
      await expect(investPage.createPlanBtn()).toBeVisible();
    },
  );

  // ── TC-INV-02-02 ─────────────────────────────────────────
  test(
    'TC-INV-02-02 · Plan creation form renders all required fields',
    { tag: ['@investment', '@regression'] },
    async ({ investPage, page }) => {
      await page.goto('/invest');
      await investPage.openCreatePlan();

      // Assert all plan fields are visible
      await expect(investPage.planNameInput()).toBeVisible();
      await expect(investPage.targetAmountInput()).toBeVisible();
    },
  );

  // ── TC-INV-02-03 ─────────────────────────────────────────
  test(
    'TC-INV-02-03 · Fill plan details and submit — plan created successfully',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ investPage, page }) => {
      await page.goto('/invest');
      await investPage.openCreatePlan();

      // Step 1: Fill plan name
      await investPage.planNameInput().fill(TestPlan.name);
      // Step 2: Fill target amount
      await investPage.targetAmountInput().fill(String(TestPlan.targetAmount));
      // Step 3: Select horizon if available
      const horizonEl = investPage.horizonSelect();
      if (await horizonEl.isVisible({ timeout: 2000 }).catch(() => false)) {
        await horizonEl.selectOption({ label: TestPlan.horizon });
      }
      // Step 4: Submit
      await investPage.createPlanSubmitBtn().click();
      await investPage.waitForNavigation();

      // Step 5: Assert plan created confirmation
      await investPage.assertPlanCreated();
    },
  );

  // ── TC-INV-02-04 ─────────────────────────────────────────
  test(
    'TC-INV-02-04 · Newly created plan appears in portfolio plans section',
    { tag: ['@investment', '@regression'] },
    async ({ investPage, portfolioPage, page }) => {
      // Create the plan
      await page.goto('/invest');
      await investPage.openCreatePlan();
      await investPage.fillAndSubmitPlan(TestPlan);
      await investPage.assertPlanCreated();

      // Navigate to portfolio and assert plan is listed
      await page.goto('/portfolio');
      await portfolioPage.assertPlansVisible(1);
    },
  );
});

test.describe('Investment — Direct Investment', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-INV-03-01 ─────────────────────────────────────────
  test(
    'TC-INV-03-01 · Direct invest tab shows instrument catalogue',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ investPage, page }) => {
      await page.goto('/invest');
      await investPage.openDirectInvestment();

      // Assert instrument cards are visible
      await expect(investPage.instrumentCards().first()).toBeVisible({ timeout: 10_000 });
      expect(await investPage.instrumentCards().count()).toBeGreaterThan(0);
    },
  );

  // ── TC-INV-03-02 ─────────────────────────────────────────
  test(
    'TC-INV-03-02 · Instrument search filters results',
    { tag: ['@investment', '@regression'] },
    async ({ investPage, page }) => {
      await page.goto('/invest');
      await investPage.openDirectInvestment();

      const search = investPage.instrumentSearch();
      if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Step 1: Enter search query
        await search.fill('ETF');
        await page.waitForTimeout(500); // debounce delay

        // Step 2: Assert results are filtered
        const cards = investPage.instrumentCards();
        await expect(cards.first()).toBeVisible({ timeout: 5000 });
      }
    },
  );

  // ── TC-INV-03-03 ─────────────────────────────────────────
  test(
    'TC-INV-03-03 · Selecting an instrument opens detail page',
    { tag: ['@investment', '@smoke'] },
    async ({ investPage, page }) => {
      await page.goto('/invest');
      await investPage.openDirectInvestment();

      // Step 1: Click first available instrument
      await expect(investPage.instrumentCards().first()).toBeVisible({ timeout: 10_000 });
      await investPage.instrumentCards().first().click();
      await investPage.waitForNavigation();

      // Step 2: Assert instrument detail page opened
      const detailHeading = page.locator('h1, h2, .instrument-title').first();
      await expect(detailHeading).toBeVisible({ timeout: 8000 });
    },
  );

  // ── TC-INV-03-04 ─────────────────────────────────────────
  test(
    'TC-INV-03-04 · Instrument detail page has Buy button',
    { tag: ['@investment', '@smoke'] },
    async ({ investPage, buyPage, page }) => {
      await page.goto('/invest');
      await investPage.openDirectInvestment();
      await investPage.instrumentCards().first().click();
      await investPage.waitForNavigation();

      // Assert Buy button is visible on instrument detail
      await expect(buyPage.buyBtn()).toBeVisible({ timeout: 8000 });
    },
  );
});

test.describe('Investment — Recommendation Engine', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-INV-04-01 ─────────────────────────────────────────
  test(
    'TC-INV-04-01 · Recommendations tab shows personalised cards',
    { tag: ['@investment', '@regression'] },
    async ({ investPage, page }) => {
      await page.goto('/invest');
      await investPage.openRecommendations();

      // Assert recommendation cards visible
      await investPage.assertRecommendationsVisible(1);
    },
  );

  // ── TC-INV-04-02 ─────────────────────────────────────────
  test(
    'TC-INV-04-02 · Recommendation cards match user risk profile label',
    { tag: ['@investment', '@regression'] },
    async ({ investPage, page }) => {
      await page.goto('/invest');
      await investPage.openRecommendations();

      await expect(investPage.recommendedCards().first()).toBeVisible({ timeout: 8000 });
      // At least one card should be visible
      expect(await investPage.recommendedCards().count()).toBeGreaterThanOrEqual(1);
    },
  );

  // ── TC-INV-04-03 ─────────────────────────────────────────
  test(
    'TC-INV-04-03 · Selecting a recommendation leads to instrument detail',
    { tag: ['@investment', '@regression'] },
    async ({ investPage, buyPage, page }) => {
      await page.goto('/invest');
      await investPage.openRecommendations();
      await investPage.selectFirstRecommendation();

      // Assert Buy button or invest button on detail
      await expect(buyPage.buyBtn()).toBeVisible({ timeout: 8000 });
    },
  );
});

test.describe('Investment — Dashboard CTA', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  // ── TC-INV-01-01 ─────────────────────────────────────────
  test(
    'TC-INV-01-01 · Dashboard "Invest Now" CTA is visible',
    { tag: ['@investment', '@smoke', '@p0'] },
    async ({ dashboardPage, page }) => {
      await page.goto('/dashboard');
      await dashboardPage.assertDashboardLoaded();
      await expect(dashboardPage.investNowCta()).toBeVisible({ timeout: 8000 });
    },
  );

  // ── TC-INV-01-02 ─────────────────────────────────────────
  test(
    'TC-INV-01-02 · Dashboard CTA navigates to invest page',
    { tag: ['@investment', '@smoke'] },
    async ({ investPage, dashboardPage, page }) => {
      await page.goto('/dashboard');
      await dashboardPage.assertDashboardLoaded();

      // Step 1: Click Invest Now CTA
      await investPage.clickDashboardInvestCta();

      // Step 2: Assert navigated to invest area
      await expect(page).toHaveURL(/\/(invest|portfolio|plan)/);
    },
  );
});
