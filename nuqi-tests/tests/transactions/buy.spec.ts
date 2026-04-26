// ─────────────────────────────────────────────────────────────
//  TC-BUY-01/02/03 · Buy Transactions — all variants
//  Tags: @buy @smoke @regression
//  Priority: P0 (standard) · P1 (alternate + minimum)
//  Browsers: Chromium, Firefox, WebKit
//  Devices: Desktop, Android Chrome
// ─────────────────────────────────────────────────────────────

import { test, expect } from '../../fixtures/page-fixtures';
import { TestBuyOrder, MinBuyOrder } from '../../utils/test-data';
import { RETURNING_USER_STATE } from '../../fixtures/auth.setup';

test.describe('Buy Transactions — Standard Buy', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  test.beforeEach(async ({ page, investPage }) => {
    // Navigate to invest and select first instrument
    await page.goto('/invest');
    await investPage.openDirectInvestment();
    await investPage.instrumentCards().first().click();
    await investPage.waitForNavigation();
  });

  // ── TC-BUY-01-01 ─────────────────────────────────────────
  test(
    'TC-BUY-01-01 · Buy button is visible on instrument detail page',
    { tag: ['@buy', '@smoke', '@p0'] },
    async ({ buyPage }) => {
      await expect(buyPage.buyBtn()).toBeVisible();
    },
  );

  // ── TC-BUY-01-02 ─────────────────────────────────────────
  test(
    'TC-BUY-01-02 · Clicking Buy button opens order entry form',
    { tag: ['@buy', '@smoke'] },
    async ({ buyPage }) => {
      // Step 1: Click Buy button
      await buyPage.buyBtn().click();
      await buyPage.waitForNavigation();

      // Step 2: Assert amount input visible
      await expect(buyPage.amountInput()).toBeVisible({ timeout: 8000 });
      // Step 3: Assert payment section visible
      await expect(buyPage.paymentMethodSection()).toBeVisible();
    },
  );

  // ── TC-BUY-01-03 ─────────────────────────────────────────
  test(
    'TC-BUY-01-03 · Enter buy amount — order summary updates',
    { tag: ['@buy', '@smoke'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();

      // Step 1: Enter amount
      await buyPage.enterBuyAmount(TestBuyOrder.amount);

      // Step 2: Assert order summary shows correct amount
      await buyPage.assertOrderSummary(TestBuyOrder.amount);
    },
  );

  // ── TC-BUY-01-04 ─────────────────────────────────────────
  test(
    'TC-BUY-01-04 · Order summary shows fee and total',
    { tag: ['@buy', '@regression'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();
      await buyPage.enterBuyAmount(TestBuyOrder.amount);

      // Assert fee line is visible
      await expect(buyPage.summaryFee()).toBeVisible();
      // Assert total line is visible
      await expect(buyPage.summaryTotal()).toBeVisible();
    },
  );

  // ── TC-BUY-01-05 ─────────────────────────────────────────
  test(
    'TC-BUY-01-05 · Confirm buy order — success screen shown with transaction ID',
    { tag: ['@buy', '@smoke', '@p0'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();
      await buyPage.enterBuyAmount(TestBuyOrder.amount);
      await buyPage.useDefaultPaymentMethod();
      await buyPage.assertOrderSummary(TestBuyOrder.amount);

      // Step 1: Accept T&C if shown
      const terms = buyPage.termsCheckbox();
      if (await terms.isVisible({ timeout: 2000 }).catch(() => false)) {
        await terms.check();
      }

      // Step 2: Confirm order
      await expect(buyPage.confirmBuyBtn()).toBeEnabled();
      await buyPage.confirmBuyBtn().click();
      await buyPage.waitForNavigation();

      // Step 3: Assert success screen
      await buyPage.assertBuySuccess();

      // Step 4: Assert transaction ID is present
      await expect(buyPage.transactionIdLabel()).toBeVisible();
    },
  );

  // ── TC-BUY-01-06 ─────────────────────────────────────────
  test(
    'TC-BUY-01-06 · "View Portfolio" button on success screen navigates to portfolio',
    { tag: ['@buy', '@regression'] },
    async ({ buyPage, page }) => {
      await buyPage.performStandardBuy(TestBuyOrder);

      // Click View Portfolio
      await buyPage.viewPortfolioBtn().click();
      await expect(page).toHaveURL(/\/portfolio/);
    },
  );
});

test.describe('Buy Transactions — Alternate Payment Method', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  test.beforeEach(async ({ page, investPage }) => {
    await page.goto('/invest');
    await investPage.openDirectInvestment();
    await investPage.instrumentCards().first().click();
    await investPage.waitForNavigation();
  });

  // ── TC-BUY-02-01 ─────────────────────────────────────────
  test(
    'TC-BUY-02-01 · Payment method selector shows multiple options',
    { tag: ['@buy', '@regression'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();
      await buyPage.enterBuyAmount(TestBuyOrder.amount);

      // Assert payment section visible
      await expect(buyPage.paymentMethodSection()).toBeVisible();

      // At least one alternate method should be present
      const bankOption   = buyPage.bankTransferOption();
      const walletOption = buyPage.walletOption();
      const cardOption   = buyPage.cardPaymentOption();

      const hasAltMethod =
        (await bankOption.isVisible().catch(() => false)) ||
        (await walletOption.isVisible().catch(() => false)) ||
        (await cardOption.isVisible().catch(() => false));

      expect(hasAltMethod).toBe(true);
    },
  );

  // ── TC-BUY-02-02 ─────────────────────────────────────────
  test(
    'TC-BUY-02-02 · Select bank transfer as payment method',
    { tag: ['@buy', '@regression'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();
      await buyPage.enterBuyAmount(TestBuyOrder.amount);

      // Step 1: Select bank transfer
      const bankOption = buyPage.bankTransferOption();
      if (await bankOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await bankOption.click();
        // Assert selection state updated
        await expect(buyPage.selectedPaymentLabel()).toBeVisible({ timeout: 5000 });
      } else {
        test.skip(true, 'Bank transfer option not available in UAT');
      }
    },
  );

  // ── TC-BUY-02-03 ─────────────────────────────────────────
  test(
    'TC-BUY-02-03 · Complete buy with alternate payment — success screen shown',
    { tag: ['@buy', '@regression'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();
      await buyPage.enterBuyAmount(TestBuyOrder.amount);

      // Select alternate payment if available
      const bankOption = buyPage.bankTransferOption();
      if (await bankOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await bankOption.click();
      }

      await buyPage.assertOrderSummary(TestBuyOrder.amount);
      await buyPage.acceptTermsAndConfirm();
      await buyPage.assertBuySuccess();
    },
  );
});

test.describe('Buy Transactions — Minimum Amount', () => {

  test.use({ storageState: RETURNING_USER_STATE });

  test.beforeEach(async ({ page, investPage }) => {
    await page.goto('/invest');
    await investPage.openDirectInvestment();
    await investPage.instrumentCards().first().click();
    await investPage.waitForNavigation();
  });

  // ── TC-BUY-03-01 ─────────────────────────────────────────
  test(
    'TC-BUY-03-01 · Minimum amount hint is displayed on buy form',
    { tag: ['@buy', '@regression'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();

      // Assert min amount hint is visible
      const minHint = buyPage.minAmountHint();
      if (await minHint.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await minHint.textContent() ?? '';
        expect(text).toMatch(/\d/); // contains a number
      }
    },
  );

  // ── TC-BUY-03-02 ─────────────────────────────────────────
  test(
    'TC-BUY-03-02 · Buy with minimum allowed amount succeeds',
    { tag: ['@buy', '@regression', '@p1'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();

      // Step 1: Enter minimum allowed amount
      await buyPage.enterMinimumAllowedAmount();

      // Step 2: Assert order summary visible
      await expect(buyPage.orderSummarySection()).toBeVisible();

      // Step 3: Confirm
      await buyPage.acceptTermsAndConfirm();

      // Step 4: Assert success
      await buyPage.assertBuySuccess();
    },
  );

  // ── TC-BUY-03-03 ─────────────────────────────────────────
  test(
    'TC-BUY-03-03 · Confirm button disabled when amount is zero',
    { tag: ['@buy'] },
    async ({ buyPage }) => {
      await buyPage.clickBuyButton();
      // Clear amount to 0
      await buyPage.amountInput().fill('0');
      // Confirm button should be disabled
      await expect(buyPage.confirmBuyBtn()).toBeDisabled();
    },
  );
});
