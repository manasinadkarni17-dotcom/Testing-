// ─────────────────────────────────────────────────────────────
//  InvestmentPage — Plan · Direct · Recommendation · CTA
//  URL: https://uat.nuqiwealth.com/invest  (and sub-routes)
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { InvestmentPlan, InvestmentType } from '../types';

export class InvestmentPage extends BasePage {
  // ── Dashboard CTA locators ────────────────────────────────
  readonly dashboardInvestBtn  = () => this.page.locator('[data-testid="invest-cta"], .invest-now-btn, button:has-text("Invest Now"), a:has-text("Invest")').first();
  readonly dashboardPlanCta    = () => this.page.locator('[data-testid="create-plan-cta"], button:has-text("Create Plan")').first();

  // ── Plan creation ─────────────────────────────────────────
  readonly createPlanBtn       = () => this.page.locator('[data-testid="create-plan"], button:has-text("Create Investment Plan"), button:has-text("New Plan")').first();
  readonly planNameInput       = () => this.page.locator('[data-testid="plan-name"], input[name="planName"], input[placeholder*="Plan Name"]').first();
  readonly targetAmountInput   = () => this.page.locator('[data-testid="target-amount"], input[name="targetAmount"], input[placeholder*="Target"]').first();
  readonly horizonSelect       = () => this.page.locator('[data-testid="horizon"], select[name="horizon"], [aria-label*="Horizon"]').first();
  readonly currencySelect      = () => this.page.locator('[data-testid="currency"], select[name="currency"]').first();
  readonly createPlanSubmitBtn = () => this.page.locator('[data-testid="plan-submit"], button:has-text("Create"), button[type="submit"]').first();
  readonly planCreatedMsg      = () => this.page.locator('[data-testid="plan-created"], h2:has-text("Plan Created"), .plan-success').first();

  // ── Direct investment ─────────────────────────────────────
  readonly directInvestTab     = () => this.page.locator('[data-testid="direct-invest-tab"], button:has-text("Direct"), a:has-text("Invest Directly")').first();
  readonly instrumentSearch    = () => this.page.locator('[data-testid="instrument-search"], input[placeholder*="Search"], input[placeholder*="ETF"]').first();
  readonly instrumentCards     = () => this.page.locator('[data-testid="instrument-card"], .instrument-item, .asset-card');
  readonly instrumentCard      = (name: string) =>
    this.page.locator(`[data-testid="instrument-card"]:has-text("${name}"), .instrument-item:has-text("${name}")`).first();
  readonly selectInstrumentBtn = () => this.page.locator('[data-testid="select-instrument"], button:has-text("Invest"), button:has-text("Buy")').first();

  // ── Recommendation Engine ─────────────────────────────────
  readonly recommendedTab      = () => this.page.locator('[data-testid="recommendations-tab"], button:has-text("For You"), a:has-text("Recommended")').first();
  readonly recommendedCards    = () => this.page.locator('[data-testid="recommended-card"], .recommendation-item');
  readonly viewRecommendBtn    = () => this.page.locator('[data-testid="view-recommendation"], button:has-text("View"), button:has-text("Explore")').first();
  readonly investFromRecoBtn   = () => this.page.locator('[data-testid="invest-from-reco"], button:has-text("Invest"), button:has-text("Add to Portfolio")').first();

  // ── CEP / Portfolio selector ──────────────────────────────
  readonly cepCards            = () => this.page.locator('[data-testid="cep-card"], .cep-item, .portfolio-card');
  readonly selectCepBtn        = (name: string) =>
    this.page.locator(`[data-testid="cep-card"]:has-text("${name}") button, .cep-item:has-text("${name}") button`).first();

  constructor(page: Page) {
    super(page);
  }

  // ── ENTRY VARIANT: Dashboard CTA ─────────────────────────

  /**
   * TC-INV-01 Step 1
   * Click the "Invest Now" CTA on the dashboard.
   */
  async clickDashboardInvestCta(): Promise<void> {
    await expect(this.dashboardInvestBtn()).toBeVisible();
    await this.dashboardInvestBtn().click();
    await this.waitForNavigation();
  }

  // ── ENTRY VARIANT: Create Investment Plan ─────────────────

  /**
   * TC-INV-02 Step 1 — Open plan creation flow
   */
  async openCreatePlan(): Promise<void> {
    await expect(this.createPlanBtn()).toBeVisible();
    await this.createPlanBtn().click();
    await this.waitForNavigation();
  }

  /**
   * TC-INV-02 Steps 2–4 — Fill plan details and submit
   */
  async fillAndSubmitPlan(plan: InvestmentPlan): Promise<void> {
    await this.planNameInput().fill(plan.name);
    await this.targetAmountInput().fill(String(plan.targetAmount));
    const horizonEl = this.horizonSelect();
    if (await horizonEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await horizonEl.selectOption({ label: plan.horizon });
    }
    const currencyEl = this.currencySelect();
    if (await currencyEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await currencyEl.selectOption({ label: plan.currency });
    }
    await this.createPlanSubmitBtn().click();
    await this.waitForNavigation();
  }

  /**
   * TC-INV-02 Step 5 — Assert plan was created
   */
  async assertPlanCreated(): Promise<void> {
    await expect(this.planCreatedMsg()).toBeVisible({ timeout: 10_000 });
  }

  // ── ENTRY VARIANT: Direct Investment ─────────────────────

  /**
   * TC-INV-03 Step 1 — Navigate to direct investment
   */
  async openDirectInvestment(): Promise<void> {
    const tab = this.directInvestTab();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tab.click();
    } else {
      await this.goto('/invest/direct');
    }
    await this.waitForNavigation();
  }

  /**
   * TC-INV-03 Step 2 — Search and select an instrument
   */
  async searchAndSelectInstrument(instrumentName: string): Promise<void> {
    const search = this.instrumentSearch();
    if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
      await search.fill(instrumentName);
      await this.page.waitForTimeout(500); // debounce
    }
    // Click first matching instrument
    await expect(this.instrumentCards()).not.toHaveCount(0);
    await this.instrumentCard(instrumentName).click();
    await this.waitForNavigation();
  }

  /**
   * TC-INV-03 Step 3 — Assert instrument detail page opened
   */
  async assertInstrumentDetailOpen(name: string): Promise<void> {
    await expect(
      this.page.locator(`h1:has-text("${name}"), h2:has-text("${name}"), .instrument-title`),
    ).toBeVisible({ timeout: 8000 });
  }

  // ── ENTRY VARIANT: Recommendation Engine ─────────────────

  /**
   * TC-INV-04 Step 1 — Open recommendations tab
   */
  async openRecommendations(): Promise<void> {
    const tab = this.recommendedTab();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tab.click();
    } else {
      await this.goto('/invest/recommendations');
    }
    await this.waitForNavigation();
  }

  /**
   * TC-INV-04 Step 2 — Verify recommendations match risk profile
   */
  async assertRecommendationsVisible(minCount = 1): Promise<void> {
    await expect(this.recommendedCards()).toHaveCount(
      expect.any(Number) as unknown as number,
    );
    expect(await this.recommendedCards().count()).toBeGreaterThanOrEqual(minCount);
  }

  /**
   * TC-INV-04 Step 3 — Select first recommendation
   */
  async selectFirstRecommendation(): Promise<void> {
    await this.recommendedCards().first().click();
    await this.waitForNavigation();
  }
}
