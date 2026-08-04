/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { IngredientTable } from './components/IngredientTable';
import { YieldSection } from './components/YieldSection';
import { PriceAndMarginSection } from './components/PriceAndMarginSection';
import { RecipeSummaryModal } from './components/RecipeSummaryModal';
import { OrdersTab } from './components/OrdersTab';
import { Ingredient, RecipeState } from './types';
import { INITIAL_RECIPE, COMMON_PRESETS } from './data/defaultRecipe';
import {
  calculateTotalIngredientCost,
  calculateCostPerPiece,
  calculateSuggestedPrice,
} from './utils/calculator';
import { Calculator, BookOpen, ShoppingBag, Utensils } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'orders'>('calculator');
  const [recipeState, setRecipeState] = useState<RecipeState>(INITIAL_RECIPE);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Update recipe title
  const handleUpdateTitle = (title: string) => {
    setRecipeState((prev) => ({ ...prev, title }));
  };

  // Update currency symbol
  const handleUpdateCurrency = (currencySymbol: string) => {
    setRecipeState((prev) => ({ ...prev, currencySymbol }));
  };

  // Ingredient list updates
  const handleUpdateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setRecipeState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  // Add new ingredient
  const handleAddIngredient = (preset?: typeof COMMON_PRESETS[0]) => {
    const newIngredient: Ingredient = preset
      ? {
          id: `ing-${Date.now()}`,
          name: preset.name,
          amountUsed: preset.amountUsed,
          usedUnit: preset.usedUnit,
          packageSize: preset.packageSize,
          packageUnit: preset.packageUnit,
          pricePaid: preset.pricePaid,
        }
      : {
          id: `ing-${Date.now()}`,
          name: '',
          amountUsed: '',
          usedUnit: 'g',
          packageSize: '',
          packageUnit: 'g',
          pricePaid: '',
        };

    setRecipeState((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));
  };

  // Remove ingredient
  const handleRemoveIngredient = (id: string) => {
    setRecipeState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.id !== id),
    }));
  };

  // Yield updates
  const handleUpdateYieldQuantity = (yieldQuantity: string) => {
    setRecipeState((prev) => ({ ...prev, yieldQuantity }));
  };

  const handleUpdateYieldUnitName = (yieldUnitName: string) => {
    setRecipeState((prev) => ({ ...prev, yieldUnitName }));
  };

  // Margin choices
  const handleSelectMargin = (selectedMargin: number) => {
    setRecipeState((prev) => ({ ...prev, selectedMargin, customMargin: '' }));
  };

  const handleChangeCustomMargin = (customMargin: string) => {
    setRecipeState((prev) => ({ ...prev, customMargin }));
  };

  // Planned Price & Overhead
  const handleChangePlannedPrice = (plannedPricePerPiece: string) => {
    setRecipeState((prev) => ({ ...prev, plannedPricePerPiece }));
  };

  const handleChangeOverheadBuffer = (overheadBufferPercent: string) => {
    setRecipeState((prev) => ({ ...prev, overheadBufferPercent }));
  };

  // Reset & Clear handlers
  const handleResetSample = () => {
    setRecipeState(INITIAL_RECIPE);
  };

  const handleClearAll = () => {
    setRecipeState({
      title: '',
      yieldQuantity: '12',
      yieldUnitName: 'pieces',
      currencySymbol: recipeState.currencySymbol,
      selectedMargin: 40,
      customMargin: '',
      plannedPricePerPiece: '',
      overheadBufferPercent: '0',
      ingredients: [
        {
          id: `ing-${Date.now()}`,
          name: '',
          amountUsed: '',
          usedUnit: 'g',
          packageSize: '',
          packageUnit: 'g',
          pricePaid: '',
        },
      ],
    });
  };

  // Calculations
  const totalIngredientCost = calculateTotalIngredientCost(recipeState.ingredients);
  const costPerPiece = calculateCostPerPiece(totalIngredientCost, recipeState.yieldQuantity);

  const overheadPct = typeof recipeState.overheadBufferPercent === 'number'
    ? recipeState.overheadBufferPercent
    : parseFloat(recipeState.overheadBufferPercent) || 0;
  const effectiveCostPerPiece = costPerPiece * (1 + overheadPct / 100);

  const activeMarginPercent = recipeState.customMargin !== ''
    ? parseFloat(recipeState.customMargin.toString()) || 0
    : recipeState.selectedMargin;

  const suggestedPrice = calculateSuggestedPrice(effectiveCostPerPiece, activeMarginPercent);
  const plannedPriceNum = typeof recipeState.plannedPricePerPiece === 'number'
    ? recipeState.plannedPricePerPiece
    : parseFloat(recipeState.plannedPricePerPiece) || 0;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] flex flex-col font-sans">
      
      {/* Top Main Navigation Tabs */}
      <nav className="border-b border-[#e3e3e3] bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center space-x-1 sm:space-x-2 h-full">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`inline-flex items-center space-x-2 px-3 sm:px-4 h-full text-xs sm:text-sm font-medium transition-all border-b-2 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'border-[#547e69] text-[#1a1a1a] font-semibold bg-white'
                  : 'border-transparent text-[#6a6a6a] hover:text-[#1a1a1a] hover:bg-[#f6f6f6]'
              }`}
            >
              <Calculator className="w-4 h-4 text-[#547e69]" />
              <span>Cost Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center space-x-2 px-3 sm:px-4 h-full text-xs sm:text-sm font-medium transition-all border-b-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-[#547e69] text-[#1a1a1a] font-semibold bg-white'
                  : 'border-transparent text-[#6a6a6a] hover:text-[#1a1a1a] hover:bg-[#f6f6f6]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#547e69]" />
              <span>Orders</span>
            </button>
          </div>

          {/* Right Header branding */}
          <div className="flex items-center space-x-2 text-xs font-serif text-[#6a6a6a]">
            <Utensils className="w-3.5 h-3.5 text-[#547e69]" />
            <span className="hidden sm:inline">Home Bakery Suite</span>
          </div>
        </div>
      </nav>

      {/* Tab 1: Cost Calculator Content */}
      {activeTab === 'calculator' && (
        <>
          {/* Header Bar */}
          <Header
            recipeTitle={recipeState.title}
            onUpdateTitle={handleUpdateTitle}
            currencySymbol={recipeState.currencySymbol}
            onUpdateCurrency={handleUpdateCurrency}
            onResetSample={handleResetSample}
            onClearAll={handleClearAll}
            onOpenSummary={() => setIsSummaryOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pb-16">
            
            {/* Section 1: Ingredient List */}
            <IngredientTable
              ingredients={recipeState.ingredients}
              currencySymbol={recipeState.currencySymbol}
              onUpdateIngredient={handleUpdateIngredient}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              totalIngredientCost={totalIngredientCost}
            />

            {/* Section 2: Yield */}
            <YieldSection
              yieldQuantity={recipeState.yieldQuantity}
              yieldUnitName={recipeState.yieldUnitName}
              onUpdateYieldQuantity={handleUpdateYieldQuantity}
              onUpdateYieldUnitName={handleUpdateYieldUnitName}
              totalIngredientCost={totalIngredientCost}
              costPerPiece={costPerPiece}
              currencySymbol={recipeState.currencySymbol}
            />

            {/* Section 3: Suggested Selling Price & Margin Comparison */}
            <PriceAndMarginSection
              costPerPiece={costPerPiece}
              totalIngredientCost={totalIngredientCost}
              yieldQuantity={recipeState.yieldQuantity}
              yieldUnitName={recipeState.yieldUnitName}
              currencySymbol={recipeState.currencySymbol}
              selectedMargin={recipeState.selectedMargin}
              onSelectMargin={handleSelectMargin}
              customMargin={recipeState.customMargin}
              onChangeCustomMargin={handleChangeCustomMargin}
              plannedPricePerPiece={recipeState.plannedPricePerPiece}
              onChangePlannedPrice={handleChangePlannedPrice}
              overheadBufferPercent={recipeState.overheadBufferPercent}
              onChangeOverheadBuffer={handleChangeOverheadBuffer}
            />

            {/* Educational Baker's Guide Section */}
            <section className="bg-[#f6f6f6] border border-[#e3e3e3] rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-[#4d3f32]">
                <BookOpen className="w-4 h-4 text-[#547e69]" />
                <h3 className="text-base font-serif font-normal">
                  Quick Baker's Guide to COGS & Profit Margins
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#6a6a6a] leading-relaxed">
                <div className="bg-white p-3.5 rounded-lg border border-[#e3e3e3] space-y-1">
                  <span className="font-semibold text-[#1a1a1a] block">
                    1. What is COGS?
                  </span>
                  <p>
                    COGS (Cost of Goods Sold) is the direct expense of ingredients and immediate packaging going into a single batch of baked goods.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-[#e3e3e3] space-y-1">
                  <span className="font-semibold text-[#1a1a1a] block">
                    2. Margin vs. Markup
                  </span>
                  <p>
                    <strong>Margin</strong> is profit divided by selling price. <strong>Markup</strong> is profit divided by ingredient cost. A 40% margin equals roughly a 66% markup on ingredients.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-[#e3e3e3] space-y-1">
                  <span className="font-semibold text-[#1a1a1a] block">
                    3. Don't forget Overhead!
                  </span>
                  <p>
                    Target a 35%–50% profit margin to ensure you leave enough income to cover electricity, oven gas, packaging boxes, and your own labor time.
                  </p>
                </div>
              </div>
            </section>

          </main>
        </>
      )}

      {/* Tab 2: Orders Content */}
      {activeTab === 'orders' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-16">
          <OrdersTab currencySymbol={recipeState.currencySymbol} />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-[#e3e3e3] bg-white py-6 text-center text-xs text-[#6a6a6a]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {activeTab === 'calculator'
              ? 'Bakery COGS Calculator • Scratchpad Mode'
              : 'Bakery Order Tracker • Saved in Browser Storage'}
          </span>
          <span className="text-[#8d8d8d]">
            Clean, professional tool for home bakers & pastry chefs.
          </span>
        </div>
      </footer>

      {/* Summary Modal */}
      <RecipeSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        recipeTitle={recipeState.title}
        ingredients={recipeState.ingredients}
        yieldQuantity={recipeState.yieldQuantity}
        yieldUnitName={recipeState.yieldUnitName}
        currencySymbol={recipeState.currencySymbol}
        totalIngredientCost={totalIngredientCost}
        costPerPiece={costPerPiece}
        suggestedPrice={suggestedPrice}
        plannedPrice={plannedPriceNum}
        targetMarginPercent={activeMarginPercent}
      />
    </div>
  );
}

