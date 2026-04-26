// ─────────────────────────────────────────────────────────────
//  Nuqi Wealth Global — Test Helpers
// ─────────────────────────────────────────────────────────────

import { Page, expect } from '@playwright/test';

/**
 * Wait for a network request matching a URL pattern to complete.
 * Useful after form submissions that trigger API calls.
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  triggerFn: () => Promise<void>,
): Promise<void> {
  const [response] = await Promise.all([
    page.waitForResponse(urlPattern),
    triggerFn(),
  ]);
  expect(response.ok()).toBeTruthy();
}

/**
 * Dismiss any cookie/consent banners that may appear on navigation.
 */
export async function dismissConsentBanner(page: Page): Promise<void> {
  const acceptBtn = page.locator(
    '[data-testid="cookie-accept"], button:has-text("Accept"), button:has-text("Accept All")',
  );
  if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acceptBtn.first().click();
  }
}

/**
 * Scroll element into view and click — safer than direct click on
 * elements partially outside the viewport.
 */
export async function scrollAndClick(page: Page, selector: string): Promise<void> {
  const el = page.locator(selector);
  await el.scrollIntoViewIfNeeded();
  await el.click();
}

/**
 * Wait for loading spinners/overlays to disappear.
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  const spinner = page.locator(
    '[data-testid="loading-spinner"], .loading-overlay, [aria-label="Loading"]',
  );
  await spinner.waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {
    // spinner may not appear at all — that's fine
  });
}

/**
 * Generate a unique email for fresh-registration tests.
 */
export function generateTestEmail(prefix = 'test'): string {
  const ts = Date.now();
  return `${prefix}+${ts}@nuqiuat.com`;
}

/**
 * Assert a toast/snackbar message is visible with the expected text.
 */
export async function expectToast(page: Page, message: string): Promise<void> {
  const toast = page.locator(
    '[data-testid="toast"], [role="alert"], .toast-message, .snackbar',
  );
  await expect(toast.filter({ hasText: message })).toBeVisible({ timeout: 8000 });
}

/**
 * Retry a flaky action up to `maxAttempts` times.
 */
export async function retryAction(
  action: () => Promise<void>,
  maxAttempts = 3,
  delayMs = 500,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await action();
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
