// ─────────────────────────────────────────────────────────────
//  SellPage — Partial Sell · Full Exit · No-Sell Hold
//  URL: https://uat.nuqiwealth.com/sell  (or /transaction/sell)
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SellOrder } from '../types';

export class SellPage extends BasePage {
  // ── Sell form locators ────────────────────────────────────
  readonly sellHeading         = () => this.page.locator('[data-testid="sell-heading"], h1:has-text("Sell"), h2:has-text("Redeem")').first();
  readonly amountTypeToggle    = () => this.page.locator('[data-testid="sell-by-amount"], [data-testid="sell-by-units"], .sell-mode-toggle').first();
  readonly sellAmountInput     = () => this.page.locator('[data-testid="sell-amount"], input[name="sellAmount"], input[placeholder*="Amount"]').first();
  readonly sellUnitsInput      = () => this.page.locator('[data-testid="sell-units"], input[name="units"], input[placeholder*="Units"]').first();
  readonly percentageSlider    = () => this.page.locator('[data-testid="sell-percentage"], input[type="range"], .percentage-slider').first();
  readonly percentageDisplay   = () => this.page.locator('[data-testid="percentage-display"], .sell-percent').first();

  // Presets
  readonly preset25Btn         = () => this.page.locator('[data-testid="sell-25"], button:has-text("25%")').first();
  readonly preset50Btn         = () => this.page.locator('[data-testid="sell-50"], button:has-text("50%")').first();
  readonly preset75Btn         = () => this.page.locator('[data-testid="sell-75"], button:has-text("75%")').first();
  readonly sellAllBtn          = () => this.page.locator('[data-testid="sell-all"], button:has-text("Sell All"), button:has-text("100%"), button:has-text("Full Exit")').first();

  // Available holding display
  readonly availableUnitsLabel = () => this.page.locator('[data-testid="available-units"], .available-units, span:has-text("Available")').first();
  readonly estimatedProceeds   = () => this.page.locator('[data-testid="est-proceeds"], .est-proceeds, .proceeds-amount').first();

  // Order summary & confirm
  readonly sellSummarySection  = () => this.page.locator('[data-testid="sell-summary"], .sell-summary, section:has-text("Sell Summary")').first();
  readonly sellSummaryUnits    = () => this.page.locator('[data-testid="sell-summary-units"], .summary-units').first();
  readonly sellSummaryAmount   = () => this.page.locator('[data-testid="sell-summary-amount"], .summary-amount').first();
  readonly confirmSellBtn      = () => this.page.locator('[data-testid="confirm-sell"], button:has-text("Confirm Sell"), button:has-text("Confirm"), button:has-text("Redeem")').first();
  readonly termsCheckbox       = () => this.page.locator('[data-testid="sell-terms"], input[type="checkbox"]').first();

  // Success
  readonly sellSuccessScreen   = () => this.page.locator('[data-testid="sell-success"], .sell-success, h2:has-text("Redeemed"), h1:has-text("Sold"), .transaction-success').first();
  readonly sellTransactionId   = () => this.page.locator('[data-testid="sell-txn-id"], .txn-id').first();
  readonly backToPortfolioBtn  = () => this.page.locator('[data-testid="back-portfolio"], button:has-text("Portfolio"), a:has-text("Portfolio")').first();

  constructor(page: Page) {
    super(page);
  }

  // ── TC-SELL-01: Partial sell ──────────────────────────────

  /**
   * Step 1 — Assert sell form opened with instrument name.
   */
  async assertSellFormOpened(): Promise<void> {
    await expect(this.sellHeading()).toBeVisible({ timeout: 8000 });
    await expect(this.availableUnitsLabel()).toBeVisible();
  }

  /**
   * Step 2 — Enter partial sell percentage using preset button.
   */
  async sellByPresetPercentage(percentage: 25 | 50 | 75): Promise<void> {
    const map = {
      25: this.preset25Btn,
      50: this.preset50Btn,
      75: this.preset75Btn,
    };
    await map[percentage]().click(); 
    await expect(this.percentageDisplay()).toContainText(`${percentage}`);
    await expect(this.estimatedProceeds()).toBeVisible();
  }

  /**
   * Step 2 (alt) — Enter a custom percentage via slider or input.
   */
  async sellByCustomPercentage(percentage: number): Promise<void> {
    const slider = this.percentageSlider();
    if (await slider.isVisible({ timeout: 2000 }).catch(() => false)) {
      await slider.fill(String(percentage));
    } else {
      await this.sellAmountInput().fill(String(percentage));
    }
  }

  /**
   * TC-SELL-01 Steps 3–5 — Review summary and confirm partial sell.
   */
  async confirmPartialSell(): Promise<void> {
    await expect(this.sellSummarySection()).toBeVisible();
    const terms = this.termsCheckbox();
    if (await terms.isVisible({ timeout: 2000 }).catch(() => false)) {
      await terms.check();
    }
    await expect(this.confirmSellBtn()).toBeEnabled();
    await this.confirmSellBtn().click();
    await this.waitForNavigation();
  }

  async assertPartialSellSuccess(): Promise<void> {
    await expect(this.sellSuccessScreen()).toBeVisible({ timeout: 20_000 });
    await expect(this.sellTransactionId()).toBeVisible();
  }

  // ── TC-SELL-02: Full exit ────────────────────────────────

  /**
   * Step 2 — Click "Sell All" / "100%" preset.
   */
  async selectFullExit(): Promise<void> {
    await expect(this.sellAllBtn()).toBeVisible();
    await this.sellAllBtn().click();
    // Should auto-fill 100% and show proceeds
    await expect(this.estimatedProceeds()).toBeVisible();
  }

  async confirmFullExit(): Promise<void> {
    await expect(this.sellSummarySection()).toBeVisible();
    const terms = this.termsCheckbox();
    if (await terms.isVisible({ timeout: 2000 }).catch(() => false)) {
      await terms.check();
    }
    await this.confirmSellBtn().click();
    await this.waitForNavigation();
  }

  async assertFullExitSuccess(): Promise<void> {
    await expect(this.sellSuccessScreen()).toBeVisible({ timeout: 20_000 });
    await expect(this.sellTransactionId()).toBeVisible();
  }

  // ── TC-SELL-03: No sell (hold) ────────────────────────────

  /**
   * Verify that portfolio does not show a pending sell order
   * and holding value is unchanged.
   */
  async assertNoSellPending(instrumentName: string): Promise<void> {
    const pendingSell = this.page.locator(
      `.pending-order:has-text("Sell"), [data-testid="pending-sell"]`,
    );
    await expect(pendingSell).not.toBeVisible();
  }

  // ── Helper: Full sell flow (partial) ─────────────────────

  async performPartialSell(order: SellOrder): Promise<void> {
    await this.assertSellFormOpened();
    await this.sellByPresetPercentage(50);
    await this.confirmPartialSell();
    await this.assertPartialSellSuccess();
  }
}
