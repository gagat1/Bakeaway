import { Currency, RecipeState } from '../types';

export const CURRENCIES: Currency[] = [
  { code: 'IDR', symbol: 'Rp ', label: 'IDR (Rp)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'MYR', symbol: 'RM ', label: 'MYR (RM)' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
];

export const COMMON_PRESETS = [
  { name: 'Tepung Terigu Protein Sedang', amountUsed: 500, usedUnit: 'g' as const, packageSize: 1000, packageUnit: 'g' as const, pricePaid: 15000 },
  { name: 'Gula Pasir', amountUsed: 250, usedUnit: 'g' as const, packageSize: 1000, packageUnit: 'g' as const, pricePaid: 18000 },
  { name: 'Mentega / Unsalted Butter', amountUsed: 225, usedUnit: 'g' as const, packageSize: 500, packageUnit: 'g' as const, pricePaid: 65000 },
  { name: 'Choco Chips / Cokelat', amountUsed: 250, usedUnit: 'g' as const, packageSize: 500, packageUnit: 'g' as const, pricePaid: 50000 },
  { name: 'Telur Ayam Segar', amountUsed: 2, usedUnit: 'pcs' as const, packageSize: 16, packageUnit: 'pcs' as const, pricePaid: 32000 },
  { name: 'Perisa / Ekstrak Vanila', amountUsed: 10, usedUnit: 'ml' as const, packageSize: 100, packageUnit: 'ml' as const, pricePaid: 35000 },
  { name: 'Baking Powder / Soda Kue', amountUsed: 10, usedUnit: 'g' as const, packageSize: 100, packageUnit: 'g' as const, pricePaid: 15000 },
  { name: 'Krim Kental / Heavy Cream', amountUsed: 200, usedUnit: 'ml' as const, packageSize: 1000, packageUnit: 'ml' as const, pricePaid: 68000 },
  { name: 'Kotak Kemasan / Box', amountUsed: 1, usedUnit: 'pcs' as const, packageSize: 10, packageUnit: 'pcs' as const, pricePaid: 25000 },
];

export const INITIAL_RECIPE: RecipeState = {
  title: '',
  yieldQuantity: 1,
  yieldUnitName: 'pcs',
  currencySymbol: 'Rp ',
  selectedMargin: 40,
  customMargin: '',
  plannedPricePerPiece: '',
  overheadBufferPercent: '0',
  ingredients: [],
};
