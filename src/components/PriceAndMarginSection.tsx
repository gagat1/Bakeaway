import React from 'react';
import { DollarSign, AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import {
  calculateSuggestedPrice,
  calculateProfitAndMargin,
  getMarginHealth,
  formatCurrency,
} from '../utils/calculator';

interface PriceAndMarginSectionProps {
  costPerPiece: number;
  totalIngredientCost: number;
  yieldQuantity: number | string;
  yieldUnitName: string;
  currencySymbol: string;
  selectedMargin: number;
  onSelectMargin: (margin: number) => void;
  customMargin: number | string;
  onChangeCustomMargin: (val: string) => void;
  plannedPricePerPiece: number | string;
  onChangePlannedPrice: (val: string) => void;
  overheadBufferPercent: number | string;
  onChangeOverheadBuffer: (val: string) => void;
}

const PRESET_MARGINS = [15, 20, 30, 40, 50, 60];

export const PriceAndMarginSection: React.FC<PriceAndMarginSectionProps> = ({
  costPerPiece,
  totalIngredientCost,
  yieldQuantity,
  yieldUnitName,
  currencySymbol,
  selectedMargin,
  onSelectMargin,
  customMargin,
  onChangeCustomMargin,
  plannedPricePerPiece,
  onChangePlannedPrice,
  overheadBufferPercent,
  onChangeOverheadBuffer,
}) => {
  const qtyNum = typeof yieldQuantity === 'number' ? yieldQuantity : parseFloat(yieldQuantity) || 0;
  
  // Account for overhead buffer % if baker specified any (e.g., +10% packaging/energy)
  const overheadPct = typeof overheadBufferPercent === 'number' ? overheadBufferPercent : parseFloat(overheadBufferPercent) || 0;
  const effectiveCostPerPiece = costPerPiece * (1 + overheadPct / 100);
  const effectiveTotalCost = totalIngredientCost * (1 + overheadPct / 100);

  // Active target margin %
  const activeMarginPercent = customMargin !== '' ? parseFloat(customMargin.toString()) || 0 : selectedMargin;

  // Suggested price based on target profit margin: Price = Cost / (1 - Margin%)
  const suggestedPricePerPiece = calculateSuggestedPrice(effectiveCostPerPiece, activeMarginPercent);
  const suggestedBatchPrice = suggestedPricePerPiece * qtyNum;
  const suggestedProfitPerPiece = suggestedPricePerPiece - effectiveCostPerPiece;

  // Planned Price comparison
  const plannedPriceNum = typeof plannedPricePerPiece === 'number' ? plannedPricePerPiece : parseFloat(plannedPricePerPiece) || 0;
  const { profitPerPiece, marginPercent, markupPercent } = calculateProfitAndMargin(effectiveCostPerPiece, plannedPriceNum);
  const plannedBatchRevenue = plannedPriceNum * qtyNum;
  const plannedBatchProfit = profitPerPiece * qtyNum;

  // Margin Health
  const health = getMarginHealth(marginPercent, plannedPriceNum, effectiveCostPerPiece);

  return (
    <section className="bg-white border border-[#e3e3e3] rounded-xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8">
      {/* Section Header */}
      <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-[#e3e3e3]">
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f6f6f6] text-[#4d3f32] border border-[#e3e3e3]">
          Section 3
        </span>
        <h2 className="text-xl sm:text-2xl font-serif text-[#1a1a1a]">
          Suggested Selling Price & Margin
        </h2>
      </div>

      {/* Target Margin Tappable Pills */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Choose Target Profit Margin
          </label>
          <span className="text-xs text-[#6a6a6a]">
            Profit Margin = (Selling Price − Cost) ÷ Selling Price
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {PRESET_MARGINS.map((m) => {
            const isSelected = customMargin === '' && selectedMargin === m;
            return (
              <button
                key={m}
                onClick={() => {
                  onSelectMargin(m);
                  onChangeCustomMargin('');
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#547e69] text-white border-[#547e69] shadow-sm'
                    : 'bg-white text-[#1a1a1a] border-[#e3e3e3] hover:border-[#547e69] hover:bg-[#f6f6f6]'
                }`}
              >
                {m}% Margin
              </button>
            );
          })}

          {/* Custom Margin Input */}
          <div className="relative flex items-center min-w-[110px]">
            <input
              type="number"
              min="0"
              max="99"
              placeholder="Custom %"
              value={customMargin}
              onChange={(e) => onChangeCustomMargin(e.target.value)}
              className={`w-full pl-3 pr-6 py-1.5 text-xs font-medium border rounded-full focus:outline-none ${
                customMargin !== ''
                  ? 'border-[#547e69] ring-1 ring-[#547e69] bg-[#f1fcf6]'
                  : 'border-[#e3e3e3] bg-white'
              }`}
            />
            <span className="absolute right-3 text-xs text-[#6a6a6a]">%</span>
          </div>
        </div>

        {/* Optional Overhead Buffer */}
        <div className="pt-2 flex items-center space-x-3 text-xs text-[#6a6a6a]">
          <span className="font-medium text-[#4d3f32]">Packaging & Overhead Buffer (optional):</span>
          <div className="relative flex items-center w-24">
            <input
              type="number"
              min="0"
              max="100"
              value={overheadBufferPercent}
              onChange={(e) => onChangeOverheadBuffer(e.target.value)}
              placeholder="0"
              className="w-full pl-2.5 pr-6 py-1 bg-white border border-[#e3e3e3] rounded text-xs text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
            />
            <span className="absolute right-2 text-xs text-[#6a6a6a]">%</span>
          </div>
          <span className="hidden sm:inline text-[#8d8d8d]">
            (Adds estimated electricity, box, or label costs)
          </span>
        </div>
      </div>

      {/* Grid: Suggested Price Box vs Manual Comparison Field */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box A: Suggested Target Price (Hero Output) */}
        <div className="bg-[#f6f6f6] border border-[#e3e3e3] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#547e69]">
              Recommended Price ({activeMarginPercent}% Margin)
            </span>
            <TrendingUp className="w-4 h-4 text-[#547e69]" />
          </div>

          <div>
            <span className="text-xs text-[#6a6a6a] block mb-1">
              Suggested Selling Price per {yieldUnitName || 'item'}
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-normal text-[#1a1a1a] tracking-tight">
              {formatCurrency(suggestedPricePerPiece, currencySymbol)}
            </div>
            <p className="text-xs text-[#547e69] font-medium mt-1">
              Profit per item: {formatCurrency(suggestedProfitPerPiece, currencySymbol)}
            </p>
          </div>

          <div className="pt-3 border-t border-[#e3e3e3] text-xs text-[#4d3f32] space-y-1">
            <div className="flex justify-between">
              <span>Suggested Full Batch Price ({qtyNum} {yieldUnitName || 'items'}):</span>
              <span className="font-semibold">{formatCurrency(suggestedBatchPrice, currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-[#6a6a6a]">
              <span>Batch Gross Profit:</span>
              <span>{formatCurrency(suggestedBatchPrice - effectiveTotalCost, currencySymbol)}</span>
            </div>
          </div>
        </div>

        {/* Box B: Manual Planned Price & Margin Comparison */}
        <div className="bg-white border border-[#e3e3e3] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="planned-price-per-piece" className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a]">
              Your Planned Selling Price
            </label>
            <span className="text-xs text-[#8d8d8d]">Comparison</span>
          </div>

          {/* Planned price input */}
          <div className="space-y-1">
            <span className="text-xs text-[#6a6a6a] block">
              What do you actually want to charge per {yieldUnitName || 'item'}?
            </span>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm font-medium text-[#6a6a6a]">
                {currencySymbol}
              </span>
              <input
                id="planned-price-per-piece"
                type="number"
                min="0"
                step="any"
                value={plannedPricePerPiece}
                onChange={(e) => onChangePlannedPrice(e.target.value)}
                placeholder="8000"
                className="w-full pl-11 pr-3 py-2.5 bg-white border border-[#e3e3e3] rounded-lg text-xl font-medium text-[#1a1a1a] focus:outline-none focus:border-[#547e69] focus:ring-1 focus:ring-[#547e69]"
              />
            </div>
          </div>

          {/* Live Margin & Health Signal Output */}
          <div className="pt-3 border-t border-[#e3e3e3] space-y-3">
            {/* Margin Health Signal Pill */}
            <div className={`p-3 rounded-lg border text-xs leading-relaxed space-y-1 transition-all ${health.badgeClass}`}>
              <div className="flex items-center space-x-1.5 font-semibold">
                {marginPercent < 0 ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{health.label}</span>
              </div>
              <p className="opacity-90">{health.description}</p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-[#f6f6f6] p-2.5 rounded-md border border-[#e3e3e3]">
                <span className="text-[#6a6a6a] block">Profit Margin</span>
                <span className="font-semibold text-sm text-[#1a1a1a]">
                  {marginPercent.toFixed(1)}%
                </span>
                <span className="block text-[11px] text-[#6a6a6a]">
                  ({formatCurrency(profitPerPiece, currencySymbol)} / {yieldUnitName || 'item'})
                </span>
              </div>

              <div className="bg-[#f6f6f6] p-2.5 rounded-md border border-[#e3e3e3]">
                <span className="text-[#6a6a6a] block">Markup on Cost</span>
                <span className="font-semibold text-sm text-[#1a1a1a]">
                  {markupPercent > 0 ? `${markupPercent.toFixed(1)}%` : '0%'}
                </span>
                <span className="block text-[11px] text-[#6a6a6a]">
                  Batch Profit: {formatCurrency(plannedBatchProfit, currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
