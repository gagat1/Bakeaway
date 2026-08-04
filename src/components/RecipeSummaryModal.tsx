import React, { useState } from 'react';
import { X, Copy, Check, Printer, ChefHat, Sparkles } from 'lucide-react';
import { Ingredient } from '../types';
import { calculateIngredientCost } from '../utils/unitConverter';
import { formatCurrency, calculateProfitAndMargin } from '../utils/calculator';

interface RecipeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
  ingredients: Ingredient[];
  yieldQuantity: number | string;
  yieldUnitName: string;
  currencySymbol: string;
  totalIngredientCost: number;
  costPerPiece: number;
  suggestedPrice: number;
  plannedPrice: number;
  targetMarginPercent: number;
}

export const RecipeSummaryModal: React.FC<RecipeSummaryModalProps> = ({
  isOpen,
  onClose,
  recipeTitle,
  ingredients,
  yieldQuantity,
  yieldUnitName,
  currencySymbol,
  totalIngredientCost,
  costPerPiece,
  suggestedPrice,
  plannedPrice,
  targetMarginPercent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qtyNum = typeof yieldQuantity === 'number' ? yieldQuantity : parseFloat(yieldQuantity) || 0;
  const { profitPerPiece, marginPercent } = calculateProfitAndMargin(costPerPiece, plannedPrice);
  const totalBatchProfit = profitPerPiece * qtyNum;
  const totalBatchRevenue = plannedPrice * qtyNum;

  const generateTextSummary = () => {
    let summary = `🍰 BAKERY COGS BREAKDOWN\n`;
    summary += `Recipe: ${recipeTitle || 'Untitled Recipe'}\n`;
    summary += `Batch Yield: ${qtyNum} ${yieldUnitName || 'pieces'}\n`;
    summary += `Date: ${new Date().toLocaleDateString()}\n`;
    summary += `------------------------------------\n`;
    summary += `INGREDIENTS:\n`;

    ingredients.forEach((ing) => {
      const amount = typeof ing.amountUsed === 'number' ? ing.amountUsed : parseFloat(ing.amountUsed) || 0;
      const pkg = typeof ing.packageSize === 'number' ? ing.packageSize : parseFloat(ing.packageSize) || 0;
      const price = typeof ing.pricePaid === 'number' ? ing.pricePaid : parseFloat(ing.pricePaid) || 0;
      const cost = calculateIngredientCost(amount, ing.usedUnit, pkg, ing.packageUnit, price);

      summary += `• ${ing.name || 'Ingredient'}: ${ing.amountUsed}${ing.usedUnit} used (${ing.packageSize}${ing.packageUnit} @ ${formatCurrency(price, currencySymbol)}) = ${formatCurrency(cost, currencySymbol)}\n`;
    });

    summary += `------------------------------------\n`;
    summary += `COST SUMMARY:\n`;
    summary += `Total Ingredients Cost: ${formatCurrency(totalIngredientCost, currencySymbol)}\n`;
    summary += `Cost per ${yieldUnitName || 'piece'}: ${formatCurrency(costPerPiece, currencySymbol)}\n`;
    summary += `Suggested Selling Price (${targetMarginPercent}% margin): ${formatCurrency(suggestedPrice, currencySymbol)}\n`;
    if (plannedPrice > 0) {
      summary += `Planned Selling Price: ${formatCurrency(plannedPrice, currencySymbol)}\n`;
      summary += `Profit per ${yieldUnitName || 'piece'}: ${formatCurrency(profitPerPiece, currencySymbol)}\n`;
      summary += `Estimated Profit Margin: ${marginPercent.toFixed(1)}%\n`;
      summary += `Batch Total Revenue: ${formatCurrency(totalBatchRevenue, currencySymbol)}\n`;
      summary += `Batch Net Profit: ${formatCurrency(totalBatchProfit, currencySymbol)}\n`;
    }
    summary += `------------------------------------\n`;
    summary += `Calculated with Bakery COGS Calculator`;

    return summary;
  };

  const handleCopy = () => {
    const text = generateTextSummary();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#e3e3e3] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#e3e3e3]">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-[#f1fcf6] border border-[#547e69]/30 rounded-lg text-[#547e69]">
              <ChefHat className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-serif font-light text-[#1a1a1a]">
                {recipeTitle || 'Bakery Recipe Summary'}
              </h3>
              <p className="text-xs text-[#6a6a6a]">
                Batch of {qtyNum} {yieldUnitName || 'items'} • Scratchpad Summary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6a6a6a] hover:text-[#1a1a1a] rounded-lg hover:bg-[#f6f6f6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipe Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f6f6f6] p-4 rounded-xl border border-[#e3e3e3]">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#6a6a6a]">
              Total Cost
            </span>
            <span className="text-base sm:text-lg font-semibold text-[#1a1a1a]">
              {formatCurrency(totalIngredientCost, currencySymbol)}
            </span>
          </div>

          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#6a6a6a]">
              Cost / {yieldUnitName || 'piece'}
            </span>
            <span className="text-base sm:text-lg font-semibold text-[#1a1a1a]">
              {formatCurrency(costPerPiece, currencySymbol)}
            </span>
          </div>

          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#547e69]">
              Suggested Price
            </span>
            <span className="text-base sm:text-lg font-semibold text-[#547e69]">
              {formatCurrency(suggestedPrice, currencySymbol)}
            </span>
          </div>

          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#6a6a6a]">
              Planned Price
            </span>
            <span className="text-base sm:text-lg font-semibold text-[#1a1a1a]">
              {plannedPrice > 0 ? formatCurrency(plannedPrice, currencySymbol) : '—'}
            </span>
          </div>
        </div>

        {/* Ingredients List Breakdown */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6a6a6a] mb-3">
            Ingredient Breakdown ({ingredients.length} items)
          </h4>
          <div className="divide-y divide-[#e3e3e3] border border-[#e3e3e3] rounded-lg overflow-hidden text-xs">
            {ingredients.map((ing) => {
              const amount = typeof ing.amountUsed === 'number' ? ing.amountUsed : parseFloat(ing.amountUsed) || 0;
              const pkg = typeof ing.packageSize === 'number' ? ing.packageSize : parseFloat(ing.packageSize) || 0;
              const price = typeof ing.pricePaid === 'number' ? ing.pricePaid : parseFloat(ing.pricePaid) || 0;
              const cost = calculateIngredientCost(amount, ing.usedUnit, pkg, ing.packageUnit, price);

              return (
                <div key={ing.id} className="p-2.5 bg-white flex justify-between items-center">
                  <div>
                    <span className="font-medium text-[#1a1a1a] block">
                      {ing.name || 'Unnamed Ingredient'}
                    </span>
                    <span className="text-[#6a6a6a] text-[11px]">
                      Used {ing.amountUsed} {ing.usedUnit} (Pack: {ing.packageSize}{ing.packageUnit} @ {formatCurrency(price, currencySymbol)})
                    </span>
                  </div>
                  <span className="font-semibold text-[#1a1a1a]">
                    {formatCurrency(cost, currencySymbol)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profit Summary if Planned Price is entered */}
        {plannedPrice > 0 && (
          <div className="p-4 bg-[#f1fcf6] border border-[#547e69]/30 rounded-lg text-xs space-y-2 text-[#4d3f32]">
            <div className="flex justify-between items-center font-medium">
              <span>Planned Price Margin:</span>
              <span className="text-sm font-semibold text-[#547e69]">
                {marginPercent.toFixed(1)}% profit margin
              </span>
            </div>
            <div className="flex justify-between items-center text-[#6a6a6a]">
              <span>Batch Estimated Profit ({qtyNum} {yieldUnitName || 'items'}):</span>
              <span className="font-semibold text-[#1a1a1a]">
                {formatCurrency(totalBatchProfit, currencySymbol)}
              </span>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#e3e3e3]">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#f6f6f6] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#547e69]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text Breakdown'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#333333] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Summary</span>
          </button>
        </div>

      </div>
    </div>
  );
};
