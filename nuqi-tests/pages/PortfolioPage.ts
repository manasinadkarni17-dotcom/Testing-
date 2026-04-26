// ─────────────────────────────────────────────────────────────
//  PortfolioPage — Portfolio tracking & analytics
//  URL: https://uat.nuqiwealth.com/portfolio
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PortfolioPage extends BasePage {
  // ── Main dashboard ────────────────────────────────────────
  readonly portfolioNav        = () => this.page.locator('[data-testid="nav-portfolio"], a:has-text("Portfolio"), nav a[href*="portfolio"]').first();
  readonly portfolioHeading    = () => this.page.locator('[data-testid="portfolio-heading"], h1:has-text("Portfolio"), h2:has-text("My Portfolio")').first();
  readonly totalValueCard      = () => this.page.locator('[data-testid="total-value"], .portfolio-total, .nav-value').first();
  readonly totalValueAmount    = () => this.page.locator('[data-testid="total-amount"], .total-amount, .portfolio-value').first();
  readonly pnlLabel            = () => this.page.locator('[data-testid="pnl"], .pnl-value, .gain-loss').first();
  readonly portfolioChart      = () => this.page.locator('[data-testid="portfolio-chart"], .portfolio-chart, canvas').first();

  // ── Holdings list ─────────────────────────────────────────
  readonly holdingsSection     = () => this.page.locator('[data-testid="holdings"], .holdings-list, section:has-text("Holdings")').first();
  readonly holdingItems        = () => this.page.locator('[data-testid="holding-item"], .holding-row, .investment-item');
  readonly holdingItem         = (name: string) =>
    this.page.locator(`[data-testid="holding-item"]:has-text("${name}"), .holding-row:has-text("${name}")`).first();
  readonly holdingValue        = (name: string) =>
    this.holdingItem(name).locator('[data-testid="holding-value"], .holding-amount').first();
  readonly holdingUnits        = (name: string) =>
    this.holdingItem(name).locator('[data-testid="holding-units"], .units').first();
  readonly emptyPortfolioMsg   = () => this.page.locator('[data-testid="empty-portfolio"], .empty-state, p:has-text("No investments")').first();

  // ── Period filter ─────────────────────────────────────────
  readonly periodFilter1D      = () => this.page.locator('[data-testid="period-1d"], button:has-text("1D")').first();
  readonly periodFilter1W      = () => this.page.locator('[data-testid="period-1w"], button:has-text("1W")').first();
  readonly periodFilter1M      = () => this.page.locator('[data-testid="period-1m"], button:has-text("1M")').first();
  readonly periodFilterAll     = () => this.page.locator('[data-testid="period-all"], button:has-text("All")').first();

  // ── Plans section ─────────────────────────────────────────
  readonly plansSection        = () => this.page.locator('[data-testid="plans-section"], .plans-list, section:has-text("My Plans")').first();
  readonly planItems           = () => this.page.locator('[data-testid="plan-item"], .plan-row, .plan-card');

  // ── Action buttons ────────────────────────────────────────
  readonly sellBtn             = (instrument?: string) => instrument
    ? this.holdingItem(instrument).locator('button:has-text("Sell"), [data-testid="sell"]').first()
    : this.page.locator('[data-testid="sell-btn"], button:has-text("Sell")').first();
  readonly buyMoreBtn          = (instrument?: string) => instrument
    ? this.holdingItem(instrument).locator('button:has-text("Buy"), [data-testid="buy-more"]').first()
    : this.page.locator('[data-testid="buy-more-btn"], button:has-text("Buy More")').first();

  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ─────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.portfolioNav().click();
    await this.waitForNavigation();
  }

  async gotoPortfolio(): Promise<void> {
    await this.goto('/portfolio');
    await this.waitForNavigation();
  }

  // ── TC-PORT-01: Assert portfolio loads ────────────────────

  async assertPortfolioLoaded(): Promise<void> {
    await expect(this.portfolioHeading()).toBeVisible({ timeout: 10_000 });
    await expect(this.totalValueCard()).toBeVisible();
  }

  // ── TC-PORT-02: Assert instrument appears after buy ───────

  async assertHoldingVisible(instrumentName: string): Promise<void> {
    await expect(this.holdingItem(instrumentName)).toBeVisible({ timeout: 15_000 });
  }

  // ── TC-PORT-03: Assert total NAV updates ─────────────────

  async getPortfolioTotalValue(): Promise<number> {
    const text = await this.totalValueAmount().textContent() ?? '0';
    const clean = text.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  }

  async assertTotalValueGreaterThan(floor: number): Promise<void> {
    const value = await this.getPortfolioTotalValue();
    expect(value).toBeGreaterThan(floor);
  }

  // ── TC-PORT-04: Chart renders ─────────────────────────────

  async assertChartVisible(): Promise<void> {
    await expect(this.portfolioChart()).toBeVisible();
  }

  async changePeriod(period: '1D' | '1W' | '1M' | 'All'): Promise<void> {
    const map: Record<string, () => ReturnType<typeof this.periodFilter1D>> = {
      '1D': this.periodFilter1D.bind(this),
      '1W': this.periodFilter1W.bind(this),
      '1M': this.periodFilter1M.bind(this),
      'All': this.periodFilterAll.bind(this),
    };
    await map[period]().click();
    await this.waitForNavigation();
  }

  // ── TC-PORT-05: Empty state after full exit ───────────────

  async assertEmptyPortfolio(): Promise<void> {
    await expect(this.emptyPortfolioMsg()).toBeVisible({ timeout: 10_000 });
    await expect(this.holdingItems()).toHaveCount(0);
  }

  // ── TC-PORT-06: Plans visible ─────────────────────────────

  async assertPlansVisible(minCount = 1): Promise<void> {
    await expect(this.plansSection()).toBeVisible();
    expect(await this.planItems().count()).toBeGreaterThanOrEqual(minCount);
  }

  // ── Navigation to sell ────────────────────────────────────

  async clickSellForInstrument(instrumentName: string): Promise<void> {
    await this.holdingItem(instrumentName).scrollIntoViewIfNeeded();
    await this.sellBtn(instrumentName).click();
    await this.waitForNavigation();
  }
}
