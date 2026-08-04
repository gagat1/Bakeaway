import React from 'react';
import { Plus, Trash2, Info, Sparkles } from 'lucide-react';
import { Ingredient, MeasurementUnit } from '../types';
import { calculateIngredientCost, formatUnitLabel } from '../utils/unitConverter';
import { formatCurrency } from '../utils/calculator';
import { COMMON_PRESETS } from '../data/defaultRecipe';

interface IngredientTableProps {
  ingredients: Ingredient[];
  currencySymbol: string;
  onUpdateIngredient: (id: string, field: keyof Ingredient, value: any) => void;
  onAddIngredient: (preset?: typeof COMMON_PRESETS[0]) => void;
  onRemoveIngredient: (id: string) => void;
  totalIngredientCost: number;
}

const UNITS: MeasurementUnit[] = [
  'g',
  'kg',
  'oz',
  'lb',
  'ml',
  'l',
  'tsp',
  'tbsp',
  'cup',
  'fl oz',
  'pcs',
  'doz',
];

export const IngredientTable: React.FC<IngredientTableProps> = ({
  ingredients,
  currencySymbol,
  onUpdateIngredient,
  onAddIngredient,
  onRemoveIngredient,
  totalIngredientCost,
}) => {
  const [showPresetMenu, setShowPresetMenu] = React.useState(false);

  return (
    <section className="bg-white border border-[#e3e3e3] rounded-xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#e3e3e3]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f6f6f6] text-[#4d3f32] border border-[#e3e3e3]">
              Section 1
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-[#1a1a1a]">
              Ingredient List
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6a6a6a] mt-1">
            List every ingredient in your recipe along with what you paid for the whole package.
          </p>
        </div>

        {/* Total Cost Badge */}
        <div className="self-start sm:self-auto bg-[#f6f6f6] px-4 py-2 rounded-lg border border-[#e3e3e3] text-right">
          <span className="text-xs uppercase tracking-wider text-[#6a6a6a] block">
            Total Ingredients Cost
          </span>
          <span className="text-lg font-medium text-[#1a1a1a]">
            {formatCurrency(totalIngredientCost, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Friendly Inline Hint */}
      <div className="flex items-start space-x-2.5 p-3.5 bg-[#f1fcf6] border border-[#547e69]/20 rounded-lg text-xs text-[#4d3f32] mb-6">
        <Info className="w-4 h-4 text-[#547e69] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Baker's tip:</strong> Tell us how much you used and how much the package cost — we'll work out the price per ingredient automatically.
        </p>
      </div>

      {/* Desktop Table view (hidden on small mobile screens, shown on md and above) */}
      <div className="hidden md:block overflow-x-auto -mx-2">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#e3e3e3] text-[#6a6a6a] text-xs uppercase tracking-wider font-medium">
              <th className="py-3 px-3 w-[26%]">Ingredient Name</th>
              <th className="py-3 px-3 w-[22%]">Amount Used</th>
              <th className="py-3 px-3 w-[22%]">Pack Size Bought</th>
              <th className="py-3 px-3 w-[16%]">Price Paid</th>
              <th className="py-3 px-3 w-[14%] text-right">Cost</th>
              <th className="py-3 px-2 w-[4%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f6f6f6]">
            {ingredients.map((ing, idx) => {
              const amountNum = typeof ing.amountUsed === 'number' ? ing.amountUsed : parseFloat(ing.amountUsed) || 0;
              const pkgNum = typeof ing.packageSize === 'number' ? ing.packageSize : parseFloat(ing.packageSize) || 0;
              const priceNum = typeof ing.pricePaid === 'number' ? ing.pricePaid : parseFloat(ing.pricePaid) || 0;
              const rowCost = calculateIngredientCost(amountNum, ing.usedUnit, pkgNum, ing.packageUnit, priceNum);

              return (
                <tr key={ing.id} className="group hover:bg-[#f6f6f6]/60 transition-colors">
                  {/* Name */}
                  <td className="py-3 px-3 align-middle">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => onUpdateIngredient(ing.id, 'name', e.target.value)}
                      placeholder={idx === 0 ? "e.g. Flour, Sugar, Eggs" : "Ingredient name"}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69] focus:ring-1 focus:ring-[#547e69]"
                    />
                  </td>

                  {/* Amount Used + Unit */}
                  <td className="py-3 px-3 align-middle">
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={ing.amountUsed}
                        onChange={(e) => onUpdateIngredient(ing.id, 'amountUsed', e.target.value)}
                        placeholder="500"
                        className="w-24 px-2.5 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69] focus:ring-1 focus:ring-[#547e69]"
                      />
                      <select
                        value={ing.usedUnit}
                        onChange={(e) => {
                          const newUnit = e.target.value as MeasurementUnit;
                          onUpdateIngredient(ing.id, 'usedUnit', newUnit);
                          // Sync package unit if package unit was same as old unit
                          if (ing.packageUnit === ing.usedUnit) {
                            onUpdateIngredient(ing.id, 'packageUnit', newUnit);
                          }
                        }}
                        className="px-2 py-1.5 bg-[#f6f6f6] border border-[#e3e3e3] rounded-md text-xs font-medium text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Pack Size + Unit */}
                  <td className="py-3 px-3 align-middle">
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={ing.packageSize}
                        onChange={(e) => onUpdateIngredient(ing.id, 'packageSize', e.target.value)}
                        placeholder="1000"
                        className="w-24 px-2.5 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69] focus:ring-1 focus:ring-[#547e69]"
                      />
                      <select
                        value={ing.packageUnit}
                        onChange={(e) => onUpdateIngredient(ing.id, 'packageUnit', e.target.value as MeasurementUnit)}
                        className="px-2 py-1.5 bg-[#f6f6f6] border border-[#e3e3e3] rounded-md text-xs font-medium text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Price Paid */}
                  <td className="py-3 px-3 align-middle">
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs text-[#6a6a6a] font-medium">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={ing.pricePaid}
                        onChange={(e) => onUpdateIngredient(ing.id, 'pricePaid', e.target.value)}
                        placeholder="15000"
                        className="w-32 pl-9 pr-2 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69] focus:ring-1 focus:ring-[#547e69]"
                      />
                    </div>
                  </td>

                  {/* Calculated Cost */}
                  <td className="py-3 px-3 align-middle text-right font-medium text-[#1a1a1a]">
                    {formatCurrency(rowCost, currencySymbol)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-2 align-middle text-center">
                    <button
                      onClick={() => onRemoveIngredient(ing.id)}
                      title="Remove ingredient"
                      className="p-1 text-[#8d8d8d] hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (shown below md) */}
      <div className="md:hidden space-y-4">
        {ingredients.map((ing, idx) => {
          const amountNum = typeof ing.amountUsed === 'number' ? ing.amountUsed : parseFloat(ing.amountUsed) || 0;
          const pkgNum = typeof ing.packageSize === 'number' ? ing.packageSize : parseFloat(ing.packageSize) || 0;
          const priceNum = typeof ing.pricePaid === 'number' ? ing.pricePaid : parseFloat(ing.pricePaid) || 0;
          const rowCost = calculateIngredientCost(amountNum, ing.usedUnit, pkgNum, ing.packageUnit, priceNum);

          return (
            <div
              key={ing.id}
              className="p-4 bg-[#f6f6f6]/60 border border-[#e3e3e3] rounded-lg space-y-3 relative"
            >
              {/* Row Header & Delete */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase text-[#6a6a6a]">
                  Ingredient #{idx + 1}
                </span>
                <button
                  onClick={() => onRemoveIngredient(ing.id)}
                  className="p-1 text-[#8d8d8d] hover:text-rose-600 rounded cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Ingredient Name Input */}
              <div>
                <label className="block text-xs font-medium text-[#6a6a6a] mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => onUpdateIngredient(ing.id, 'name', e.target.value)}
                  placeholder="e.g. Flour, Sugar, Eggs"
                  className="w-full px-3 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                />
              </div>

              {/* Amount Used & Pack Size in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6a6a6a] mb-1">
                    Amount Used
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={ing.amountUsed}
                      onChange={(e) => onUpdateIngredient(ing.id, 'amountUsed', e.target.value)}
                      placeholder="500"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-sm text-[#1a1a1a]"
                    />
                    <select
                      value={ing.usedUnit}
                      onChange={(e) => onUpdateIngredient(ing.id, 'usedUnit', e.target.value as MeasurementUnit)}
                      className="px-1.5 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-xs text-[#1a1a1a]"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6a6a6a] mb-1">
                    Pack Size Bought
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={ing.packageSize}
                      onChange={(e) => onUpdateIngredient(ing.id, 'packageSize', e.target.value)}
                      placeholder="1000"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-sm text-[#1a1a1a]"
                    />
                    <select
                      value={ing.packageUnit}
                      onChange={(e) => onUpdateIngredient(ing.id, 'packageUnit', e.target.value as MeasurementUnit)}
                      className="px-1.5 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-xs text-[#1a1a1a]"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Paid and Cost Result */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e3e3e3]">
                <div className="w-1/2 pr-2">
                  <label className="block text-xs font-medium text-[#6a6a6a] mb-1">
                    Price Paid
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[#6a6a6a] font-medium">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={ing.pricePaid}
                      onChange={(e) => onUpdateIngredient(ing.id, 'pricePaid', e.target.value)}
                      placeholder="15000"
                      className="w-full pl-9 pr-2 py-1.5 bg-white border border-[#e3e3e3] rounded-md text-sm text-[#1a1a1a]"
                    />
                  </div>
                </div>

                <div className="text-right pl-2">
                  <span className="block text-xs text-[#6a6a6a]">Calculated Cost</span>
                  <span className="text-base font-semibold text-[#1a1a1a]">
                    {formatCurrency(rowCost, currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Actions Bar */}
      <div className="mt-6 pt-4 border-t border-[#e3e3e3] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {/* Main Add Button */}
          <button
            onClick={() => onAddIngredient()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#333333] rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ingredient</span>
          </button>

          {/* Preset dropdown menu trigger */}
          <div className="relative">
            <button
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-[#e3e3e3] text-[#4d3f32] hover:bg-[#f6f6f6] rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#547e69]" />
              <span>Quick Presets</span>
            </button>

            {showPresetMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-64 bg-white border border-[#e3e3e3] rounded-lg shadow-lg z-20 py-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-wider border-b border-[#f6f6f6]">
                  Popular Bakery Items
                </div>
                {COMMON_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onAddIngredient(preset);
                      setShowPresetMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#f6f6f6] text-xs text-[#1a1a1a] flex justify-between items-center cursor-pointer"
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-[11px] text-[#6a6a6a]">
                      {preset.amountUsed}{preset.usedUnit}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-[#6a6a6a]">
          {ingredients.length} ingredient{ingredients.length === 1 ? '' : 's'} in recipe
        </div>
      </div>
    </section>
  );
};
