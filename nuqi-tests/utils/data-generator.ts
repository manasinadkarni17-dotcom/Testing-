// ─────────────────────────────────────────────────────────────
//  Nuqi Wealth Global — Test Data Generator
//  Faker-backed factory for dynamic, unique test records.
// ─────────────────────────────────────────────────────────────

import { faker } from '@faker-js/faker';
import type { UserCredentials, KycData, InvestmentPlan, BuyOrder, SellOrder } from '../types';

const UAE_CITIES      = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] as const;
const INSTRUMENTS     = ['S&P 500 ETF', 'Global Diversified ETF', 'MENA Growth Fund'] as const;
const HORIZONS        = ['1 year', '3 years', '5 years', '10 years'] as const;
const PAYMENT_METHODS = ['card', 'bank_transfer'] as const;
const ID_TYPES        = ['passport', 'national_id', 'driving_licence'] as const;

export class DataGenerator {
  /** Seed the global faker instance for reproducible runs. */
  static seed(value: number): void {
    faker.seed(value);
  }

  /** Generate a user credential record. Passwords default to the UAT standard. */
  static user(overrides: Partial<UserCredentials> = {}): UserCredentials {
    return {
      email:    faker.internet.email({ provider: 'nuqiuat.com' }).toLowerCase(),
      password: 'Test@1234',
      ...overrides,
    };
  }

  /** Generate a complete KYC data record with UAE defaults. */
  static kycData(overrides: Partial<KycData> = {}): KycData {
    const dob = faker.date
      .birthdate({ min: 21, max: 60, mode: 'age' })
      .toISOString()
      .split('T')[0];

    return {
      firstName:   faker.person.firstName(),
      lastName:    faker.person.lastName(),
      dob,
      nationality: 'United Arab Emirates',
      idType:      faker.helpers.arrayElement(ID_TYPES),
      idNumber:    faker.string.alphanumeric(9).toUpperCase(),
      phone:       `+971${faker.string.numeric(9)}`,
      address:     faker.location.streetAddress(),
      city:        faker.helpers.arrayElement(UAE_CITIES),
      country:     'United Arab Emirates',
      postalCode:  faker.location.zipCode('#####'),
      ...overrides,
    };
  }

  /** Generate an investment plan. */
  static plan(overrides: Partial<InvestmentPlan> = {}): InvestmentPlan {
    return {
      name:         `${faker.commerce.productAdjective()} Growth Plan`,
      targetAmount: faker.number.int({ min: 1_000, max: 100_000 }),
      horizon:      faker.helpers.arrayElement(HORIZONS),
      currency:     'USD',
      ...overrides,
    };
  }

  /** Generate a buy order. */
  static buyOrder(overrides: Partial<BuyOrder> = {}): BuyOrder {
    return {
      instrument:    faker.helpers.arrayElement(INSTRUMENTS),
      amount:        faker.number.int({ min: 100, max: 10_000 }),
      currency:      'USD',
      paymentMethod: faker.helpers.arrayElement(PAYMENT_METHODS),
      ...overrides,
    };
  }

  /** Generate a partial sell order (10–90 %). */
  static sellOrder(overrides: Partial<SellOrder> = {}): SellOrder {
    return {
      instrument: faker.helpers.arrayElement(INSTRUMENTS),
      percentage: faker.number.int({ min: 10, max: 90 }),
      ...overrides,
    };
  }

  /** Generate a unique test email that won't collide with existing accounts. */
  static uniqueEmail(prefix = 'test'): string {
    return `${prefix}+${Date.now()}@nuqiuat.com`;
  }
}
