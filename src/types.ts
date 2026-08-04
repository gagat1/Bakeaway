export type MeasurementUnit = 
  | 'g' 
  | 'kg' 
  | 'oz' 
  | 'lb' 
  | 'ml' 
  | 'l' 
  | 'tsp' 
  | 'tbsp' 
  | 'cup' 
  | 'fl oz' 
  | 'pcs' 
  | 'doz';

export interface Ingredient {
  id: string;
  name: string;
  amountUsed: number | string;
  usedUnit: MeasurementUnit;
  packageSize: number | string;
  packageUnit: MeasurementUnit;
  pricePaid: number | string;
  notes?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export type MarginHealthLevel = 'loss' | 'thin' | 'healthy' | 'strong';

export interface MarginHealth {
  level: MarginHealthLevel;
  label: string;
  description: string;
  colorClass: string;
  badgeClass: string;
}

export interface RecipeState {
  title: string;
  yieldQuantity: number | string;
  yieldUnitName: string;
  ingredients: Ingredient[];
  selectedMargin: number; // e.g. 40 for 40%
  customMargin: number | string;
  plannedPricePerPiece: number | string;
  currencySymbol: string;
  overheadBufferPercent: number | string; // Optional batch overhead e.g., packaging/electricity %
}

export type OrderSource = 'whatsapp' | 'instagram' | 'other';
export type PaymentStatus = 'paid' | 'unpaid';

export interface BakingBatch {
  id: string;
  name: string;
  bakingDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
}

export interface OrderProductItem {
  id: string;
  name: string;
  quantity: number | string;
  isMade: boolean;
  unitPrice?: number | string;
}

export interface Order {
  id: string;
  batchId?: string; // Associated Baking / Pre-Order Batch
  customerName: string;
  source: OrderSource;
  contactDetail: string; // Phone number for WhatsApp, or username for Instagram
  products: OrderProductItem[];
  deliveryAddress?: string;
  paymentMethod: string; // e.g., Cash, Transfer, E-wallet / QRIS
  paymentStatus: PaymentStatus;
  orderDate: string; // ISO or YYYY-MM-DD
  deliveryDate?: string;
  notes?: string;
  totalAmount?: number | string;
  createdAt: number;
}
