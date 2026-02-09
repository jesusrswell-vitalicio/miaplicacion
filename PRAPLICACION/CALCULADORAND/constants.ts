
import { PercentageEntry } from './types';

// Datos extraídos y normalizados de la imagen proporcionada por el usuario
export const DEFAULT_PERCENTAGES: PercentageEntry[] = [
  { age: 65, percentage: 44.00 },
  { age: 66, percentage: 45.00 },
  { age: 67, percentage: 46.00 },
  { age: 68, percentage: 46.00 },
  { age: 69, percentage: 48.00 },
  { age: 70, percentage: 49.00 },
  { age: 71, percentage: 49.50 },
  { age: 72, percentage: 50.00 },
  { age: 73, percentage: 52.00 }, // Estimado intermedio
  { age: 74, percentage: 54.00 },
  { age: 75, percentage: 55.00 },
  { age: 76, percentage: 55.00 },
  { age: 77, percentage: 57.00 }, // Estimado intermedio
  { age: 78, percentage: 58.00 }, // Estimado intermedio
  { age: 79, percentage: 59.21 },
  { age: 80, percentage: 57.50 },
  { age: 81, percentage: 59.00 }, // Estimado intermedio
  { age: 82, percentage: 61.00 },
  { age: 83, percentage: 62.50 }, // Estimado intermedio
  { age: 84, percentage: 64.00 },
  { age: 85, percentage: 66.00 }, // Estimado intermedio
  { age: 86, percentage: 67.50 }, // Estimado intermedio
  { age: 87, percentage: 69.00 }, // Estimado intermedio
  { age: 88, percentage: 70.00 },
  { age: 89, percentage: 77.00 },
  { age: 90, percentage: 80.00 },
  { age: 91, percentage: 81.00 },
  { age: 92, percentage: 82.00 },
  { age: 93, percentage: 83.00 },
  { age: 94, percentage: 83.00 },
  { age: 95, percentage: 84.00 },
  { age: 96, percentage: 85.00 },
  { age: 97, percentage: 86.00 }
    
  , // Proyección
];

// Esperanza de vida simplificada para el cálculo de Renta Vitalicia (estimación estándar España)
export const LIFE_EXPECTANCY_TABLE: Record<number, number> = {
  65: 21, 66: 20, 67: 19, 68: 18, 69: 17, 70: 16, 71: 15, 72: 14, 73: 13, 74: 12,
  75: 11, 76: 11, 77: 10, 78: 9, 79: 9, 80: 8, 81: 7, 82: 7, 83: 6, 84: 6,
  85: 5, 86: 5, 87: 4, 88: 4, 89: 3, 90: 3
};
