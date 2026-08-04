import React from 'react';
import { RotateCcw, Trash2, Utensils, DollarSign, Share2 } from 'lucide-react';
import { Currency } from '../types';
import { CURRENCIES } from '../data/defaultRecipe';

interface HeaderProps {
  recipeTitle: string;
  onUpdateTitle: (title: string) => void;
  currencySymbol: string;
  onUpdateCurrency: (symbol: string) => void;
  onResetSample: () => void;
  onClearAll: () => void;
  onOpenSummary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  recipeTitle,
  onUpdateTitle,
  currencySymbol,
  onUpdateCurrency,
  onResetSample,
  onClearAll,
  onOpenSummary,
}) => {
  return (
    <header className="border-b border-[#e3e3e3] bg-white pb-6 pt-8 mb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top utility row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f1fcf6] border border-[#547e69]/30 text-[#547e69]">
              <Utensils className="w-4 h-4" />
            </span>
            <span className="text-xs font-medium tracking-wider uppercase text-[#6a6a6a]">
              Scratchpad Calculator
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency selector */}
            <div className="relative flex items-center">
              <label htmlFor="currency-select" className="sr-only">Currency</label>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#f6f6f6] border border-[#e3e3e3] rounded-lg text-xs font-medium text-[#1a1a1a]">
                <DollarSign className="w-3.5 h-3.5 text-[#6a6a6a]" />
                <select
                  id="currency-select"
                  value={currencySymbol}
                  onChange={(e) => onUpdateCurrency(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer pr-1"
                >
                  {CURRENCIES.map((c: Currency) => (
                    <option key={c.code} value={c.symbol}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick summary button */}
            <button
              onClick={onOpenSummary}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#f6f6f6] rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Summary Breakdown</span>
            </button>

            {/* Reset button */}
            <button
              onClick={onResetSample}
              title="Reset calculator"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-[#e3e3e3] bg-white text-[#6a6a6a] hover:text-[#1a1a1a] hover:bg-[#f6f6f6] rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Clear button */}
            <button
              onClick={onClearAll}
              title="Clear all fields"
              className="p-1.5 text-[#6a6a6a] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title and tagline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#1a1a1a] tracking-tight">
            Bakery COGS Calculator
          </h1>
          <p className="text-sm text-[#6a6a6a] max-w-2xl leading-relaxed">
            Work out your exact ingredient cost per cookie, cupcake, or loaf — then find a profitable selling price for your home bakery business.
          </p>

          {/* Editable Recipe Name */}
          <div className="pt-2">
            <label className="block text-xs uppercase tracking-wider text-[#6a6a6a] font-medium mb-1">
              Recipe Name
            </label>
            <input
              type="text"
              value={recipeTitle}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="e.g. Sourdough Loaf or Vanilla Cupcakes (Batch of 12)"
              className="w-full sm:max-w-lg px-3.5 py-2 text-base font-serif font-light text-[#1a1a1a] bg-white border border-[#e3e3e3] rounded-lg focus:outline-none focus:border-[#547e69] focus:ring-1 focus:ring-[#547e69] transition-all placeholder:text-[#8d8d8d] placeholder:font-sans placeholder:text-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
