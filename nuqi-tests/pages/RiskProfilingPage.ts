// ─────────────────────────────────────────────────────────────
//  RiskProfilingPage — Conservative · Moderate · Aggressive
//  URL: https://uat.nuqiwealth.com/risk-profiling
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { RiskProfile } from '../types';

export class RiskProfilingPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────
  readonly riskBanner         = () => this.page.locator('[data-testid="risk-banner"], .risk-prompt, section:has-text("Risk Profile")').first();
  readonly startRiskBtn       = () => this.page.locator('[data-testid="start-risk"], button:has-text("Start Assessment"), button:has-text("Take Quiz"), button:has-text("Begin")').first();
  readonly riskCompletedBadge = () => this.page.locator('[data-testid="risk-complete"], .risk-badge, span:has-text("Profile Set"), [aria-label*="risk profile"]').first();

  // Questionnaire
  readonly questionText       = () => this.page.locator('[data-testid="risk-question"], .question-text, h3.question').first();
  readonly answerOptions      = () => this.page.locator('[data-testid="risk-option"], .answer-option, [role="radio"]');
  readonly nextQuestionBtn    = () => this.page.locator('[data-testid="risk-next"], button:has-text("Next")').first();
  readonly submitRiskBtn      = () => this.page.locator('[data-testid="risk-submit"], button:has-text("Submit"), button:has-text("Confirm")').first();

  // Result screen
  readonly riskResultCard     = () => this.page.locator('[data-testid="risk-result"], .risk-result, .profile-result').first();
  readonly riskProfileLabel   = () => this.page.locator('[data-testid="risk-label"], .risk-profile-name, h2.profile-title').first();
  readonly proceedBtn         = () => this.page.locator('[data-testid="proceed-invest"], button:has-text("Proceed"), button:has-text("Start Investing"), button:has-text("Continue")').first();

  // Re-profiling (returning user)
  readonly changeProfileLink  = () => this.page.locator('[data-testid="change-risk"], a:has-text("Change Profile"), button:has-text("Re-take")').first();

  constructor(page: Page) {
    super(page);
  }

  // ── Status helpers ─────────────────────────────────────────

  async isAlreadyComplete(): Promise<boolean> {
    return this.riskCompletedBadge().isVisible({ timeout: 3000 }).catch(() => false);
  }

  // ── TC-RISK-00: Already completed — assert skip ────────────

  async assertRiskAlreadyComplete(): Promise<void> {
    await expect(this.riskCompletedBadge()).toBeVisible();
    await expect(this.riskBanner()).not.toBeVisible();
  }

  // ── TC-RISK-01 Step 1: Start assessment ───────────────────

  async startRiskAssessment(): Promise<void> {
    await expect(this.startRiskBtn()).toBeVisible();
    await this.startRiskBtn().click();
    await this.waitForNavigation();
    await expect(this.questionText()).toBeVisible();
  }

  // ── TC-RISK-01 Step 2: Answer questions ───────────────────

  /**
   * Answer questionnaire to target a specific risk profile.
   * Strategy:
   *   Conservative  → always pick first (most cautious) answer
   *   Moderate      → always pick middle answer
   *   Aggressive    → always pick last (most risk-tolerant) answer
   *
   * Questionnaires typically have 5–10 questions.
   */
  async answerQuestionnaire(profile: RiskProfile, questionCount = 7): Promise<void> {
    for (let i = 0; i < questionCount; i++) {
      await expect(this.questionText()).toBeVisible({ timeout: 10_000 });
      const options = this.answerOptions();
      const count   = await options.count();

      let index: number;
      switch (profile) {
        case RiskProfile.Conservative:
          index = 0;
          break;
        case RiskProfile.Aggressive:
          index = count - 1;
          break;
        default: // Moderate
          index = Math.floor(count / 2);
      }

      await options.nth(index).click();

      // Some platforms auto-advance; others need a Next button
      const nextVisible = await this.nextQuestionBtn().isVisible({ timeout: 1500 }).catch(() => false);
      if (nextVisible) await this.nextQuestionBtn().click();

      await this.waitForNavigation();
    }
  }

  // ── TC-RISK-01 Step 3: Submit ─────────────────────────────

  async submitAssessment(): Promise<void> {
    const submitVisible = await this.submitRiskBtn().isVisible({ timeout: 3000 }).catch(() => false);
    if (submitVisible) {
      await this.submitRiskBtn().click();
      await this.waitForNavigation();
    }
  }

  // ── TC-RISK-01 Step 4: Assert result ─────────────────────

  async assertRiskResult(expected: RiskProfile): Promise<void> {
    await expect(this.riskResultCard()).toBeVisible({ timeout: 10_000 });
    const label = (await this.riskProfileLabel().textContent()) ?? '';
    expect(label.toLowerCase()).toContain(expected.toLowerCase());
  }

  // ── TC-RISK-01 Step 5: Proceed to investment ─────────────

  async proceedToInvest(): Promise<void> {
    await this.proceedBtn().click();
    await this.waitForNavigation();
  }

  // ── TC-RISK-04: Re-profiling ──────────────────────────────

  async initiateReProfiling(): Promise<void> {
    await expect(this.changeProfileLink()).toBeVisible();
    await this.changeProfileLink().click();
    await this.waitForNavigation();
  }

  /**
   * Assert instrument catalogue updates after profile change.
   * Checks that the visible instruments are labelled with new profile category.
   */
  async assertInstrumentCatalogueUpdated(profile: RiskProfile): Promise<void> {
    const profileTag = this.page.locator(`.instrument-card [data-risk="${profile}"], .risk-tag:has-text("${profile}")`);
    await expect(profileTag.first()).toBeVisible({ timeout: 5000 });
  }
}
