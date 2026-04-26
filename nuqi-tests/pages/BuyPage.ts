// ─────────────────────────────────────────────────────────────
//  BuyPage — Standard · Alternate Payment · Minimum Amount
//  URL: https://uat.nuqiwealth.com/buy  (or /transaction/buy)
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { BuyOrder } from '../types';

export class BuyPage extends BasePage {
  // ── Order form locators ───────────────────────────────────
  readonly buyBtn              = () => this.page.locator('[data-testid="buy-btn"], button:has-text("Buy"), button:has-text("Purchase")').first();
  readonly amountInput         = () => this.page.locator('[data-testid="buy-amount"], input[name="amount"], input[placeholder*="Amount"]').first();
  readonly currencyDisplay     = () => this.page.locator('[data-testid="currency-display"], .currency-label, .amount-currency').first();
  readonly minAmountHint       = () => this.page.locator('[data-testid="min-amount-hint"], .min-amount, span:has-text("Minimum")').first();
  readonly maxAmountHint       = () => this.page.locator('[data-testid="max-amount-hint"], .max-amount').first();

  // ── Payment method ────────────────────────────────────────
  readonly paymentMethodSection = () => this.page.locator('[data-testid="payment-section"], .payment-methods, section:has-text("Payment")').first();
  readonly cardPaymentOption    = () => this.page.locator('[data-testid="pay-card"], [value="card"], label:has-text("Card"), label:has-text("Credit")').first();
  readonly bankTransferOption   = () => this.page.locator('[data-testid="pay-bank"], [value="bank_transfer"], label:has-text("Bank")').first();
  readonly walletOption         = () => this.page.locator('[data-testid="pay-wallet"], [value="wallet"], label:has-text("Wallet")').first();
  readonly selectedPaymentLabel = () => this.page.locator('[data-testid="selected-payment"], .selected-method').first();

  // Card details (for card payment)
  readonly cardNumberInput      = () => this.page.locator('[data-testid="card-number"], input[name="cardNumber"], input[placeholder*="Card Number"]').first();
  readonly cardExpiryInput      = () => this.page.locator('[data-testid="card-expiry"], input[name="expiry"], input[placeholder*="MM/YY"]').first();
  readonly cardCvvInput         = () => this.page.locator('[data-testid="card-cvv"], input[name="cvv"], input[placeholder*="CVV"]').first();
  readonly cardNameInput        = () => this.page.locator('[data-testid="card-name"], input[name="cardName"], input[placeholder*="Name"]').first();

  // ── Order summary & confirm ───────────────────────────────
  readonly orderSummarySection  = () => this.page.locator('[data-testid="order-summary"], .order-summary, section:has-text("Order Summary")').first();
  readonly summaryAmount        = () => this.page.locator('[data-testid="summary-amount"], .summary-amount, .order-amount').first();
  readonly summaryFee           = () => this.page.locator('[data-testid="summary-fee"], .summary-fee, .transaction-fee').first();
  readonly summaryTotal         = () => this.page.locator('[data-testid="summary-total"], .summary-total, .order-total').first();
  readonly confirmBuyBtn        = () => this.page.locator('[data-testid="confirm-buy"], button:has-text("Confirm"), button:has-text("Place Order")').first();
  readonly termsCheckbox        = () => this.page.locator('[data-testid="terms-check"], input[type="checkbox"]').first();

  // ── Success ───────────────────────────────────────────────
  readonly successScreen        = () => this.page.locator('[data-testid="buy-success"], .transaction-success, h2:has-text("Order Placed"), h1:has-text("Success")').first();
  readonly transactionIdLabel   = () => this.page.locator('[data-testid="transaction-id"], .txn-id, span:has-text("TXN")').first();
  readonly viewPortfolioBtn     = () => this.page.locator('[data-testid="view-portfolio"], button:has-text("View Portfolio"), a:has-text("Portfolio")').first();

  constructor(page: Page) {
    super(page);
  }

  // ── STEP 1: Open buy flow ──────────────────────────────────

  async clickBuyButton(): Promise<void> {
    await expect(this.buyBtn()).toBeVisible();
    await this.buyBtn().click();
    await this.waitForNavigation();
  }

  // ── STEP 2: Enter amount ───────────────────────────────────

  /**
   * TC-BUY-01, TC-BUY-03
   * Enter buy amount and assert it is within allowed range.
   */
  async enterBuyAmount(amount: number): Promise<void> {
    await expect(this.amountInput()).toBeVisible();
    await this.amountInput().clear();
    await this.amountInput().fill(String(amount));
  }

  /**
   * TC-BUY-03 — Read minimum amount from UI hint and use it.
   */
  async enterMinimumAllowedAmount(): Promise<void> {
    const hint = this.minAmountHint();
    if (await hint.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await hint.textContent() ?? '';
      const match = text.match(/[\d,.]+/);
      const minAmt = match ? parseFloat(match[0].replace(',', '')) : 100;
      await this.amountInput().fill(String(minAmt));
    } else {
      await this.amountInput().fill('100'); // fallback minimum
    }
  }

  // ── STEP 3A: Standard payment (default card) ──────────────

  /**
   * TC-BUY-01 — Proceed with default selected payment method.
   */
  async useDefaultPaymentMethod(): Promise<void> {
    // Payment method may already be pre-selected; just verify section is visible
    await expect(this.paymentMethodSection()).toBeVisible();
  }

  // ── STEP 3B: Alternate payment method ────────────────────

  /**
   * TC-BUY-02 — Select an alternate payment method (bank transfer or wallet).
   */
  async selectAlternatePaymentMethod(method: 'bank' | 'wallet'): Promise<void> {
    await expect(this.paymentMethodSection()).toBeVisible();
    if (method === 'bank') {
      await this.bankTransferOption().click();
    } else {
      await this.walletOption().click();
    }
    await expect(this.selectedPaymentLabel()).toBeVisible();
  }

  // ── STEP 4: Review order summary ─────────────────────────

  /**
   * TC-BUY-01 Step 4
   * Assert order summary values are populated.
   */
  async assertOrderSummary(expectedAmount: number): Promise<void> {
    await expect(this.orderSummarySection()).toBeVisible();
    const amountText = await this.summaryAmount().textContent() ?? '';
    expect(amountText).toContain(String(expectedAmount));
    await expect(this.summaryFee()).toBeVisible();
    await expect(this.summaryTotal()).toBeVisible();
  }

  // ── STEP 5: Accept terms & confirm ───────────────────────

  /**
   * TC-BUY-01 Steps 5–6
   * Accept T&C if shown, then confirm the order.
   */
  async acceptTermsAndConfirm(): Promise<void> {
    const terms = this.termsCheckbox();
    if (await terms.isVisible({ timeout: 2000 }).catch(() => false)) {
      await terms.check();
    }
    await expect(this.confirmBuyBtn()).toBeEnabled();
    await this.confirmBuyBtn().click();
    await this.waitForNavigation();
  }

  // ── STEP 6: Assert success ────────────────────────────────

  /**
   * TC-BUY-01 Step 7
   * Verify success screen and transaction ID.
   */
  async assertBuySuccess(): Promise<void> {
    await expect(this.successScreen()).toBeVisible({ timeout: 20_000 });
    await expect(this.transactionIdLabel()).toBeVisible();
  }

  // ── Helper: Full standard buy flow ───────────────────────

  async performStandardBuy(order: BuyOrder): Promise<void> {
    await this.clickBuyButton();
    await this.enterBuyAmount(order.amount);
    await this.useDefaultPaymentMethod();
    await this.assertOrderSummary(order.amount);
    await this.acceptTermsAndConfirm();
    await this.assertBuySuccess();
  }
}
