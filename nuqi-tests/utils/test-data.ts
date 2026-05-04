// ─────────────────────────────────────────────────────────────
//  Nuqi Wealth Global — Test Data Factory
//  Priority: env vars → test-data/*.json → hardcoded fallbacks
// ─────────────────────────────────────────────────────────────

import type { UserCredentials, KycData, InvestmentPlan, BuyOrder, SellOrder } from '../types';
import { DataLoader } from './data-loader';
import { DataGenerator } from './data-generator';

// ── Safe JSON loaders (missing files degrade gracefully) ──────

function fileUsers() {
  try { return DataLoader.users().pool; } catch { return {} as Record<string, UserCredentials>; }
}

function fileKyc() {
  try { return DataLoader.kyc().datasets; } catch { return []; }
}

function filePlans() {
  try { return DataLoader.plans().plans; } catch { return []; }
}

function fileOrders() {
  try { return DataLoader.orders(); } catch { return { buyOrders: [], sellOrders: [] }; }
}


// ── TestUsers  (env → JSON → default) ────────────────────────
// Each method maps to one of the four auth flows.
// Change users.json to update credentials — do not hardcode values in tests.

export const TestUsers = {
  // ── Flow 1: New user — Email → OTP → Signup → Registration ──
  // Use DataGenerator.uniqueEmail() for a fresh address each CI run.
  signupUser: (): UserCredentials => ({
    email:            process.env.TEST_SIGNUP_EMAIL ?? fileUsers()['signupUser']?.email ?? DataGenerator.uniqueEmail('signup'),
    password:         '',
    registrationData: fileUsers()['signupUser']?.registrationData ?? DataGenerator.registrationData(),
  }),

  // ── Flow 2: Existing user — Email → OTP → Dashboard ─────────
  existingUser: (): UserCredentials => ({
    email:    process.env.TEST_EXISTING_EMAIL  ?? fileUsers()['existingUser']?.email    ?? 'test.otp@nuqiuat.com',
    password: '',
    otp:      process.env.TEST_OTP_STATIC      ?? fileUsers()['existingUser']?.otp      ?? '270782',
  }),

  // ── Flow 3: Returning user — Email + Password → Dashboard ───
  returningUser: (): UserCredentials => ({
    email:    process.env.TEST_RETURNING_EMAIL    ?? fileUsers()['returningUser']?.email    ?? 'tester2@yopmail.com',
    password: process.env.TEST_RETURNING_PASSWORD ?? fileUsers()['returningUser']?.password ?? 'Tester2@435',
  }),

  // ── Flow 4: OAuth — Google/Apple → Dashboard (or Registration) ─
  googleUser: (): UserCredentials => ({
    email:    process.env.GOOGLE_TEST_EMAIL    ?? fileUsers()['googleUser']?.email    ?? '',
    password: process.env.GOOGLE_TEST_PASSWORD ?? fileUsers()['googleUser']?.password ?? '',
  }),

  appleUser: (): UserCredentials => ({
    email:    process.env.APPLE_TEST_EMAIL    ?? fileUsers()['appleUser']?.email    ?? '',
    password: process.env.APPLE_TEST_PASSWORD ?? fileUsers()['appleUser']?.password ?? '',
  }),

  // ── Support users for lifecycle / KYC tests ─────────────────
  newUser: (): UserCredentials => ({
    email:    process.env.TEST_NEW_USER_EMAIL    ?? fileUsers()['newUser']?.email    ?? 'test.new@nuqiuat.com',
    password: process.env.TEST_NEW_USER_PASSWORD ?? fileUsers()['newUser']?.password ?? 'Test@1234',
  }),

  powerUser: (): UserCredentials => ({
    email:    process.env.TEST_POWER_EMAIL    ?? fileUsers()['powerUser']?.email    ?? 'test.power@nuqiuat.com',
    password: process.env.TEST_POWER_PASSWORD ?? fileUsers()['powerUser']?.password ?? 'Test@1234',
  }),

  // ── Dedicated OTP login user — isolated from existingUser ───
  otpUser: (): UserCredentials => ({
    email:    process.env.TEST_OTP_EMAIL  ?? fileUsers()['otpUser']?.email ?? 'test.otp@nuqi.com',
    password: '',
    otp:      process.env.TEST_OTP_STATIC ?? fileUsers()['otpUser']?.otp   ?? '270782',
  }),

  incompleteKycUser: (): UserCredentials => ({
    email:    process.env.TEST_INCOMPLETE_KYC_EMAIL ?? fileUsers()['incompleteKycUser']?.email    ?? 'test.incomplete@nuqiuat.com',
    password: process.env.TEST_INCOMPLETE_KYC_PW   ?? fileUsers()['incompleteKycUser']?.password ?? 'Test@1234',
  }),

  autoKycUser: (): UserCredentials => ({
    email:    process.env.TEST_AUTO_KYC_EMAIL ?? fileUsers()['autoKycUser']?.email    ?? 'test.autokyc@nuqiuat.com',
    password: process.env.TEST_AUTO_KYC_PW   ?? fileUsers()['autoKycUser']?.password ?? 'Test@1234',
  }),
};

/**
 * Returns the shared static OTP used by the UAT environment for ALL email
 * flows — both existing-user OTP login and new-user signup verification.
 * Priority: TEST_OTP env var → users.json otpUser.otp → hardcoded fallback.
 */
export function sharedOtp(): string {
  return process.env.TEST_OTP ?? fileUsers()['existingUser']?.otp ?? '270782';
}

// ── Static test data  (JSON → hardcoded fallback) ─────────────

const _defaultKyc = fileKyc().find(d => d.id === 'default');

export const TestKycData: KycData = _defaultKyc ?? {
  firstName:   'John',
  lastName:    'Testington',
  dob:         '1990-01-15',
  nationality: 'United Arab Emirates',
  idType:      'passport',
  idNumber:    'A12345678',
  phone:       '+971501234567',
  address:     '123 Test Street, DIFC',
  city:        'Dubai',
  country:     'United Arab Emirates',
  postalCode:  '00000',
};

const _standardPlan = filePlans().find(p => p.id === 'standard');

export const TestPlan: InvestmentPlan = _standardPlan ?? {
  name:         'Wealth Builder Plan',
  targetAmount: 10000,
  horizon:      '5 years',
  currency:     'USD',
};

const _standardBuy = fileOrders().buyOrders.find(o => o.id === 'standard');
const _minimumBuy  = fileOrders().buyOrders.find(o => o.id === 'minimum');
const _partialSell = fileOrders().sellOrders.find(o => o.id === 'partial');

export const TestBuyOrder: BuyOrder = _standardBuy ?? {
  instrument:    'S&P 500 ETF',
  amount:        500,
  currency:      'USD',
  paymentMethod: 'card',
};

export const MinBuyOrder: BuyOrder = _minimumBuy ?? {
  instrument: 'S&P 500 ETF',
  amount:     100,
  currency:   'USD',
};

export const TestSellOrder: SellOrder = _partialSell ?? {
  instrument: 'S&P 500 ETF',
  percentage: 50,
};

// ── Lookup helpers ────────────────────────────────────────────

/** Return a KYC dataset by id. Throws if the id is not found in kyc.json. */
export function getKycDataset(id: string): KycData {
  return DataGenerator.kycDataById(id);
}

/** Return a buy order by id, or fall back to TestBuyOrder. */
export function getBuyOrder(id: string): BuyOrder {
  return fileOrders().buyOrders.find(o => o.id === id) ?? TestBuyOrder;
}

/** Return a sell order by id, or fall back to TestSellOrder. */
export function getSellOrder(id: string): SellOrder {
  return fileOrders().sellOrders.find(o => o.id === id) ?? TestSellOrder;
}

/** Return a plan by id, or fall back to TestPlan. */
export function getPlan(id: string): InvestmentPlan {
  return filePlans().find(p => p.id === id) ?? TestPlan;
}

/** Return a scenario definition by id (e.g. 'S01'). Returns undefined if not found. */
export function getScenario(id: string) {
  try {
    return DataLoader.scenarios().scenarios.find(s => s.id === id);
  } catch {
    return undefined;
  }
}

// ── Re-exports for convenience ────────────────────────────────

export { DataLoader, DataGenerator };
