
import { Manufacturer } from './types';

export const CABLE_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70];

export const CONDUIT_SIZES = [16, 20, 25, 32, 40, 50, 63]; // Standard metric sizes in mm

export const VERIFICATION_TEMPLATES = [
  { id: '1', category: 'Cuadro Eléctrico', description: 'Verificación de etiquetado de circuitos' },
  { id: '2', category: 'Cuadro Eléctrico', description: 'Prueba de disparo de diferenciales (ID)' },
  { id: '3', category: 'Conexiones', description: 'Apriete de bornes y limpieza' },
  { id: '4', category: 'Puesta a Tierra', description: 'Medición de resistencia de tierra (< 25Ω)' },
  { id: '5', category: 'Aislamiento', description: 'Verificación de aislamiento de conductores' },
  { id: '6', category: 'Protecciones', description: 'Relación sección conductor / calibre PIA' },
];

export const MAX_FILL_PERCENTAGE = 0.40; // 40% rule for 3 or more cables

// Factores de disparo magnético unificados por normativa (Ia = k * In)
// Independientemente de la marca, los niveles de protección deben cumplir los mismos estándares.
export const STANDARD_CURVE_FACTORS: Record<'B' | 'C' | 'D', number> = {
  B: 5,
  C: 10,
  D: 20
};

// Mantenemos la estructura por compatibilidad pero con valores normalizados según reglamento
export const PROTECTION_CURVES: Record<string, Record<'B' | 'C' | 'D', number>> = {
  [Manufacturer.GENERIC]: STANDARD_CURVE_FACTORS,
  [Manufacturer.SCHNEIDER]: STANDARD_CURVE_FACTORS,
  [Manufacturer.ABB]: STANDARD_CURVE_FACTORS,
  [Manufacturer.LEGRAND]: STANDARD_CURVE_FACTORS
};

// Se ajusta a 1.0 para que 230V / (16A * 10) = 1.4375 -> 1.44 Ohm (según petición usuario)
export const TEMP_CORRECTION_FACTOR = 1.0; 
