// ─────────────────────────────────────────────────────────────
//  Nuqi Wealth Global — Test Data Loader
//  Reads JSON / CSV / Excel / API into typed structures.
// ─────────────────────────────────────────────────────────────

import * as fs   from 'fs';
import * as path from 'path';
import type { UserCredentials, KycData, InvestmentPlan, BuyOrder, SellOrder } from '../types';

// Resolved at runtime relative to this file (works in CJS / esbuild / tsx)
const DATA_DIR = path.join(__dirname, '..', 'test-data');

// ── File-shape types ─────────────────────────────────────────

export type UserPoolKey =
  | 'signupUser'        // Flow 1: new user  — Email → OTP → Registration
  | 'existingUser'      // Flow 2: existing  — Email → OTP → Dashboard
  | 'otpUser'           // Flow 2 (isolated) — dedicated OTP login user
  | 'returningUser'     // Flow 3: returning — Email + Password → Dashboard
  | 'googleUser'        // Flow 4: OAuth     — Google → Dashboard/Registration
  | 'appleUser'         // Flow 4: OAuth     — Apple  → Dashboard/Registration
  | 'newUser'           // lifecycle tests (email+password, pre-KYC state)
  | 'powerUser'         // power-user lifecycle tests
  | 'incompleteKycUser' | 'autoKycUser' | 'singleHoldingUser';

export interface UsersFile {
  pool: Record<UserPoolKey, UserCredentials>;
}

export interface KycDataset extends KycData {
  id: string;
}

export interface KycFile {
  datasets: KycDataset[];
}

export interface PlanVariant extends InvestmentPlan {
  id: string;
}

export interface PlansFile {
  plans: PlanVariant[];
}

export interface BuyOrderVariant extends BuyOrder {
  id: string;
}

export interface SellOrderVariant extends SellOrder {
  id: string;
}

export interface OrdersFile {
  buyOrders:  BuyOrderVariant[];
  sellOrders: SellOrderVariant[];
}

export interface ScenarioDefinition {
  id:                     string;
  name:                   string;
  description:            string;
  tags:                   string[];
  user:                   UserPoolKey;
  kycVariant:             string;
  riskProfile:            string;
  investmentType:         string;
  planId?:                string;
  buyVariant:             string;
  buyOrderId:             string;
  sellVariant:            string;
  sellOrderId?:           string;
  includesReconciliation: boolean;
  device?:                'android' | 'ios';
}

export interface ScenariosFile {
  scenarios: ScenarioDefinition[];
}

// ── DataLoader ────────────────────────────────────────────────

export class DataLoader {
  private static cache = new Map<string, unknown>();

  /** Read and parse a JSON file from the test-data directory. Results are cached. */
  static loadJson<T>(filename: string): T {
    if (this.cache.has(filename)) return this.cache.get(filename) as T;
    const filePath = path.join(DATA_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as T;
    this.cache.set(filename, data);
    return data;
  }

  /** Clear the in-memory JSON cache (useful between test suites). */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Parse a CSV file from the test-data directory.
   * Expects a header row; returns one object per data row.
   */
  static loadCsv(filename: string): Record<string, string>[] {
    const filePath = path.join(DATA_DIR, filename);
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    });
  }

 
  static async loadExcel(filename: string): Promise<Record<string, unknown>[]> {
    let xlsx: typeof import('xlsx');
    try {
      xlsx = await import('xlsx');
    } catch {
      throw new Error(
        `xlsx package is required for Excel support.\n` 
      );
    }
    const filePath = path.join(DATA_DIR, filename);
    const workbook = xlsx.readFile(filePath);
    const sheet    = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet);
  }

  /**
   * Fetch JSON data from an external API endpoint.
   * Requires Node 18+ (native fetch) or a polyfill.
   */
  static async fetchFromApi<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`API fetch failed: ${res.status} ${res.statusText} — ${url}`);
    }
    return res.json() as Promise<T>;
  }

  // ── Typed convenience loaders ─────────────────────────────

  static users():     UsersFile     { return DataLoader.loadJson<UsersFile>('users.json'); }
  static kyc():       KycFile       { return DataLoader.loadJson<KycFile>('kyc.json'); }
  static plans():     PlansFile     { return DataLoader.loadJson<PlansFile>('plans.json'); }
  static orders():    OrdersFile    { return DataLoader.loadJson<OrdersFile>('orders.json'); }
  static scenarios(): ScenariosFile { return DataLoader.loadJson<ScenariosFile>('scenarios.json'); }
}
