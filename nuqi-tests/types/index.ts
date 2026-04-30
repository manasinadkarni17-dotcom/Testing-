// ─────────────────────────────────────────────────────────────
//  Nuqi Wealth Global — Shared Types
// ─────────────────────────────────────────────────────────────

export enum RiskProfile {
  Conservative = 'conservative',
  Moderate     = 'moderate',
  Aggressive   = 'aggressive',
}

export enum InvestmentType {
  Plan           = 'plan',
  Direct         = 'direct',
  Recommendation = 'recommendation',
  DashboardCTA   = 'dashboard_cta',
}

export enum BuyVariant {
  Standard         = 'standard',
  AlternatePayment = 'alternate_payment',
  MinimumAmount    = 'minimum_amount',
}

export enum SellVariant {
  Partial  = 'partial',
  FullExit = 'full_exit',
  None     = 'none',
}

export enum KycVariant {
  Fresh         = 'fresh',
  Resume        = 'resume',
  Auto          = 'auto',
  AlreadyVerified = 'already_verified',
}

export type RegistrationData = {
  firstName:        string;
  lastName:         string;
  dateOfBirth:      string;       // YYYY-MM-DD
  phoneCountryCode: string;       // e.g. "+91"
  phoneNumber:      string;       // local digits only, no country code
};

export interface UserCredentials {
  email:             string;
  password:          string;
  otp?:              string;
  registrationData?: RegistrationData;
}

export interface KycData {
  firstName:   string;
  lastName:    string;
  dob:         string;   // YYYY-MM-DD
  nationality: string;
  idType:      'passport' | 'national_id' | 'driving_licence';
  idNumber:    string;
  phone:       string;
  address:     string;
  city:        string;
  country:     string;
  postalCode:  string;
}

export interface InvestmentPlan {
  name:         string;
  targetAmount: number;
  horizon:      string;   // e.g. "5 years"
  currency:     string;
}

export interface BuyOrder {
  instrument:  string;
  amount:      number;
  currency:    string;
  paymentMethod?: string;
}

export interface SellOrder {
  instrument: string;
  percentage?: number;   // for partial sell
  units?:      number;
}
