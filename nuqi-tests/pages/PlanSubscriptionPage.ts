// ─────────────────────────────────────────────────────────────
//  PlanSubscriptionPage — Portfolio Creation + Plan Subscription
//  URLs: /invest, /invest/plans, /portfolio
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { InvestmentPlan } from '../types';

export class PlanSubscriptionPage extends BasePage {

  // ── Portfolio / Plan creation ─────────────────────────────
  readonly createPortfolioBtn = () => this.page.locator(
    '[data-testid="create-portfolio"], [data-testid="create-plan"], ' +
    'button:has-text("Create Portfolio"), button:has-text("Create Plan"), ' +
    'button:has-text("New Plan")'
  ).first();

  readonly portfolioNameInput = () => this.page.locator(
    '[data-testid="portfolio-name"], [data-testid="plan-name"], ' +
    'input[name="portfolioName"], input[name="planName"], ' +
    'input[placeholder*="Portfolio Name"], input[placeholder*="Plan Name"]'
  ).first();

  readonly targetAmountInput = () => this.page.locator(
    '[data-testid="target-amount"], input[name="targetAmount"], ' +
    'input[placeholder*="Target Amount"], input[placeholder*="Amount"]'
  ).first();

  readonly horizonSelect = () => this.page.locator(
    '[data-testid="horizon"], select[name="horizon"], ' +
    '[aria-label*="Horizon"], [aria-label*="Duration"]'
  ).first();

  readonly currencySelect = () => this.page.locator(
    '[data-testid="currency"], select[name="currency"], ' +
    '[aria-label*="Currency"]'
  ).first();

  readonly portfolioSubmitBtn = () => this.page.locator(
    '[data-testid="portfolio-submit"], [data-testid="plan-submit"], ' +
    'button:has-text("Create Plan"), button:has-text("Create Portfolio"), ' +
    'button[type="submit"]:not([disabled])'
  ).first();

  readonly portfolioCreatedMsg = () => this.page.locator(
    '[data-testid="portfolio-created"], [data-testid="plan-created"], ' +
    'h2:has-text("Plan Created"), h2:has-text("Portfolio Created"), ' +
    '.plan-success, .portfolio-success, .success-message'
  ).first();

  // ── Plan catalogue (CEP / curated portfolios) ─────────────
  readonly planCatalogueSection = () => this.page.locator(
    '[data-testid="plan-catalogue"], [data-testid="curated-plans"], ' +
    '[data-testid="cep-section"], .plan-catalogue, .curated-portfolios, ' +
    'section:has-text("Curated"), section:has-text("Plans")'
  ).first();

  readonly planCards = () => this.page.locator(
    '[data-testid="plan-card"], [data-testid="cep-card"], ' +
    '.plan-card, .cep-item, .portfolio-card, .curated-card'
  );

  readonly planCard = (name: string) => this.page.locator(
    `[data-testid="plan-card"]:has-text("${name}"), ` +
    `[data-testid="cep-card"]:has-text("${name}"), ` +
    `.plan-card:has-text("${name}"), .cep-item:has-text("${name}")`
  ).first();

  readonly planCardTitle = () => this.planCards().first().locator(
    '[data-testid="plan-title"], .plan-title, h3, h4'
  ).first();

  // ── Plan detail page ──────────────────────────────────────
  readonly planDetailHeading = () => this.page.locator(
    '[data-testid="plan-detail-title"], .plan-title, .cep-title, h1, h2'
  ).first();

  readonly planDescription = () => this.page.locator(
    '[data-testid="plan-description"], .plan-description, .cep-description, p'
  ).first();

  readonly planRiskLabel = () => this.page.locator(
    '[data-testid="plan-risk"], .risk-label, .risk-badge, ' +
    'span:has-text("Conservative"), span:has-text("Moderate"), span:has-text("Aggressive")'
  ).first();

  readonly planReturnMetric = () => this.page.locator(
    '[data-testid="plan-return"], [data-testid="expected-return"], ' +
    '.expected-return, .plan-return, .return-value'
  ).first();

  // ── Subscribe / Invest CTA ────────────────────────────────
  readonly subscribeBtn = () => this.page.locator(
    '[data-testid="subscribe-btn"], [data-testid="invest-btn"], ' +
    'button:has-text("Subscribe"), button:has-text("Invest Now"), ' +
    'button:has-text("Add to Portfolio"), button:has-text("Invest in This Plan")'
  ).first();

  // ── Subscription form ─────────────────────────────────────
  readonly subscriptionAmountInput = () => this.page.locator(
    '[data-testid="subscription-amount"], [data-testid="invest-amount"], ' +
    'input[name="amount"], input[name="investAmount"], ' +
    'input[placeholder*="Amount"], input[placeholder*="Invest"]'
  ).first();

  readonly subscriptionFrequencySelect = () => this.page.locator(
    '[data-testid="frequency"], select[name="frequency"], ' +
    '[aria-label*="Frequency"], [aria-label*="Recurring"]'
  ).first();

  readonly confirmSubscriptionBtn = () => this.page.locator(
    '[data-testid="confirm-subscription"], [data-testid="confirm-invest"], ' +
    'button:has-text("Confirm"), button:has-text("Confirm & Subscribe"), ' +
    'button:has-text("Proceed"), button:has-text("Subscribe Now")'
  ).first();

  // ── Subscription result ───────────────────────────────────
  readonly subscriptionSuccessMsg = () => this.page.locator(
    '[data-testid="subscription-success"], [data-testid="invest-success"], ' +
    'h1:has-text("Success"), h2:has-text("Success"), ' +
    'h2:has-text("Subscribed"), h2:has-text("Order Placed"), ' +
    '.subscription-success, .invest-success, [role="status"]'
  ).first();

  readonly subscriptionOrderId = () => this.page.locator(
    '[data-testid="order-id"], [data-testid="subscription-id"], ' +
    '.order-id, .subscription-reference'
  ).first();

  // ── Portfolio plans section ───────────────────────────────
  readonly portfolioPlansSection = () => this.page.locator(
    '[data-testid="portfolio-plans"], [data-testid="plans-section"], ' +
    '.portfolio-plans, .my-plans, section:has-text("My Plans")'
  ).first();

  readonly portfolioPlanItems = () => this.page.locator(
    '[data-testid="plan-item"], [data-testid="portfolio-plan-item"], ' +
    '.plan-row, .my-plan-item, .plan-card'
  );

  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ─────────────────────────────────────────────

  async navigateToInvest(): Promise<void> {
    await this.goto('/invest');
    await this.waitForNavigation();
  }

  async navigateToPlans(): Promise<void> {
    await this.goto('/invest');
    await this.waitForNavigation();
    const plansTab = this.page.locator(
      '[data-testid="plans-tab"], button:has-text("Plans"), a:has-text("Plans")'
    ).first();
    if (await plansTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await plansTab.click();
      await this.waitForNavigation();
    }
  }

  // ── Portfolio / Plan creation ──────────────────────────────

  async createPortfolio(plan: InvestmentPlan): Promise<void> {
    await expect(this.createPortfolioBtn()).toBeVisible({ timeout: 10_000 });
    await this.createPortfolioBtn().click();
    await this.waitForNavigation();

    await this.portfolioNameInput().fill(plan.name);
    await this.targetAmountInput().fill(String(plan.targetAmount));

    const horizonEl = this.horizonSelect();
    if (await horizonEl.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await horizonEl.selectOption({ label: plan.horizon });
    }

    const currencyEl = this.currencySelect();
    if (await currencyEl.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await currencyEl.selectOption({ label: plan.currency });
    }

    await expect(this.portfolioSubmitBtn()).toBeEnabled({ timeout: 5_000 });
    await this.portfolioSubmitBtn().click();
    await this.waitForNavigation();
  }

  async assertPortfolioCreated(): Promise<void> {
    await expect(this.portfolioCreatedMsg()).toBeVisible({ timeout: 15_000 });
  }

  // ── Plan catalogue ─────────────────────────────────────────

  async assertPlanCatalogueVisible(minCount = 1): Promise<void> {
    await expect(this.planCards().first()).toBeVisible({ timeout: 10_000 });
    expect(await this.planCards().count()).toBeGreaterThanOrEqual(minCount);
  }

  async selectFirstPlan(): Promise<void> {
    await expect(this.planCards().first()).toBeVisible({ timeout: 10_000 });
    await this.planCards().first().click();
    await this.waitForNavigation();
  }

  async selectPlanByName(name: string): Promise<void> {
    await expect(this.planCard(name)).toBeVisible({ timeout: 10_000 });
    await this.planCard(name).click();
    await this.waitForNavigation();
  }

  // ── Subscription ───────────────────────────────────────────

  async clickSubscribe(): Promise<void> {
    await expect(this.subscribeBtn()).toBeVisible({ timeout: 10_000 });
    await this.subscribeBtn().click();
    await this.waitForNavigation();
  }

  async fillSubscriptionAmount(amount: number): Promise<void> {
    const input = this.subscriptionAmountInput();
    if (await input.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await input.clear();
      await input.fill(String(amount));
    }
  }

  async confirmSubscription(): Promise<void> {
    await expect(this.confirmSubscriptionBtn()).toBeEnabled({ timeout: 8_000 });
    await this.confirmSubscriptionBtn().click();
    await this.waitForNavigation();
  }

  async subscribeToPlan(amount?: number): Promise<void> {
    await this.clickSubscribe();
    if (amount !== undefined) {
      await this.fillSubscriptionAmount(amount);
    }
    await this.confirmSubscription();
  }

  async assertSubscriptionSuccess(): Promise<void> {
    await expect(this.subscriptionSuccessMsg()).toBeVisible({ timeout: 20_000 });
  }

  // ── Portfolio verification ──────────────────────────────────

  async navigateToPortfolio(): Promise<void> {
    await this.goto('/portfolio');
    await this.waitForNavigation();
  }

  async assertSubscribedPlanInPortfolio(minCount = 1): Promise<void> {
    const planItems = this.portfolioPlanItems();
    const plansVisible = await planItems.first().isVisible({ timeout: 8_000 }).catch(() => false);
    if (plansVisible) {
      expect(await planItems.count()).toBeGreaterThanOrEqual(minCount);
    } else {
      await expect(this.portfolioPlansSection()).toBeVisible({ timeout: 8_000 });
    }
  }
}
