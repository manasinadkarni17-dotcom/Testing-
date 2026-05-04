// ─────────────────────────────────────────────────────────────
//  Auth Setup — generates storageState files for each user type
// ─────────────────────────────────────────────────────────────

import { test as setup, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TestUsers } from '../utils/test-data';
import fs from 'fs';
import path from 'path';

// Ensure sequential execution
setup.describe.configure({ mode: 'serial' });

// Create auth state directory
const stateDir = path.join(__dirname, '../.auth');
if (!fs.existsSync(stateDir)) {
  fs.mkdirSync(stateDir, { recursive: true });
}

// State file paths
export const RETURNING_USER_STATE = path.join(stateDir, 'returning-user.json');
export const POWER_USER_STATE     = path.join(stateDir, 'power-user.json');

// Typed helper
async function loginAndSaveState(
  page: Page,
  credentials: { email: string; password: string },
  statePath: string
) {
  const loginPage = new LoginPage(page);
  const dashPage = new DashboardPage(page);

  await loginPage.navigate();
  await loginPage.loginWithEmailPassword(credentials);
  await dashPage.assertDashboardLoaded();

  await page.context().storageState({ path: statePath });
  console.log(`[setup] Auth state saved: ${statePath}`);
}

// ─────────────────────────────────────────────────────────────
//  Setup tests
// ─────────────────────────────────────────────────────────────

setup('generate: returning user auth state', async ({ page }) => {
  await loginAndSaveState(page, TestUsers.returningUser(), RETURNING_USER_STATE);
});

setup('generate: power user auth state', async ({ page }) => {
  await loginAndSaveState(page, TestUsers.powerUser(), POWER_USER_STATE);
});