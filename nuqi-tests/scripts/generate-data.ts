#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────
//  Nuqi Wealth Global — Data File Generator
//  Regenerates test-data/*.json from canonical defaults.
//
//  Usage:
//    npm run generate:data               ← regenerate all files
//    npm run generate:data -- --only=kyc,plans
//    npm run generate:data -- --seed=42  ← reproducible fakes
// ─────────────────────────────────────────────────────────────

import * as fs   from 'fs';
import * as path from 'path';
import { DataGenerator } from '../utils/data-generator';
import type {
  UsersFile, KycFile, PlansFile, OrdersFile, ScenariosFile,
} from '../utils/data-loader';

const DATA_DIR = path.join(__dirname, '..', 'test-data');

// ── CLI argument parsing ──────────────────────────────────────

const args  = process.argv.slice(2);
const seed  = args.find(a => a.startsWith('--seed='));
const only  = args.find(a => a.startsWith('--only='));

if (seed) DataGenerator.seed(parseInt(seed.split('=')[1], 10));

const targets = new Set(
  only
    ? only.split('=')[1].split(',').map(s => s.trim())
    : ['users', 'kyc', 'plans', 'orders', 'scenarios'],
);

// ── Helpers ───────────────────────────────────────────────────

function write(filename: string, data: unknown): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`  wrote  ${filename}`);
}

// ── Generators ────────────────────────────────────────────────

function generateUsers(): UsersFile {
  return {
    pool: {
      // Flow 1: new user — Email → OTP → T&C → Registration
      signupUser: {
        email: 'tester3@yopmail.com',
        password: '',
        registrationData: {
          firstName:   'TesterManasi',
          lastName:    'ND',
          dateOfBirth: '2006-06-06',
          phoneNumber: '9867594359',
        },
      },
      // Flow 2: existing user — Email → OTP → Dashboard
      existingUser:     { email: 'test.otp@nuqiuat.com',        password: '', otp: '270782' },
      // Flow 3: returning user — Email + Password → Dashboard
      returningUser:    { email: 'tester2@yopmail.com',         password: 'Tester2@435' },
      // Flow 4: OAuth users — Google/Apple popup → Dashboard/Registration
      googleUser:       { email: 'tautomate224@gmail.com',      password: '' },
      appleUser:        { email: 'test.apple@icloud.com',       password: '' },
      // Support users for lifecycle / KYC tests
      newUser:          { email: 'test.new@nuqiuat.com',        password: 'Test@1234' },
      powerUser:        { email: 'test.power@nuqiuat.com',      password: 'Test@1234' },
      incompleteKycUser:{ email: 'test.incomplete@nuqiuat.com', password: '' },
      autoKycUser:      { email: 'test.autokcy@nuqiuat.com',    password: '' },
      singleHoldingUser:{ email: 'test.single@nuqiuat.com',     password: '' },
    },
  };
}

function generateKyc(): KycFile {
  return {
    datasets: [
      {
        id:          'default',
        ...DataGenerator.kycData({
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
        }),
      },
      {
        id: 'alternate',
        ...DataGenerator.kycData({
          nationality: 'Saudi Arabia',
          idType:      'national_id',
          phone:       '+966501234567',
          country:     'Saudi Arabia',
          city:        'Riyadh',
        }),
      },
      {
        id: 'resume',
        ...DataGenerator.kycData({
          nationality: 'United Arab Emirates',
          idType:      'driving_licence',
          city:        'Dubai',
          country:     'United Arab Emirates',
        }),
      },
    ],
  };
}

function generatePlans(): PlansFile {
  return {
    plans: [
      { id: 'standard',     name: 'Wealth Builder Plan',  targetAmount: 10000, horizon: '5 years',  currency: 'USD' },
      { id: 'conservative', name: 'Steady Growth Plan',   targetAmount: 5000,  horizon: '3 years',  currency: 'USD' },
      { id: 'aggressive',   name: 'High Growth Plan',     targetAmount: 50000, horizon: '10 years', currency: 'USD' },
      { id: 'shortTerm',    name: 'Quick Savings Plan',   targetAmount: 2000,  horizon: '1 year',   currency: 'USD' },
    ],
  };
}

function generateOrders(): OrdersFile {
  return {
    buyOrders: [
      { id: 'standard',        instrument: 'S&P 500 ETF',          amount: 500,  currency: 'USD', paymentMethod: 'card' },
      { id: 'minimum',         instrument: 'S&P 500 ETF',          amount: 100,  currency: 'USD' },
      { id: 'alternatePayment',instrument: 'S&P 500 ETF',          amount: 500,  currency: 'USD', paymentMethod: 'bank_transfer' },
      { id: 'largeBuy',        instrument: 'Global Diversified ETF',amount: 5000, currency: 'USD', paymentMethod: 'card' },
    ],
    sellOrders: [
      { id: 'partial',      instrument: 'S&P 500 ETF', percentage: 50  },
      { id: 'fullExit',     instrument: 'S&P 500 ETF', percentage: 100 },
      { id: 'smallPartial', instrument: 'S&P 500 ETF', percentage: 25  },
      { id: 'byUnits',      instrument: 'S&P 500 ETF', units: 10       },
    ],
  };
}

function generateScenarios(): ScenariosFile {
  return {
    scenarios: [
      {
        id: 'S01', name: 'New User Full Lifecycle',
        description: 'Fresh user: KYC → Risk → Create Plan → Direct Buy → Portfolio → Partial Sell → Reconciliation',
        tags: ['@e2e', '@lifecycle', '@p0', '@smoke'],
        user: 'newUser', kycVariant: 'fresh', riskProfile: 'conservative',
        investmentType: 'plan', planId: 'standard',
        buyVariant: 'standard', buyOrderId: 'standard',
        sellVariant: 'partial', sellOrderId: 'partial',
        includesReconciliation: true,
      },
      {
        id: 'S04', name: 'Returning User Fast-Track',
        description: 'Verified user skips KYC/Risk → Recommendation Buy → Full Sell → Reconciliation',
        tags: ['@e2e', '@lifecycle', '@p1', '@regression'],
        user: 'returningUser', kycVariant: 'already_verified', riskProfile: 'moderate',
        investmentType: 'recommendation',
        buyVariant: 'standard', buyOrderId: 'standard',
        sellVariant: 'full_exit', sellOrderId: 'fullExit',
        includesReconciliation: true,
      },
      {
        id: 'S07', name: 'Power User Multi-Buy',
        description: 'Power user: 3 buys → Portfolio → Partial Sell → Reconciliation',
        tags: ['@e2e', '@lifecycle', '@p1', '@power'],
        user: 'powerUser', kycVariant: 'already_verified', riskProfile: 'aggressive',
        investmentType: 'direct',
        buyVariant: 'standard', buyOrderId: 'standard',
        sellVariant: 'partial', sellOrderId: 'partial',
        includesReconciliation: true,
      },
      {
        id: 'S08', name: 'Power User Plan + Alternate Pay',
        description: 'Power user: Create Plan → Alternate Payment Buy → Full Exit',
        tags: ['@e2e', '@lifecycle', '@p1', '@power'],
        user: 'powerUser', kycVariant: 'already_verified', riskProfile: 'aggressive',
        investmentType: 'plan', planId: 'aggressive',
        buyVariant: 'alternate_payment', buyOrderId: 'alternatePayment',
        sellVariant: 'full_exit', sellOrderId: 'fullExit',
        includesReconciliation: true,
      },
      {
        id: 'S09', name: 'Returning User No-Sell',
        description: 'Returning user buys minimum amount, views portfolio — no sell',
        tags: ['@e2e', '@lifecycle', '@p2', '@regression'],
        user: 'returningUser', kycVariant: 'already_verified', riskProfile: 'moderate',
        investmentType: 'recommendation',
        buyVariant: 'minimum_amount', buyOrderId: 'minimum',
        sellVariant: 'none',
        includesReconciliation: false,
      },
      {
        id: 'S10', name: 'Mobile Full Lifecycle — Android',
        description: 'Complete new-user lifecycle on Android Chrome',
        tags: ['@e2e', '@lifecycle', '@mobile', '@p1'],
        user: 'newUser', kycVariant: 'fresh', riskProfile: 'moderate',
        investmentType: 'plan', planId: 'conservative',
        buyVariant: 'standard', buyOrderId: 'standard',
        sellVariant: 'partial', sellOrderId: 'partial',
        includesReconciliation: true, device: 'android',
      },
      {
        id: 'S11', name: 'Mobile Returning User — iOS',
        description: 'Returning user on iOS Safari — view portfolio, no sell',
        tags: ['@e2e', '@lifecycle', '@mobile', '@p2'],
        user: 'returningUser', kycVariant: 'already_verified', riskProfile: 'conservative',
        investmentType: 'recommendation',
        buyVariant: 'standard', buyOrderId: 'standard',
        sellVariant: 'none',
        includesReconciliation: false, device: 'ios',
      },
    ],
  };
}

// ── Entry point ───────────────────────────────────────────────

console.log(`\nGenerating test data files → ${DATA_DIR}\n`);

if (targets.has('users'))     write('users.json',     generateUsers());
if (targets.has('kyc'))       write('kyc.json',       generateKyc());
if (targets.has('plans'))     write('plans.json',     generatePlans());
if (targets.has('orders'))    write('orders.json',    generateOrders());
if (targets.has('scenarios')) write('scenarios.json', generateScenarios());

console.log('\nDone.\n');
