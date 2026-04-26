# Nuqi Wealth Global — Playwright E2E Test Suite

UAT: **https://uat.nuqiwealth.com**  
Framework: **Playwright + TypeScript** (Page Object Model)

---

## Project Structure

```
nuqi-tests/
├── pages/                    ← Page Object Models
│   ├── BasePage.ts           ← Shared base class
│   ├── LoginPage.ts          ← All 4 login variants
│   ├── KycPage.ts            ← Fresh, Resume, Auto, Verified
│   ├── RiskProfilingPage.ts  ← Conservative, Moderate, Aggressive
│   ├── InvestmentPage.ts     ← Plan, Direct, Reco, CTA
│   ├── BuyPage.ts            ← Standard, Alternate, Minimum
│   ├── PortfolioPage.ts      ← Holdings, NAV, Chart
│   ├── SellPage.ts           ← Partial, Full Exit, No Sell
│   ├── ReconciliationPage.ts ← Transaction history
│   └── DashboardPage.ts      ← Post-login dashboard
│
├── tests/
│   ├── auth/
│   │   ├── email-password.spec.ts     TC-AUTH-01
│   │   ├── otp-login.spec.ts          TC-AUTH-02
│   │   └── social-login.spec.ts       TC-AUTH-03/04
│   ├── kyc/
│   │   ├── fresh-kyc.spec.ts          TC-KYC-01
│   │   └── resume-auto-kyc.spec.ts    TC-KYC-02/03/04
│   ├── risk/
│   │   └── risk-profiling.spec.ts     TC-RISK-01 to 04
│   ├── investment/
│   │   └── investment.spec.ts         TC-INV-01 to 04
│   ├── transactions/
│   │   ├── buy.spec.ts                TC-BUY-01 to 03
│   │   ├── sell.spec.ts               TC-SELL-01 to 03
│   │   └── reconciliation.spec.ts     TC-RECON-01 to 10
│   └── lifecycle/
│       ├── new-user-full-lifecycle.spec.ts   S01 (Full E2E)
│       ├── returning-user.spec.ts            S04 + S09 (Fast-track)
│       ├── power-user.spec.ts                S07 + S08
│       └── mobile-lifecycle.spec.ts          S10 + S11
│
├── fixtures/
│   ├── auth.setup.ts         ← Pre-auth storageState generation
│   ├── page-fixtures.ts      ← Combined POM fixture
│   └── assets/               ← Test images (passport, selfie)
│
├── utils/
│   ├── test-data.ts          ← Centralized test data factory
│   └── helpers.ts            ← Shared utility functions
│
├── types/
│   └── index.ts              ← Shared enums and interfaces
│
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install
npx playwright install

# 2. Configure environment
cp .env.example .env
# Edit .env with UAT test credentials

# 3. Run smoke tests (fast, PR gate)
npm run test:smoke

# 4. Run full regression
npm run test:regression

# 5. Run mobile tests only
npm run test:mobile

# 6. View HTML report
npm run report
```

---

## Test Tagging Strategy

| Tag         | Purpose                              | When to run       |
|-------------|--------------------------------------|-------------------|
| `@smoke`    | Critical path, ~10 tests, <5 min     | Every PR          |
| `@regression`| Full coverage, all scenarios        | Nightly           |
| `@e2e`      | Full lifecycle journeys              | Nightly + release |
| `@p0`       | Business-critical — must not fail    | Every PR          |
| `@p1`       | High priority                        | Nightly           |
| `@p2`       | Medium priority                      | Weekly / on-demand|
| `@mobile`   | Android Chrome + iOS Safari only     | Nightly           |
| `@auth`     | Login variant tests                  | After auth changes|
| `@kyc`      | KYC flow tests                       | After KYC changes |
| `@buy`      | Buy transaction tests                | After trade changes|
| `@sell`     | Sell transaction tests               | After trade changes|
| `@power`    | Multi-transaction scenarios          | Nightly           |

---

## Scenario Coverage Map

| Scenario | Flow | Tags |
|----------|------|------|
| S01 | Login(Email) → KYC(Fresh) → Risk(Conservative) → Plan → Buy(Standard) → Portfolio → Sell(Partial) → Recon | @smoke @e2e @p0 |
| S04 | Login(OTP) → KYC(Verified) → Risk(Done) → Recommend → Buy → Sell(Full) → Recon | @smoke @e2e @p0 |
| S07 | Login → Buy×3 → Portfolio → Sell(Partial) → Recon | @power @e2e |
| S08 | Login → Plan+Direct → Buy(Std+Alt) → Sell(Full) → Recon | @power @e2e |
| S09 | Login → Dashboard CTA → Buy(Fast) → Portfolio → Recon | @smoke @e2e @p0 |
| S10 | Mobile Android — Full lifecycle | @mobile @e2e @p1 |
| S11 | Mobile iOS — Returning + No Sell | @mobile @e2e @p2 |

---

## Browser Matrix

| Project           | Engine  | Device            |
|-------------------|---------|-------------------|
| chromium-desktop  | Chromium| Desktop 1280×720  |
| firefox-desktop   | Firefox | Desktop 1280×720  |
| webkit-desktop    | WebKit  | Desktop Safari    |
| android-chrome    | Chromium| Pixel 7 (mobile)  |
| ios-safari        | WebKit  | iPhone 14 (mobile)|

---

## CI / Parallel Execution

```yaml
# GitHub Actions example
- name: Run smoke tests
  run: npx playwright test --grep @smoke --workers=4

- name: Run regression (sharded)
  run: npx playwright test --shard=${{ matrix.shard }}/4
  strategy:
    matrix:
      shard: [1, 2, 3, 4]
```

---

## Adding New Tests

1. Add new selectors to the relevant **Page Object** in `pages/`
2. Add test data in `utils/test-data.ts`
3. Create spec in appropriate `tests/` subfolder
4. Tag with `@smoke`, `@regression`, priority, and feature tag
5. Update this README scenario table

---

## Notes

- **Apple Login** tests run on WebKit only. Set `APPLE_TEST_EMAIL` in `.env`
- **OTP** tests use a static UAT OTP (`TEST_OTP=123456`). Coordinate with backend team to keep this seeded
- **KYC document upload** uses fixture images from `fixtures/assets/`. Add real test images (JPG, ≥300KB) before running
- **storageState** files are generated by `fixtures/auth.setup.ts` and cached in `.auth/`. Delete `.auth/` to force re-login
