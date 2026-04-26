// ─────────────────────────────────────────────────────────────
//  Page Fixtures — compose all page objects into one fixture
// ─────────────────────────────────────────────────────────────

import { test as base } from '@playwright/test';
import { LoginPage }          from '../pages/LoginPage';
import { KycPage }            from '../pages/KycPage';
import { RiskProfilingPage }  from '../pages/RiskProfilingPage';
import { InvestmentPage }     from '../pages/InvestmentPage';
import { BuyPage }            from '../pages/BuyPage';
import { PortfolioPage }      from '../pages/PortfolioPage';
import { SellPage }           from '../pages/SellPage';
import { ReconciliationPage } from '../pages/ReconciliationPage';
import { DashboardPage }      from '../pages/DashboardPage';

type Pages = {
  loginPage:          LoginPage;
  kycPage:            KycPage;
  riskPage:           RiskProfilingPage;
  investPage:         InvestmentPage;
  buyPage:            BuyPage;
  portfolioPage:      PortfolioPage;
  sellPage:           SellPage;
  reconciliationPage: ReconciliationPage;
  dashboardPage:      DashboardPage;
};

export const test = base.extend<Pages>({
  loginPage:          async ({ page }, use) => use(new LoginPage(page)),
  kycPage:            async ({ page }, use) => use(new KycPage(page)),
  riskPage:           async ({ page }, use) => use(new RiskProfilingPage(page)),
  investPage:         async ({ page }, use) => use(new InvestmentPage(page)),
  buyPage:            async ({ page }, use) => use(new BuyPage(page)),
  portfolioPage:      async ({ page }, use) => use(new PortfolioPage(page)),
  sellPage:           async ({ page }, use) => use(new SellPage(page)),
  reconciliationPage: async ({ page }, use) => use(new ReconciliationPage(page)),
  dashboardPage:      async ({ page }, use) => use(new DashboardPage(page)),
});

export { expect } from '@playwright/test';
