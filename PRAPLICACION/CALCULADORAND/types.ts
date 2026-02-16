
export interface PercentageEntry {
  age: number;
  percentage: number;
}

export interface UserAccount {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface CalculationInputs {
  marketValue: number;
  age1: number;
  age2: number | null;
  isSinglePerson: boolean;
  initialPayment: number;
}

export interface CalculationResult {
  nudaPropiedadValue: number;
  usufructValue: number;
  oneTimePayment: number;
  monthlyAnnuity: number;
  mixedAnnuity: number;
  percentageUsed: number;
}

export enum AppRoute {
  LOGIN = 'login',
  CALCULATOR = 'calculator',
  ADMIN = 'admin'
}
