# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: risk\risk-profiling.spec.ts >> Risk Profiling — Conservative >> TC-RISK-01-01 · Risk profiling prompt appears for new user
- Location: tests\risk\risk-profiling.spec.ts:145:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Terms & Conditions' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Terms & Conditions' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - main [ref=e4]:
    - generic [ref=e5]:
      - img "Company logo" [ref=e7]
      - generic [ref=e9]:
        - generic [ref=e10]:
          - heading "Ethically screened portfolios for Global stock markets" [level=2] [ref=e11]
          - paragraph [ref=e12]: Because growing wealth should never come at the cost of your values.
        - generic [ref=e13]:
          - heading "Specially curated equity baskets by certified experts" [level=2] [ref=e14]
          - paragraph [ref=e15]: Designed with care so you can invest smart without the stress.
        - generic [ref=e16]:
          - heading "Personalized risk profiling for smarter decisions" [level=2] [ref=e17]
          - paragraph [ref=e18]: Your goals, your comfort, your pace — investing tailored just for you.
    - generic [ref=e26]:
      - generic [ref=e27]:
        - img [ref=e29]
        - heading "Verify OTP" [level=2] [ref=e31]
        - paragraph [ref=e32]:
          - text: Enter the 6-digit code sent to
          - text: risk+1777892984168@nuqiuat.com
      - generic [ref=e33]:
        - textbox [ref=e34]: "2"
        - textbox [ref=e35]: "7"
        - textbox [ref=e36]: "0"
        - textbox [ref=e37]: "7"
        - textbox [ref=e38]: "8"
        - textbox [ref=e39]: "2"
      - paragraph [ref=e41]: Resend OTP in 0:44
      - button "Wrong email? Go back" [ref=e43] [cursor=pointer]:
        - img [ref=e44]
        - text: Wrong email? Go back
  - contentinfo [ref=e46]:
    - text: © 2025 Nuqi Digital Wealth Limited. All rights reserved.
    - text: "Nuqi Digital Wealth Limited is regulated by the Dubai Financial Services Authority (“DFSA”) in the Dubai International Financial Center (“DIFC”) and holds a Category 3C license with a Retail Client Endorsement. Arranging and advising of financial services and managing assets. Nuqi Digital Wealth Limited’s registered address is UAE: Office 501, 05th Floor, Innovation One, DIFC, Dubai, UAE, United Arab Emirates."
```

# Test source

```ts
  1   | import { Page, Locator, expect } from '@playwright/test';
  2   | import { BasePage } from './BasePage';
  3   | 
  4   | export class TermsAndConditionsPage extends BasePage {
  5   | 
  6   |   // ── Page-level elements ───────────────────────────────────────────────────
  7   | 
  8   |   readonly heading: Locator;
  9   |   readonly reviewedCounter: Locator;
  10  |   readonly acceptFinalBtn: Locator;      // "Accept & Continue" — enabled after all 5 reviewed
  11  | 
  12  |   // ── Modal element ─────────────────────────────────────────────────────────
  13  | 
  14  |   readonly acceptSectionBtn: Locator;   // "Accept and Continue" — inside each section modal
  15  | 
  16  |   // ── Section rows ─────────────────────────────────────────────────────────
  17  | 
  18  |   readonly termsOfUseRow: Locator;
  19  |   readonly disclaimerRow: Locator;
  20  |   readonly clientAgreementDigitalRow: Locator;
  21  |   readonly clientAgreementGlobalRow: Locator;
  22  |   readonly privacyPolicyRow: Locator;
  23  | 
  24  |   constructor(page: Page) {
  25  |     super(page);
  26  | 
  27  |     this.heading            = page.getByRole('heading', { name: 'Terms & Conditions' });
  28  |     this.reviewedCounter    = page.getByText(/\d of 5 sections reviewed/i);
  29  |     this.acceptFinalBtn     = page.getByRole('button', { name: 'Accept & Continue',   exact: true });
  30  |     this.acceptSectionBtn   = page.getByRole('button', { name: 'Accept and Continue', exact: true });
  31  | 
  32  |     this.termsOfUseRow             = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Terms of Use' });
  33  |     this.disclaimerRow             = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Disclaimer' });
  34  |     this.clientAgreementDigitalRow = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Client Service Agreement (Nuqi Digital Wealth Ltd.)' });
  35  |     this.clientAgreementGlobalRow  = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Client Service Agreement (Nuqi Global Ltd.)' });
  36  |     this.privacyPolicyRow          = page.locator('div.space-y-3 div.group.cursor-pointer', { hasText: 'Privacy Policy' });
  37  |   }
  38  | 
  39  |   // ── Waits ─────────────────────────────────────────────────────────────────
  40  | 
  41  |   async waitForPage(): Promise<void> {
  42  |     await this.page.waitForURL('**/termsandcondition', { timeout: 15_000 });
> 43  |     await expect(this.heading).toBeVisible({ timeout: 10_000 });
      |                                ^ Error: expect(locator).toBeVisible() failed
  44  |     await expect(this.page.getByText('0 of 5 sections reviewed')).toBeVisible();
  45  |   }
  46  | 
  47  |   // ── Core flow ─────────────────────────────────────────────────────────────
  48  | 
  49  |   /**
  50  |    * Opens a single section modal, scrolls to bottom, clicks "Accept and Continue",
  51  |    * then waits for the modal to close.
  52  |    */
  53  |   async reviewAndAcceptSection(row: Locator): Promise<void> {
  54  |     await row.waitFor({ state: 'visible', timeout: 5_000 });
  55  |     await row.hover();
  56  |     await row.click();
  57  | 
  58  |     // Overlay opens → body overflow becomes hidden
  59  |     await this.page.waitForFunction(
  60  |       () => document.body.style.overflow === 'hidden',
  61  |       { timeout: 10_000 }
  62  |     );
  63  | 
  64  |     await this._scrollOverlayToBottom();
  65  | 
  66  |     await this.acceptSectionBtn.waitFor({ state: 'visible', timeout: 10_000 });
  67  |     await this.acceptSectionBtn.scrollIntoViewIfNeeded();
  68  |     await this.acceptSectionBtn.click();
  69  | 
  70  |     // Overlay closes → body overflow returns to normal
  71  |     await this.page.waitForFunction(
  72  |       () => document.body.style.overflow !== 'hidden',
  73  |       { timeout: 10_000 }
  74  |     );
  75  | 
  76  |     await expect(this.acceptSectionBtn).not.toBeVisible({ timeout: 5_000 });
  77  |     await this.page.waitForTimeout(300);
  78  |   }
  79  | 
  80  |   /**
  81  |    * Accepts all 5 T&C sections in order, asserts counter after each,
  82  |    * then clicks the final "Accept & Continue" button.
  83  |    */
  84  |   async acceptAll(): Promise<void> {
  85  |     await this.waitForPage();
  86  | 
  87  |     const sections: Array<{ name: string; row: Locator }> = [
  88  |       { name: 'Terms of Use',                                        row: this.termsOfUseRow },
  89  |       { name: 'Disclaimer',                                          row: this.disclaimerRow },
  90  |       { name: 'Client Service Agreement (Nuqi Digital Wealth Ltd.)', row: this.clientAgreementDigitalRow },
  91  |       { name: 'Client Service Agreement (Nuqi Global Ltd.)',         row: this.clientAgreementGlobalRow },
  92  |       { name: 'Privacy Policy',                                      row: this.privacyPolicyRow },
  93  |     ];
  94  | 
  95  |     for (let i = 0; i < sections.length; i++) {
  96  |       const { row } = sections[i];
  97  | 
  98  |       await this.reviewAndAcceptSection(row);
  99  | 
  100 |       // Assert row icon turned teal and counter incremented
  101 |       await expect(row.locator('svg.lucide-circle-check')).toHaveClass(/text-nuqi-teal/, { timeout: 5_000 });
  102 |       await expect(this.page.getByText(`${i + 1} of 5 sections reviewed`)).toBeVisible({ timeout: 5_000 });
  103 |     }
  104 | 
  105 |     await expect(this.page.getByText('5 of 5 sections reviewed')).toBeVisible({ timeout: 5_000 });
  106 |     await expect(this.acceptFinalBtn).toBeEnabled({ timeout: 10_000 });
  107 |     await this.acceptFinalBtn.click();
  108 |     await this.waitForNavigation();
  109 |   }
  110 | 
  111 |   /**
  112 |    * Returns the current "X of 5 sections reviewed" counter text.
  113 |    */
  114 |   async getReviewedCounterText(): Promise<string> {
  115 |     return (await this.reviewedCounter.textContent()) ?? '';
  116 |   }
  117 | 
  118 |   /**
  119 |    * Safe guard for flows where T&C may or may not appear (e.g. returning user after a T&C update).
  120 |    * Returns true if T&C was shown and fully accepted, false if not shown.
  121 |    */
  122 |   async handleIfPresent(timeoutMs = 5_000): Promise<boolean> {
  123 |     const appeared = await this.heading
  124 |       .isVisible({ timeout: timeoutMs })
  125 |       .catch(() => false);
  126 | 
  127 |     if (!appeared) return false;
  128 | 
  129 |     await this.acceptAll();
  130 |     return true;
  131 |   }
  132 | 
  133 |   // ── Private helpers ───────────────────────────────────────────────────────
  134 | 
  135 |   private async _scrollOverlayToBottom(): Promise<void> {
  136 |     await this.page.evaluate(() => {
  137 |       const inner = document.querySelector(
  138 |         'div.fixed.inset-0 .overflow-y-auto, div.fixed.inset-0 [class*="overflow-y-auto"]'
  139 |       );
  140 |       if (inner) { inner.scrollTop = inner.scrollHeight; return; }
  141 |       const overlay = document.querySelector('div.fixed.inset-0');
  142 |       if (overlay) overlay.scrollTop = overlay.scrollHeight;
  143 |     });
```