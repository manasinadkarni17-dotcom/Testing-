// ─────────────────────────────────────────────────────────────
//  ReconciliationPage — Transaction history & reconciliation
//  URL: https://uat.nuqiwealth.com/transactions (or /history)
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReconciliationPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────
  readonly transactionNav       = () => this.page.locator('[data-testid="nav-transactions"], a:has-text("Transactions"), a:has-text("History"), nav a[href*="transaction"]').first();
  readonly reconciliationHeading= () => this.page.locator('[data-testid="recon-heading"], h1:has-text("Transaction"), h2:has-text("History")').first();
  readonly transactionRows      = () => this.page.locator('[data-testid="txn-row"], .transaction-item, .txn-row, tr.transaction');
  readonly transactionRow       = (id: string) =>
    this.page.locator(`[data-testid="txn-row"]:has-text("${id}"), .transaction-item:has-text("${id}")`).first();
  readonly latestTransaction    = () => this.transactionRows().first();

  // Status badges
  readonly completedBadge       = () => this.page.locator('[data-testid="status-completed"], .status-completed, span:has-text("Completed"), .badge-success').first();
  readonly pendingBadge         = () => this.page.locator('[data-testid="status-pending"], .status-pending, span:has-text("Pending")').first();

  // Filters
  readonly filterAllBtn         = () => this.page.locator('[data-testid="filter-all"], button:has-text("All")').first();
  readonly filterBuyBtn         = () => this.page.locator('[data-testid="filter-buy"], button:has-text("Buy")').first();
  readonly filterSellBtn        = () => this.page.locator('[data-testid="filter-sell"], button:has-text("Sell")').first();
  readonly dateFromInput        = () => this.page.locator('[data-testid="date-from"], input[name="dateFrom"]').first();
  readonly dateToInput          = () => this.page.locator('[data-testid="date-to"], input[name="dateTo"]').first();

  // Detail modal / drawer
  readonly txnDetailDrawer      = () => this.page.locator('[data-testid="txn-detail"], .txn-detail-drawer, .transaction-detail').first();
  readonly txnDetailType        = () => this.page.locator('[data-testid="detail-type"], .detail-type').first();
  readonly txnDetailAmount      = () => this.page.locator('[data-testid="detail-amount"], .detail-amount').first();
  readonly txnDetailDate        = () => this.page.locator('[data-testid="detail-date"], .detail-date').first();
  readonly txnDetailStatus      = () => this.page.locator('[data-testid="detail-status"], .detail-status').first();
  readonly closeDetailBtn       = () => this.page.locator('[data-testid="close-detail"], button:has-text("Close"), [aria-label="Close"]').first();

  // Summary cards
  readonly totalInvestedCard    = () => this.page.locator('[data-testid="total-invested"], .total-invested').first();
  readonly totalSoldCard        = () => this.page.locator('[data-testid="total-sold"], .total-sold').first();
  readonly netPositionCard      = () => this.page.locator('[data-testid="net-position"], .net-position').first();

  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ─────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.transactionNav().click();
    await this.waitForNavigation();
  }

  async gotoTransactions(): Promise<void> {
    await this.goto('/transactions');
    await this.waitForNavigation();
  }

  // ── TC-RECON-01: Page loads with transactions ─────────────

  async assertPageLoaded(): Promise<void> {
    await expect(this.reconciliationHeading()).toBeVisible({ timeout: 10_000 });
  }

  // ── TC-RECON-02: Latest transaction appears ───────────────

  async assertLatestTransactionVisible(): Promise<void> {
    await expect(this.transactionRows()).not.toHaveCount(0);
    await expect(this.latestTransaction()).toBeVisible();
  }

  async getLatestTransactionType(): Promise<string> {
    const text = await this.latestTransaction().textContent() ?? '';
    if (text.toLowerCase().includes('buy'))  return 'buy';
    if (text.toLowerCase().includes('sell')) return 'sell';
    return 'unknown';
  }

  // ── TC-RECON-03: Buy recorded correctly ──────────────────

  async assertBuyTransactionRecorded(instrumentName: string): Promise<void> {
    const buyRows = this.page.locator(
      `[data-testid="txn-row"]:has-text("Buy"):has-text("${instrumentName}"), .transaction-item:has-text("Buy"):has-text("${instrumentName}")`,
    );
    await expect(buyRows.first()).toBeVisible({ timeout: 10_000 });
  }

  // ── TC-RECON-04: Sell recorded correctly ─────────────────

  async assertSellTransactionRecorded(instrumentName: string): Promise<void> {
    const sellRows = this.page.locator(
      `[data-testid="txn-row"]:has-text("Sell"):has-text("${instrumentName}"), .transaction-item:has-text("Sell"):has-text("${instrumentName}")`,
    );
    await expect(sellRows.first()).toBeVisible({ timeout: 10_000 });
  }

  // ── TC-RECON-05: Transaction status is Completed ─────────

  async assertLatestTransactionCompleted(): Promise<void> {
    await expect(this.completedBadge()).toBeVisible({ timeout: 10_000 });
  }

  // ── TC-RECON-06: Transaction detail drill-down ────────────

  async openLatestTransactionDetail(): Promise<void> {
    await this.latestTransaction().click();
    await expect(this.txnDetailDrawer()).toBeVisible({ timeout: 8000 });
  }

  async assertTransactionDetailFields(): Promise<void> {
    await expect(this.txnDetailType()).toBeVisible();
    await expect(this.txnDetailAmount()).toBeVisible();
    await expect(this.txnDetailDate()).toBeVisible();
    await expect(this.txnDetailStatus()).toBeVisible();
  }

  async closeTransactionDetail(): Promise<void> {
    await this.closeDetailBtn().click();
    await expect(this.txnDetailDrawer()).not.toBeVisible();
  }

  // ── TC-RECON-07: Filter by type ──────────────────────────

  async filterByBuyTransactions(): Promise<void> {
    await this.filterBuyBtn().click();
    await this.waitForNavigation();
    const rows = this.transactionRows();
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent() ?? '';
      expect(text.toLowerCase()).toContain('buy');
    }
  }

  // ── TC-RECON-08: Summary amounts are numeric ─────────────

  async assertSummaryCardsHaveValues(): Promise<void> {
    const cards = [this.totalInvestedCard(), this.totalSoldCard(), this.netPositionCard()];
    for (const card of cards) {
      if (await card.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await card.textContent() ?? '';
        expect(text).toMatch(/[\d,.]+/);
      }
    }
  }
}
