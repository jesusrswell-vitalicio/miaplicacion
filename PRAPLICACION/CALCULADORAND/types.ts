
export interface PercentageEntry {
  age: number;
  percentage: number;
}

export interface CalculationInputs {
  marketValue: number;
  age1: number;
  age2: number | null;
  isSinglePerson: boolean;
}

export interface CalculationResult {
  nudaPropiedadValue: number;
  usufructValue: number;
  oneTimePayment: number;
  monthlyAnnuity: number;
  percentageUsed: number;
}

export enum AppRoute {
  CALCULATOR = 'calculator',
  ADMIN = 'admin'
}
