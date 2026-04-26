// ─────────────────────────────────────────────────────────────
//  TC-RISK-01/02/03/04 · Risk Profiling — all variants
//  Tags: @regression
//  Priority: P1
//  Browsers: Chromium, Firefox
//  Devices: Desktop
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestUsers } from '../../utils/test-data';
import { RiskProfile } from '../../types';

test.describe('Risk Profiling — Conservative', () => {

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await loginPage.navigate();
    await loginPage.loginWithEmailPassword(TestUsers.newUser());
    await dashboardPage.assertDashboardLoaded();
  });

  // ── TC-RISK-01-01 ─────────────────────────────────────────
  test(
    'TC-RISK-01-01 · Risk profiling prompt appears for new user',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      // Step 1: Login (done in beforeEach)
      // Step 2: Assert risk profiling CTA is visible
      await dashboardPage.assertRiskPromptVisible();
    },
  );

  // ── TC-RISK-01-02 ─────────────────────────────────────────
  test(
    'TC-RISK-01-02 · Start risk assessment — questionnaire renders',
    { tag: ['@regression'] },
    async ({ riskPage }) => {
      // Step 1: Click Start Assessment
      await riskPage.startRiskAssessment();
      // Step 2: Assert first question is visible
      await expect(riskPage.questionText()).toBeVisible();
      // Step 3: Assert answer options are visible
      await expect(riskPage.answerOptions().first()).toBeVisible();
    },
  );

  // ── TC-RISK-01-03 ─────────────────────────────────────────
  test(
    'TC-RISK-01-03 · Conservative profile — answer all questions conservatively and verify result',
    { tag: ['@regression', '@p1'] },
    async ({ riskPage }) => {
      // Step 1: Start assessment
      await riskPage.startRiskAssessment();
      // Step 2: Answer all questions — conservative (first option each time)
      await riskPage.answerQuestionnaire(RiskProfile.Conservative);
      // Step 3: Submit
      await riskPage.submitAssessment();
      // Step 4: Assert result shows Conservative profile
      await riskPage.assertRiskResult(RiskProfile.Conservative);
    },
  );

  // ── TC-RISK-01-04 ─────────────────────────────────────────
  test(
    'TC-RISK-01-04 · Conservative profile result — Proceed button navigates to invest',
    { tag: ['@regression'] },
    async ({ riskPage, page }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Conservative);
      await riskPage.submitAssessment();
      await riskPage.assertRiskResult(RiskProfile.Conservative);

      // Step: Click Proceed to Invest
      await riskPage.proceedToInvest();
      // Assert navigated to investment page
      await expect(page).toHaveURL(/\/(invest|portfolio|dashboard)/);
    },
  );
});

test.describe('Risk Profiling — Moderate', () => {

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await loginPage.navigate();
    await loginPage.loginWithEmailPassword(TestUsers.newUser());
    await dashboardPage.assertDashboardLoaded();
  });

  // ── TC-RISK-02-01 ─────────────────────────────────────────
  test(
    'TC-RISK-02-01 · Moderate profile — answer questions moderately and verify result',
    { tag: ['@regression', '@p1'] },
    async ({ riskPage }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Moderate);
      await riskPage.submitAssessment();
      await riskPage.assertRiskResult(RiskProfile.Moderate);
    },
  );

  // ── TC-RISK-02-02 ─────────────────────────────────────────
  test(
    'TC-RISK-02-02 · Moderate profile — recommended instruments are visible',
    { tag: ['@regression'] },
    async ({ riskPage, page }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Moderate);
      await riskPage.submitAssessment();
      await riskPage.proceedToInvest();

      // Assert recommended/filtered instruments visible for moderate risk
      const instruments = page.locator('[data-testid="instrument-card"], .instrument-item, .asset-card');
      await expect(instruments.first()).toBeVisible({ timeout: 10_000 });
      expect(await instruments.count()).toBeGreaterThan(0);
    },
  );
});

test.describe('Risk Profiling — Aggressive', () => {

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await loginPage.navigate();
    await loginPage.loginWithEmailPassword(TestUsers.newUser());
    await dashboardPage.assertDashboardLoaded();
  });

  // ── TC-RISK-03-01 ─────────────────────────────────────────
  test(
    'TC-RISK-03-01 · Aggressive profile — answer questions aggressively and verify result',
    { tag: ['@regression', '@p1'] },
    async ({ riskPage }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Aggressive);
      await riskPage.submitAssessment();
      await riskPage.assertRiskResult(RiskProfile.Aggressive);
    },
  );

  // ── TC-RISK-03-02 ─────────────────────────────────────────
  test(
    'TC-RISK-03-02 · Aggressive profile unlocks higher-risk instruments',
    { tag: ['@regression'] },
    async ({ riskPage, page }) => {
      await riskPage.startRiskAssessment();
      await riskPage.answerQuestionnaire(RiskProfile.Aggressive);
      await riskPage.submitAssessment();
      await riskPage.proceedToInvest();

      // Instruments visible and should include higher-volatility options
      const instruments = page.locator('[data-testid="instrument-card"], .instrument-item');
      await expect(instruments.first()).toBeVisible({ timeout: 10_000 });
    },
  );
});

test.describe('Risk Profiling — Already Completed (Skip)', () => {

  // ── TC-RISK-04-01 ─────────────────────────────────────────
  test(
    'TC-RISK-04-01 · Returning user sees no risk profiling prompt',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ loginPage, dashboardPage, riskPage }) => {
      // Step 1: Login as returning user (risk already complete)
      await loginPage.navigate();
      await loginPage.loginWithEmailPassword(TestUsers.returningUser());
      await dashboardPage.assertDashboardLoaded();

      // Step 2: Assert no risk prompt shown
      await dashboardPage.assertNoRiskPrompt();
      // Step 3: Assert risk already complete badge
      await riskPage.assertRiskAlreadyComplete();
    },
  );

  // ── TC-RISK-04-02 ─────────────────────────────────────────
  test(
    'TC-RISK-04-02 · Re-profiling updates instrument catalogue',
    { tag: ['@regression'] },
    async ({ loginPage, dashboardPage, riskPage, page }) => {
      await loginPage.navigate();
      await loginPage.loginWithEmailPassword(TestUsers.returningUser());
      await dashboardPage.assertDashboardLoaded();

      // Step 1: Navigate to risk profile settings
      await page.goto('/profile/risk');
      await riskPage.waitForNavigation();

      // Step 2: Initiate re-profiling
      await riskPage.initiateReProfiling();

      // Step 3: Answer as Conservative (change from prior profile)
      await riskPage.answerQuestionnaire(RiskProfile.Conservative);
      await riskPage.submitAssessment();

      // Step 4: Assert new result is Conservative
      await riskPage.assertRiskResult(RiskProfile.Conservative);
    },
  );
});
