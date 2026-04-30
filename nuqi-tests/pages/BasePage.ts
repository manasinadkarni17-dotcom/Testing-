// ─────────────────────────────────────────────────────────────
//  BasePage — shared helpers inherited by all page objects
// ─────────────────────────────────────────────────────────────

import { Page, Locator, expect } from '@playwright/test';
import { waitForLoadingComplete } from '../utils/helpers';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get $page(): Page {
    return this.page;
  }
  // ── Navigation ─────────────────────────────────────────────

  async goto(path = ''): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.page.locator('text=Loading...').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    await waitForLoadingComplete(this.page);
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await waitForLoadingComplete(this.page);
  }

  // ── Assertions ─────────────────────────────────────────────

  async assertUrl(expectedPath: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  async assertVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  async assertText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toHaveText(text);
  }

  async assertHeading(text: string): Promise<void> {
    await expect(
      this.page.locator('h1, h2').filter({ hasText: text }),
    ).toBeVisible();
  }

  // ── Low-level helpers used by page objects ─────────────────

  /**
   * Click a locator, optionally logging a human-readable label.
   * Waits for loading to complete after the click.
   */
  async click(locator: Locator, _label?: string): Promise<void> {
    await locator.click();
    await waitForLoadingComplete(this.page);
  }

  /**
   * Returns true if the locator is visible within the given timeout (ms).
   * Never throws — safe to use in conditional guards.
   */
  async isVisible(locator: Locator, timeout = 3_000): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false);
  }

  /**
   * Returns the trimmed inner text of a locator, or null if not found.
   */
  async getTextContent(locator: Locator): Promise<string | null> {
    try {
      return (await locator.innerText()).trim();
    } catch {
      return null;
    }
  }

  // ── Common UI interactions ──────────────────────────────────

  async clickButton(label: string): Promise<void> {
    await this.page
      .locator(`button, [role="button"]`)
      .filter({ hasText: label })
      .first()
      .click();
    await waitForLoadingComplete(this.page);
  }

  async fillInput(testId: string, value: string): Promise<void> {
    const el = this.page.locator(`[data-testid="${testId}"], #${testId}, [name="${testId}"]`).first();
    await el.clear();
    await el.fill(value);
  }

  async selectOption(testId: string, value: string): Promise<void> {
    await this.page
      .locator(`[data-testid="${testId}"], select[name="${testId}"]`)
      .first()
      .selectOption(value);
  }

  // ── Error / Toast helpers ───────────────────────────────────

  async getErrorMessage(): Promise<string> {
    const el = this.page.locator('[data-testid="error-message"], .error-text, [role="alert"]').first();
    return await el.innerText();
  }

  async expectSuccessToast(partial?: string): Promise<void> {
    const toast = this.page.locator(
      '[data-testid="toast-success"], [role="alert"].success, .toast--success',
    );
    await expect(toast).toBeVisible({ timeout: 8000 });
    if (partial) await expect(toast).toContainText(partial);
  }
}
