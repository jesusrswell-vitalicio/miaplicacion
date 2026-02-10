
export interface PercentageEntry {
  age: number;
  percentage: number;
}

export interface CalculationInputs {
  marketValue: number;
  age1: number;
  age2: number | null;
  isSinglePerson: boolean;
  initialPayment: number; // Nueva entrada para pago inicial
}

export interface CalculationResult {
  nudaPropiedadValue: number;
  usufructValue: number;
  oneTimePayment: number;
  monthlyAnnuity: number;
  mixedAnnuity: number; // Resultado de la renta si hay entrada
  percentageUsed: number;
}

export enum AppRoute {
  CALCULATOR = 'calculator',
  ADMIN = 'admin'
}
