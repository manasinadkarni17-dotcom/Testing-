import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TermsAndConditionsPage extends BasePage {

  // ── Page-level elements ───────────────────────────────────────────────────

  readonly heading: Locator;
  readonly reviewedCounter: Locator;
  readonly acceptFinalBtn: Locator;      // "Accept & Continue" — enabled after all 5 reviewed

  // ── Modal element ─────────────────────────────────────────────────────────

  readonly acceptSectionBtn: Locator;   // "Accept and Continue" — inside each section modal

  // ── Section rows ─────────────────────────────────────────────────────────

  readonly termsOfUseRow: Locator;
  readonly disclaimerRow: Locator;
  readonly clientAgreementDigitalRow: Locator;
  readonly clientAgreementGlobalRow: Locator;
  readonly privacyPolicyRow: Locator;

  constructor(page: Page) {
    super(page);

    this.heading            = page.getByRole('heading', { name: 'Terms & Conditions' });
    this.reviewedCounter    = page.getByText(/\d of 5 sections reviewed/i);
    this.acceptFinalBtn     = page.getByRole('button', { name: 'Accept & Continue',   exact: true });
    this.acceptSectionBtn   = page.getByRole('button', { name: 'Accept and Continue', exact: true });

    this.termsOfUseRow             = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Terms of Use' });
    this.disclaimerRow             = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Disclaimer' });
    this.clientAgreementDigitalRow = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Client Service Agreement (Nuqi Digital Wealth Ltd.)' });
    this.clientAgreementGlobalRow  = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Client Service Agreement (Nuqi Global Ltd.)' });
    this.privacyPolicyRow          = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Privacy Policy' });
  }

  // ── Waits ─────────────────────────────────────────────────────────────────

  async waitForPage(): Promise<void> {
    await this.page.waitForURL('**/termsandcondition', { timeout: 15_000 });
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('0 of 5 sections reviewed')).toBeVisible();
  }

  // ── Core flow ─────────────────────────────────────────────────────────────

  /**
   * Opens a single section modal, scrolls to bottom, clicks "Accept and Continue",
   * then waits for the modal to close.
   */
  async reviewAndAcceptSection(row: Locator): Promise<void> {
    await row.waitFor({ state: 'visible', timeout: 5_000 });
    await row.hover();
    await row.click();

    // Overlay opens → body overflow becomes hidden
    await this.page.waitForFunction(
      () => document.body.style.overflow === 'hidden',
      { timeout: 10_000 }
    );

    await this._scrollOverlayToBottom();

    await this.acceptSectionBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await this.acceptSectionBtn.scrollIntoViewIfNeeded();
    await this.acceptSectionBtn.click();

    // Overlay closes → body overflow returns to normal
    await this.page.waitForFunction(
      () => document.body.style.overflow !== 'hidden',
      { timeout: 10_000 }
    );

    await expect(this.acceptSectionBtn).not.toBeVisible({ timeout: 5_000 });
    await this.page.waitForTimeout(300);
  }

  /**
   * Accepts all 5 T&C sections in order, asserts counter after each,
   * then clicks the final "Accept & Continue" button.
   */
  async acceptAll(): Promise<void> {
    await this.waitForPage();

    const sections: Array<{ name: string; row: Locator }> = [
      { name: 'Terms of Use',                                        row: this.termsOfUseRow },
      { name: 'Disclaimer',                                          row: this.disclaimerRow },
      { name: 'Client Service Agreement (Nuqi Digital Wealth Ltd.)', row: this.clientAgreementDigitalRow },
      { name: 'Client Service Agreement (Nuqi Global Ltd.)',         row: this.clientAgreementGlobalRow },
      { name: 'Privacy Policy',                                      row: this.privacyPolicyRow },
    ];

    for (let i = 0; i < sections.length; i++) {
      const { row } = sections[i];

      await this.reviewAndAcceptSection(row);

      // Assert row icon turned teal and counter incremented
      await expect(row.locator('svg.lucide-circle-check')).toHaveClass(/text-nuqi-teal/, { timeout: 5_000 });
      await expect(this.page.getByText(`${i + 1} of 5 sections reviewed`)).toBeVisible({ timeout: 5_000 });
    }

    await expect(this.page.getByText('5 of 5 sections reviewed')).toBeVisible({ timeout: 5_000 });
    await expect(this.acceptFinalBtn).toBeEnabled({ timeout: 10_000 });
    await this.acceptFinalBtn.click();
    await this.waitForNavigation();
  }

  /**
   * Returns the current "X of 5 sections reviewed" counter text.
   */
  async getReviewedCounterText(): Promise<string> {
    return (await this.reviewedCounter.textContent()) ?? '';
  }

  /**
   * Safe guard for flows where T&C may or may not appear (e.g. returning user after a T&C update).
   * Returns true if T&C was shown and fully accepted, false if not shown.
   */
  async handleIfPresent(timeoutMs = 5_000): Promise<boolean> {
    const appeared = await this.heading
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);

    if (!appeared) return false;

    await this.acceptAll();
    return true;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async _scrollOverlayToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      const inner = document.querySelector(
        'div.fixed.inset-0 .overflow-y-auto, div.fixed.inset-0 [class*="overflow-y-auto"]'
      );
      if (inner) { inner.scrollTop = inner.scrollHeight; return; }
      const overlay = document.querySelector('div.fixed.inset-0');
      if (overlay) overlay.scrollTop = overlay.scrollHeight;
    });

    await this.page.waitForTimeout(300);

    if (!await this.acceptSectionBtn.isVisible()) {
      await this.page.keyboard.press('End');
      await this.page.waitForTimeout(200);
    }
  }
}
