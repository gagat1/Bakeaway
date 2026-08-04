import { Ingredient, MarginHealth, MeasurementUnit } from '../types';
import { calculateIngredientCost } from './unitConverter';

export function calculateTotalIngredientCost(ingredients: Ingredient[]): number {
  return ingredients.reduce((sum, item) => {
    const amount = typeof item.amountUsed === 'number' ? item.amountUsed : parseFloat(item.amountUsed) || 0;
    const pkg = typeof item.packageSize === 'number' ? item.packageSize : parseFloat(item.packageSize) || 0;
    const price = typeof item.pricePaid === 'number' ? item.pricePaid : parseFloat(item.pricePaid) || 0;
    
    return sum + calculateIngredientCost(amount, item.usedUnit, pkg, item.packageUnit, price);
  }, 0);
}

export function calculateCostPerPiece(totalCost: number, yieldQuantity: number | string): number {
  const qty = typeof yieldQuantity === 'number' ? yieldQuantity : parseFloat(yieldQuantity) || 0;
  if (qty <= 0) return 0;
  return totalCost / qty;
}

/**
  Calculates suggested selling price based on profit margin formula:
  Price = Cost / (1 - Margin%)
  Example: Cost $1.00, Margin 40% (0.4) => Price = 1.00 / 0.6 = $1.67
 */
export function calculateSuggestedPrice(costPerPiece: number, marginPercent: number): number {
  if (costPerPiece <= 0) return 0;
  if (marginPercent >= 100) return costPerPiece * 5; // safety cap
  const marginFraction = Math.max(0, marginPercent / 100);
  if (marginFraction >= 1) return costPerPiece * 2;
  return costPerPiece / (1 - marginFraction);
}

export function calculateProfitAndMargin(costPerPiece: number, plannedPrice: number) {
  const profitPerPiece = plannedPrice - costPerPiece;
  const marginPercent = plannedPrice > 0 ? (profitPerPiece / plannedPrice) * 100 : 0;
  const markupPercent = costPerPiece > 0 ? (profitPerPiece / costPerPiece) * 100 : 0;
  
  return {
    profitPerPiece,
    marginPercent,
    markupPercent,
  };
}

export function getMarginHealth(marginPercent: number, plannedPrice: number, costPerPiece: number): MarginHealth {
  if (plannedPrice <= 0 || costPerPiece <= 0) {
    return {
      level: 'thin',
      label: 'Set a price',
      description: 'Enter a price above to check your profit margin health.',
      colorClass: 'text-stone-500',
      badgeClass: 'bg-[#f6f6f6] text-[#6a6a6a] border-[#e3e3e3]',
    };
  }

  if (marginPercent < 0) {
    return {
      level: 'loss',
      label: "You'd be selling at a loss",
      description: 'Your planned price is below the ingredient cost. You will lose money on every piece.',
      colorClass: 'text-rose-700',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  } else if (marginPercent < 20) {
    return {
      level: 'thin',
      label: 'Thin margin',
      description: 'Covers ingredient costs, but leaves very little buffer for labor, energy, or packaging.',
      colorClass: 'text-amber-800',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  } else if (marginPercent <= 55) {
    return {
      level: 'healthy',
      label: 'Healthy margin',
      description: 'Great target for home bakeries to comfortably cover costs, labor, and overhead.',
      colorClass: 'text-[#547e69]',
      badgeClass: 'bg-[#f1fcf6] text-[#547e69] border-[#547e69]/30',
    };
  } else {
    return {
      level: 'strong',
      label: 'Strong margin',
      description: 'Excellent profit margin for specialty, custom, or boutique baked goods.',
      colorClass: 'text-emerald-800',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    };
  }
}

export function formatCurrency(amount: number, symbol: string = 'Rp ', minDecimals?: number): string {
  if (isNaN(amount) || amount === 0) {
    if (symbol.trim() === 'Rp') return `${symbol.trim()} 0`;
    return `${symbol}0.00`;
  }
  
  const isIDR = symbol.trim() === 'Rp';
  
  if (isIDR) {
    // For IDR, if it's an integer or close to integer, show without decimals using period separators
    const rounded = Math.round(amount);
    const diff = Math.abs(amount - rounded);
    if (diff < 0.01) {
      return `${symbol.trim()} ${rounded.toLocaleString('id-ID')}`;
    }
    // If fractional (e.g. Rp 4.583,33)
    return `${symbol.trim()} ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  const decimals = minDecimals ?? ((amount > 0 && amount < 0.01) ? 3 : 2);
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: Math.max(decimals, 2),
  });

  return `${symbol}${formatted}`;
}
