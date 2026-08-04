import { MeasurementUnit } from '../types';

interface UnitCategory {
  category: 'weight' | 'volume' | 'count';
  toBase: number; // multiplier to get to base unit (g, ml, pcs)
}

const UNIT_MAP: Record<MeasurementUnit, UnitCategory> = {
  // Weight (base: g)
  g: { category: 'weight', toBase: 1 },
  kg: { category: 'weight', toBase: 1000 },
  oz: { category: 'weight', toBase: 28.3495 },
  lb: { category: 'weight', toBase: 453.592 },

  // Volume (base: ml)
  ml: { category: 'volume', toBase: 1 },
  l: { category: 'volume', toBase: 1000 },
  tsp: { category: 'volume', toBase: 4.92892 },
  tbsp: { category: 'volume', toBase: 14.7868 },
  'fl oz': { category: 'volume', toBase: 29.5735 },
  cup: { category: 'volume', toBase: 240 },

  // Count (base: pcs)
  pcs: { category: 'count', toBase: 1 },
  doz: { category: 'count', toBase: 12 },
};

/**
  Calculate row cost given amount used, package size, price paid, and units.
 */
export function calculateIngredientCost(
  amountUsedNum: number,
  usedUnit: MeasurementUnit,
  packageSizeNum: number,
  packageUnit: MeasurementUnit,
  pricePaidNum: number
): number {
  if (isNaN(amountUsedNum) || isNaN(packageSizeNum) || isNaN(pricePaidNum)) return 0;
  if (amountUsedNum <= 0 || packageSizeNum <= 0 || pricePaidNum <= 0) return 0;

  const usedMeta = UNIT_MAP[usedUnit];
  const pkgMeta = UNIT_MAP[packageUnit];

  // If both units belong to the same category (e.g. g and kg), convert to base first
  if (usedMeta && pkgMeta && usedMeta.category === pkgMeta.category) {
    const baseUsed = amountUsedNum * usedMeta.toBase;
    const basePkg = packageSizeNum * pkgMeta.toBase;
    return (baseUsed / basePkg) * pricePaidNum;
  }

  // Fallback direct calculation if category differs or unit not mapped
  return (amountUsedNum / packageSizeNum) * pricePaidNum;
}

export function formatUnitLabel(unit: MeasurementUnit): string {
  switch (unit) {
    case 'g': return 'grams (g)';
    case 'kg': return 'kilograms (kg)';
    case 'oz': return 'ounces (oz)';
    case 'lb': return 'pounds (lb)';
    case 'ml': return 'milliliters (ml)';
    case 'l': return 'liters (L)';
    case 'tsp': return 'teaspoons (tsp)';
    case 'tbsp': return 'tablespoons (tbsp)';
    case 'cup': return 'cups';
    case 'fl oz': return 'fluid oz (fl oz)';
    case 'pcs': return 'pieces (pcs)';
    case 'doz': return 'dozen (doz)';
    default: return unit;
  }
}
