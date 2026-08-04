import React from 'react';
import { Package, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/calculator';

interface YieldSectionProps {
  yieldQuantity: number | string;
  yieldUnitName: string;
  onUpdateYieldQuantity: (val: string) => void;
  onUpdateYieldUnitName: (val: string) => void;
  totalIngredientCost: number;
  costPerPiece: number;
  currencySymbol: string;
}

export const YieldSection: React.FC<YieldSectionProps> = ({
  yieldQuantity,
  yieldUnitName,
  onUpdateYieldQuantity,
  onUpdateYieldUnitName,
  totalIngredientCost,
  costPerPiece,
  currencySymbol,
}) => {
  const qtyNum = typeof yieldQuantity === 'number' ? yieldQuantity : parseFloat(yieldQuantity) || 0;

  return (
    <section className="bg-white border border-[#e3e3e3] rounded-xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8">
      {/* Section Header */}
      <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-[#e3e3e3]">
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f6f6f6] text-[#4d3f32] border border-[#e3e3e3]">
          Section 2
        </span>
        <h2 className="text-xl sm:text-2xl font-serif text-[#1a1a1a]">
          Recipe Yield & Unit Cost
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Input Controls (Left column) */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <label htmlFor="recipe-yield-qty" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              How many does this recipe make?
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  id="recipe-yield-qty"
                  type="number"
                  min="1"
                  step="1"
                  value={yieldQuantity}
                  onChange={(e) => onUpdateYieldQuantity(e.target.value)}
                  placeholder="24"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e3e3e3] rounded-lg text-lg font-medium text-[#1a1a1a] focus:outline-none focus:border-[#547e69] focus:ring-1 focus:ring-[#547e69]"
                />
              </div>

              {/* Yield unit label input */}
              <div className="w-40">
                <label htmlFor="yield-unit-name" className="sr-only">Yield unit label</label>
                <input
                  id="yield-unit-name"
                  type="text"
                  value={yieldUnitName}
                  onChange={(e) => onUpdateYieldUnitName(e.target.value)}
                  placeholder="e.g. cookies, slices"
                  className="w-full px-3 py-2.5 bg-[#f6f6f6] border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                />
              </div>
            </div>
            <p className="text-xs text-[#6a6a6a] mt-1.5">
              Enter the total count produced in a single batch (e.g. 24 cookies or 12 cupcakes).
            </p>
          </div>

          {/* Quick preset yield pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[#6a6a6a] mr-1">Quick yields:</span>
            {[6, 12, 16, 24, 30, 48].map((qty) => (
              <button
                key={qty}
                onClick={() => onUpdateYieldQuantity(qty.toString())}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                  qtyNum === qty
                    ? 'bg-[#547e69] text-white border-[#547e69]'
                    : 'bg-[#f6f6f6] text-[#4d3f32] border-[#e3e3e3] hover:border-[#547e69]'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Result Output Box (Right column) */}
        <div className="md:col-span-5 bg-[#f1fcf6] border border-[#547e69]/30 rounded-xl p-5 text-center sm:text-left space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-[#547e69] uppercase">
              Cost Output
            </span>
            <Package className="w-4 h-4 text-[#547e69]/60" />
          </div>

          {/* Hero Number: Cost per piece */}
          <div>
            <span className="block text-xs text-[#6a6a6a] mb-1">
              Ingredient Cost per {yieldUnitName || 'piece'}
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-normal text-[#1a1a1a] tracking-tight">
              {formatCurrency(costPerPiece, currencySymbol)}
            </div>
          </div>

          <div className="pt-3 border-t border-[#547e69]/20 flex items-center justify-between text-xs text-[#4d3f32]">
            <span>Full Batch Cost ({qtyNum || 0} {yieldUnitName || 'items'}):</span>
            <span className="font-semibold text-[#1a1a1a]">
              {formatCurrency(totalIngredientCost, currencySymbol)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
