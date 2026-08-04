import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  MessageCircle,
  Instagram,
  CheckSquare,
  Square,
  ExternalLink,
  MapPin,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ShoppingBag,
  Calendar,
  PackageCheck,
  Layers,
  Clock,
  ChefHat,
  ChevronRight,
  Sparkles,
  Database,
  RefreshCw
} from 'lucide-react';
import { Order, OrderProductItem, OrderSource, PaymentStatus, BakingBatch } from '../types';
import { INITIAL_ORDERS, INITIAL_BATCHES } from '../data/defaultOrders';
import { formatCurrency } from '../utils/calculator';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { SupabaseSyncModal } from './SupabaseSyncModal';

interface OrdersTabProps {
  currencySymbol: string;
}

const BATCHES_STORAGE_KEY = 'bakery_batches_v1';
const ORDERS_STORAGE_KEY = 'bakery_orders_v1';

export const OrdersTab: React.FC<OrdersTabProps> = ({ currencySymbol }) => {
  // Supabase Modal & Sync state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSupabase, setHasSupabase] = useState(isSupabaseConfigured);

  // Local state for Batches
  const [batches, setBatches] = useState<BakingBatch[]>(() => {
    try {
      const saved = localStorage.getItem(BATCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error('Error loading batches from localStorage:', err);
    }
    return INITIAL_BATCHES;
  });

  // Local state for Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error('Error loading orders from localStorage:', err);
    }
    return INITIAL_ORDERS;
  });

  // Fetch data from Supabase if configured
  const loadSupabaseData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsSyncing(true);
    try {
      // 1. Fetch batches
      const { data: dbBatches, error: batchErr } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (!batchErr && dbBatches) {
        const formattedBatches: BakingBatch[] = dbBatches.map((b: any) => ({
          id: b.id,
          name: b.name,
          bakingDate: b.baking_date,
          notes: b.notes || '',
          createdAt: Number(b.created_at) || Date.now(),
        }));
        setBatches(formattedBatches);
      }

      // 2. Fetch orders
      const { data: dbOrders, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!orderErr && dbOrders) {
        const formattedOrders: Order[] = dbOrders.map((o: any) => ({
          id: o.id,
          batchId: o.batch_id || undefined,
          customerName: o.customer_name,
          source: o.source || 'whatsapp',
          contactDetail: o.contact_detail || '',
          deliveryAddress: o.delivery_address || '',
          paymentMethod: o.payment_method || 'Transfer',
          paymentStatus: o.payment_status || 'unpaid',
          orderDate: o.order_date || new Date().toISOString().split('T')[0],
          deliveryDate: o.delivery_date || '',
          notes: o.notes || '',
          products: Array.isArray(o.products) ? o.products : [],
          totalAmount: Number(o.total_amount) || 0,
          createdAt: Number(o.created_at) || Date.now(),
        }));
        setOrders(formattedOrders);
      }
      setHasSupabase(true);
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadSupabaseData();
  }, [loadSupabaseData]);

  // Batch Selection & Filtering
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'unfinished' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Order Form State
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const [formBatchId, setFormBatchId] = useState<string>('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formSource, setFormSource] = useState<OrderSource>('whatsapp');
  const [formContactDetail, setFormContactDetail] = useState('');
  const [formDeliveryAddress, setFormDeliveryAddress] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Transfer');
  const [formPaymentStatus, setFormPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formProducts, setFormProducts] = useState<
    { id: string; name: string; quantity: string | number; unitPrice: string | number; isMade: boolean }[]
  >([{ id: 'prod-1', name: '', quantity: '1', unitPrice: '', isMade: false }]);

  // Batch Form State
  const [isBatchFormOpen, setIsBatchFormOpen] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchFormName, setBatchFormName] = useState('');
  const [batchFormDate, setBatchFormDate] = useState('');
  const [batchFormNotes, setBatchFormNotes] = useState('');

  // Persist Batches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(batches));
    } catch (err) {
      console.error('Error saving batches:', err);
    }
  }, [batches]);

  // Persist Orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.error('Error saving orders:', err);
    }
  }, [orders]);

  // --- BATCH HANDLERS WITH SUPABASE SYNC ---
  const handleOpenNewBatchForm = () => {
    setEditingBatchId(null);
    setBatchFormName('');
    setBatchFormDate(new Date().toISOString().split('T')[0]);
    setBatchFormNotes('');
    setIsBatchFormOpen(true);
  };

  const handleOpenEditBatchForm = (batch: BakingBatch, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBatchId(batch.id);
    setBatchFormName(batch.name);
    setBatchFormDate(batch.bakingDate);
    setBatchFormNotes(batch.notes || '');
    setIsBatchFormOpen(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFormName.trim()) return;

    let targetBatch: BakingBatch;

    if (editingBatchId) {
      targetBatch = {
        id: editingBatchId,
        name: batchFormName.trim(),
        bakingDate: batchFormDate,
        notes: batchFormNotes.trim(),
        createdAt: batches.find((b) => b.id === editingBatchId)?.createdAt || Date.now(),
      };
      setBatches((prev) => prev.map((b) => (b.id === editingBatchId ? targetBatch : b)));
    } else {
      targetBatch = {
        id: `batch-${Date.now()}`,
        name: batchFormName.trim(),
        bakingDate: batchFormDate || new Date().toISOString().split('T')[0],
        notes: batchFormNotes.trim(),
        createdAt: Date.now(),
      };
      setBatches((prev) => [...prev, targetBatch]);
      setSelectedBatchId(targetBatch.id);
    }

    // Sync to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('batches').upsert({
        id: targetBatch.id,
        name: targetBatch.name,
        baking_date: targetBatch.bakingDate,
        notes: targetBatch.notes,
        created_at: targetBatch.createdAt,
      });
    }

    setIsBatchFormOpen(false);
  };

  const handleDeleteBatch = async (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this batch? Orders in this batch will be moved to Unassigned.')) {
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
      setOrders((prev) =>
        prev.map((o) => (o.batchId === batchId ? { ...o, batchId: undefined } : o))
      );
      if (selectedBatchId === batchId) {
        setSelectedBatchId('all');
      }

      // Sync to Supabase if connected
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('batches').delete().eq('id', batchId);
      }
    }
  };

  // --- ORDER HANDLERS WITH SUPABASE SYNC ---
  const handleOpenNewOrderForm = () => {
    setEditingOrderId(null);
    setFormBatchId(selectedBatchId !== 'all' && selectedBatchId !== 'unassigned' ? selectedBatchId : (batches[0]?.id || ''));
    setFormCustomerName('');
    setFormSource('whatsapp');
    setFormContactDetail('');
    setFormDeliveryAddress('');
    setFormPaymentMethod('Transfer');
    setFormPaymentStatus('unpaid');
    
    // Set default date from selected batch if applicable
    const activeBatch = batches.find((b) => b.id === selectedBatchId);
    setFormDeliveryDate(activeBatch ? activeBatch.bakingDate : new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormProducts([
      { id: `p-${Date.now()}-1`, name: '', quantity: 1, unitPrice: '', isMade: false }
    ]);
    setIsOrderFormOpen(true);
  };

  const handleOpenEditOrderForm = (order: Order) => {
    setEditingOrderId(order.id);
    setFormBatchId(order.batchId || '');
    setFormCustomerName(order.customerName);
    setFormSource(order.source);
    setFormContactDetail(order.contactDetail);
    setFormDeliveryAddress(order.deliveryAddress || '');
    setFormPaymentMethod(order.paymentMethod);
    setFormPaymentStatus(order.paymentStatus);
    setFormDeliveryDate(order.deliveryDate || '');
    setFormNotes(order.notes || '');
    setFormProducts(
      order.products.length > 0
        ? order.products.map((p) => ({ ...p }))
        : [{ id: `p-${Date.now()}-1`, name: '', quantity: 1, unitPrice: '', isMade: false }]
    );
    setIsOrderFormOpen(true);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim()) return;

    const validProducts: OrderProductItem[] = formProducts
      .filter((p) => p.name.trim() !== '')
      .map((p) => ({
        id: p.id || `p-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: p.name.trim(),
        quantity: p.quantity || 1,
        isMade: p.isMade,
        unitPrice: p.unitPrice !== '' ? p.unitPrice : 0,
      }));

    const computedTotal = validProducts.reduce((sum, p) => {
      const q = typeof p.quantity === 'number' ? p.quantity : parseFloat(p.quantity) || 1;
      const price = typeof p.unitPrice === 'number' ? p.unitPrice : parseFloat(p.unitPrice?.toString() || '0') || 0;
      return sum + q * price;
    }, 0);

    let targetOrder: Order;

    if (editingOrderId) {
      const existing = orders.find((o) => o.id === editingOrderId);
      targetOrder = {
        id: editingOrderId,
        batchId: formBatchId || undefined,
        customerName: formCustomerName.trim(),
        source: formSource,
        contactDetail: formContactDetail.trim(),
        products: validProducts,
        deliveryAddress: formDeliveryAddress.trim(),
        paymentMethod: formPaymentMethod,
        paymentStatus: formPaymentStatus,
        orderDate: existing?.orderDate || new Date().toISOString().split('T')[0],
        deliveryDate: formDeliveryDate,
        notes: formNotes.trim(),
        totalAmount: computedTotal > 0 ? computedTotal : existing?.totalAmount || 0,
        createdAt: existing?.createdAt || Date.now(),
      };
      setOrders((prev) => prev.map((o) => (o.id === editingOrderId ? targetOrder : o)));
    } else {
      targetOrder = {
        id: `ord-${Date.now()}`,
        batchId: formBatchId || undefined,
        customerName: formCustomerName.trim(),
        source: formSource,
        contactDetail: formContactDetail.trim(),
        products: validProducts.length > 0 ? validProducts : [{ id: `p-${Date.now()}`, name: 'Custom Order Item', quantity: 1, isMade: false }],
        deliveryAddress: formDeliveryAddress.trim(),
        paymentMethod: formPaymentMethod,
        paymentStatus: formPaymentStatus,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: formDeliveryDate || new Date().toISOString().split('T')[0],
        notes: formNotes.trim(),
        totalAmount: computedTotal,
        createdAt: Date.now(),
      };
      setOrders((prev) => [targetOrder, ...prev]);
    }

    // Sync to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('orders').upsert({
        id: targetOrder.id,
        batch_id: targetOrder.batchId || null,
        customer_name: targetOrder.customerName,
        source: targetOrder.source,
        contact_detail: targetOrder.contactDetail,
        delivery_address: targetOrder.deliveryAddress,
        payment_method: targetOrder.paymentMethod,
        payment_status: targetOrder.paymentStatus,
        order_date: targetOrder.orderDate,
        delivery_date: targetOrder.deliveryDate,
        notes: targetOrder.notes,
        products: targetOrder.products,
        total_amount: targetOrder.totalAmount,
        created_at: targetOrder.createdAt,
      });
    }

    setIsOrderFormOpen(false);
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setOrders((prev) => prev.filter((o) => o.id !== id));

      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('orders').delete().eq('id', id);
      }
    }
  };

  const handleTogglePayment = async (orderId: string) => {
    let updatedStatus: PaymentStatus = 'paid';
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          updatedStatus = o.paymentStatus === 'paid' ? 'unpaid' : 'paid';
          return { ...o, paymentStatus: updatedStatus };
        }
        return o;
      })
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('orders').update({ payment_status: updatedStatus }).eq('id', orderId);
    }
  };

  const handleToggleProductMade = async (orderId: string, productId: string) => {
    let updatedProducts: OrderProductItem[] = [];
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        updatedProducts = o.products.map((p) =>
          p.id === productId ? { ...p, isMade: !p.isMade } : p
        );
        return { ...o, products: updatedProducts };
      })
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('orders').update({ products: updatedProducts }).eq('id', orderId);
    }
  };

  const handleAddProductLine = () => {
    setFormProducts((prev) => [
      ...prev,
      { id: `p-${Date.now()}-${prev.length + 1}`, name: '', quantity: 1, unitPrice: '', isMade: false },
    ]);
  };

  const handleRemoveProductLine = (index: number) => {
    if (formProducts.length === 1) return;
    setFormProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProductLine = (index: number, field: string, value: any) => {
    setFormProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const getContactLink = (source: OrderSource, detail: string) => {
    if (!detail) return null;
    if (source === 'whatsapp') {
      const phoneDigits = detail.replace(/[^0-9]/g, '');
      const formattedPhone = phoneDigits.startsWith('0') ? '62' + phoneDigits.slice(1) : phoneDigits;
      return `https://wa.me/${formattedPhone}`;
    } else if (source === 'instagram') {
      const handle = detail.replace('@', '').trim();
      return `https://instagram.com/${handle}`;
    }
    return null;
  };

  // --- FILTERING LOGIC ---
  const ordersInBatchFilter = orders.filter((o) => {
    if (selectedBatchId === 'all') return true;
    if (selectedBatchId === 'unassigned') return !o.batchId;
    return o.batchId === selectedBatchId;
  });

  const finalFilteredOrders = ordersInBatchFilter.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.contactDetail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (paymentFilter === 'unpaid') return order.paymentStatus === 'unpaid';
    if (paymentFilter === 'paid') return order.paymentStatus === 'paid';
    if (paymentFilter === 'unfinished') return order.products.some((p) => !p.isMade);

    return true;
  });

  // Active batch object if viewing specific batch
  const currentActiveBatch = batches.find((b) => b.id === selectedBatchId);

  // Aggregate total items to bake for the active view/batch
  const batchProductTotals: { [key: string]: { name: string; totalQty: number; madeQty: number } } = {};
  ordersInBatchFilter.forEach((ord) => {
    ord.products.forEach((p) => {
      const key = p.name.trim().toLowerCase();
      const qty = typeof p.quantity === 'number' ? p.quantity : parseFloat(p.quantity) || 1;
      if (!batchProductTotals[key]) {
        batchProductTotals[key] = { name: p.name.trim(), totalQty: 0, madeQty: 0 };
      }
      batchProductTotals[key].totalQty += qty;
      if (p.isMade) {
        batchProductTotals[key].madeQty += qty;
      }
    });
  });

  const batchProductList = Object.values(batchProductTotals);

  // Metrics calculation
  const totalRevenueInView = ordersInBatchFilter.reduce((sum, o) => {
    const val = typeof o.totalAmount === 'number' ? o.totalAmount : parseFloat(o.totalAmount?.toString() || '0') || 0;
    return sum + val;
  }, 0);

  const unpaidCountInView = ordersInBatchFilter.filter((o) => o.paymentStatus === 'unpaid').length;
  const unfinishedPrepCountInView = ordersInBatchFilter.filter((o) => o.products.some((p) => !p.isMade)).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#e3e3e3] rounded-xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="p-1.5 bg-[#f1fcf6] border border-[#547e69]/30 rounded-lg text-[#547e69]">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-[#1a1a1a]">
                Pre-Orders & Baking Batches
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6a6a6a]">
              Group customer pre-orders into scheduled baking batches. See total yield needed per batch date.
            </p>
          </div>

          <div className="flex flex-wrap items-center space-x-2 gap-y-2">
            {/* Supabase Connection Button Badge */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-sm ${
                hasSupabase
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title="Database Sync Status"
            >
              <Database className={`w-3.5 h-3.5 ${hasSupabase ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span>{hasSupabase ? 'Supabase Connected' : 'Connect Supabase'}</span>
              {isSyncing && <RefreshCw className="w-3 h-3 animate-spin ml-1" />}
            </button>

            <button
              onClick={handleOpenNewBatchForm}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-white border border-[#e3e3e3] hover:bg-[#f6f6f6] text-[#1a1a1a] rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#547e69]" />
              <span>+ New Batch</span>
            </button>

            <button
              onClick={handleOpenNewOrderForm}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#333333] rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Order</span>
            </button>
          </div>
        </div>

        {/* Batch Selector Tabs Row */}
        <div className="pt-3 border-t border-[#e3e3e3]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6a6a6a] flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#547e69] inline mr-1" />
              Select Pre-Order Batch:
            </span>
            {currentActiveBatch && (
              <span className="text-xs text-[#547e69] font-medium">
                Baking Date: {currentActiveBatch.bakingDate}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {/* All Batches Tab */}
            <button
              onClick={() => setSelectedBatchId('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2 shrink-0 ${
                selectedBatchId === 'all'
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-sm'
                  : 'bg-[#f6f6f6] text-[#6a6a6a] border-[#e3e3e3] hover:bg-white hover:text-[#1a1a1a]'
              }`}
            >
              <span>All Orders</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${selectedBatchId === 'all' ? 'bg-white/20 text-white' : 'bg-white text-[#6a6a6a] border border-[#e3e3e3]'}`}>
                {orders.length}
              </span>
            </button>

            {/* Individual Batch Tabs */}
            {batches.map((batch) => {
              const batchOrderCount = orders.filter((o) => o.batchId === batch.id).length;
              const isSelected = selectedBatchId === batch.id;

              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`group relative inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#547e69] text-white border-[#547e69] shadow-sm'
                      : 'bg-white text-[#1a1a1a] border-[#e3e3e3] hover:border-[#547e69]'
                  }`}
                >
                  <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#547e69]'}`} />
                  <span className="font-medium">{batch.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#f6f6f6] text-[#6a6a6a]'
                    }`}
                  >
                    {batchOrderCount}
                  </span>

                  {/* Edit/Delete batch inline actions */}
                  <div className="flex items-center space-x-1 ml-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleOpenEditBatchForm(batch, e)}
                      className={`p-0.5 rounded hover:bg-black/10 ${isSelected ? 'text-white' : 'text-[#6a6a6a]'}`}
                      title="Edit Batch Name/Date"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteBatch(batch.id, e)}
                      className={`p-0.5 rounded hover:bg-black/10 ${isSelected ? 'text-white' : 'text-[#8d8d8d] hover:text-rose-600'}`}
                      title="Delete Batch"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Unassigned Batch Tab if any exist */}
            {orders.some((o) => !o.batchId) && (
              <button
                onClick={() => setSelectedBatchId('unassigned')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2 shrink-0 ${
                  selectedBatchId === 'unassigned'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>Unassigned</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900">
                  {orders.filter((o) => !o.batchId).length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Batch Yield Production Summary Card */}
      <div className="bg-gradient-to-r from-[#f1fcf6] to-white border border-[#547e69]/30 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-[#547e69]" />
            <div>
              <h3 className="text-sm font-semibold text-[#1a1a1a]">
                {currentActiveBatch ? `${currentActiveBatch.name} — Batch Prep Summary` : 'Overall Baking Prep Totals'}
              </h3>
              <p className="text-xs text-[#6a6a6a]">
                {currentActiveBatch?.notes
                  ? `Note: ${currentActiveBatch.notes}`
                  : 'Total quantities required for this batch order queue.'}
              </p>
            </div>
          </div>

          <div className="text-xs text-[#6a6a6a] bg-white px-3 py-1.5 rounded-lg border border-[#e3e3e3] self-start sm:self-auto">
            Total Revenue: <strong className="text-[#1a1a1a] font-semibold">{formatCurrency(totalRevenueInView, currencySymbol)}</strong>
          </div>
        </div>

        {/* Grid of Total Item Quantities to Bake */}
        {batchProductList.length === 0 ? (
          <p className="text-xs text-[#8d8d8d] italic">No items listed in this batch yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
            {batchProductList.map((prod, i) => {
              const isFullyDone = prod.madeQty >= prod.totalQty;
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    isFullyDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-white border-[#e3e3e3] text-[#1a1a1a]'
                  }`}
                >
                  <span className="truncate pr-1 font-medium">{prod.name}</span>
                  <span className="font-semibold px-2 py-0.5 rounded bg-[#f6f6f6] border border-[#e3e3e3] shrink-0">
                    {prod.madeQty}/{prod.totalQty} pcs
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-[#e3e3e3] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Status Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setPaymentFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              paymentFilter === 'all'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                : 'bg-white text-[#6a6a6a] border-[#e3e3e3] hover:bg-[#f6f6f6]'
            }`}
          >
            All in Batch ({ordersInBatchFilter.length})
          </button>

          <button
            onClick={() => setPaymentFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              paymentFilter === 'unpaid'
                ? 'bg-amber-800 text-white border-amber-800'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Unpaid ({unpaidCountInView})
          </button>

          <button
            onClick={() => setPaymentFilter('unfinished')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              paymentFilter === 'unfinished'
                ? 'bg-[#547e69] text-white border-[#547e69]'
                : 'bg-[#f1fcf6] text-[#547e69] border-[#547e69]/30 hover:bg-[#e3f8eb]'
            }`}
          >
            Pending Prep ({unfinishedPrepCountInView})
          </button>

          <button
            onClick={() => setPaymentFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              paymentFilter === 'paid'
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-white text-[#6a6a6a] border-[#e3e3e3] hover:bg-[#f6f6f6]'
            }`}
          >
            Paid ({ordersInBatchFilter.filter((o) => o.paymentStatus === 'paid').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center min-w-[200px] sm:min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#6a6a6a] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer or item..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#f6f6f6] border border-[#e3e3e3] rounded-lg focus:outline-none focus:border-[#547e69] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[#8d8d8d] hover:text-[#1a1a1a] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Batch Form Modal/Drawer */}
      {isBatchFormOpen && (
        <form
          onSubmit={handleSaveBatch}
          className="bg-white border-2 border-[#1a1a1a] rounded-xl p-5 sm:p-6 shadow-lg space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#e3e3e3] pb-3">
            <h3 className="text-base font-serif font-medium text-[#1a1a1a]">
              {editingBatchId ? 'Edit Baking Batch' : 'Add New Pre-Order Batch'}
            </h3>
            <button
              type="button"
              onClick={() => setIsBatchFormOpen(false)}
              className="p-1 text-[#6a6a6a] hover:text-[#1a1a1a] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Batch Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={batchFormName}
                onChange={(e) => setBatchFormName(e.target.value)}
                placeholder="e.g. Batch #3 - August PO or Midweek Sourdough"
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Baking / Delivery Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={batchFormDate}
                onChange={(e) => setBatchFormDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Batch Notes (Optional)
              </label>
              <input
                type="text"
                value={batchFormNotes}
                onChange={(e) => setBatchFormNotes(e.target.value)}
                placeholder="e.g. Pre-orders close Friday 5 PM, pickup starts 2 PM"
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#e3e3e3]">
            <button
              type="button"
              onClick={() => setIsBatchFormOpen(false)}
              className="px-4 py-2 border border-[#e3e3e3] rounded-lg text-xs font-medium text-[#6a6a6a] hover:bg-[#f6f6f6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a1a1a] text-white rounded-lg text-xs font-medium hover:bg-[#333333] cursor-pointer"
            >
              {editingBatchId ? 'Save Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      )}

      {/* Inline Create / Edit Order Form Drawer/Panel */}
      {isOrderFormOpen && (
        <form
          onSubmit={handleSaveOrder}
          className="bg-white border-2 border-[#547e69] rounded-xl p-5 sm:p-7 shadow-lg space-y-5 relative animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#e3e3e3] pb-3">
            <h3 className="text-lg font-serif font-light text-[#1a1a1a] flex items-center space-x-2">
              <span>{editingOrderId ? 'Edit Customer Order' : 'Create New Customer Order'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsOrderFormOpen(false)}
              className="p-1 text-[#6a6a6a] hover:text-[#1a1a1a] rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Batch Assignment Select */}
            <div className="sm:col-span-2 bg-[#f6f6f6] p-3 rounded-lg border border-[#e3e3e3]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-1">
                Assign to Baking Batch
              </label>
              <select
                value={formBatchId}
                onChange={(e) => setFormBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              >
                <option value="">-- No Batch (Standalone Order) --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.bakingDate})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Customer Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formCustomerName}
                onChange={(e) => setFormCustomerName(e.target.value)}
                placeholder="e.g. Siti Rahma or Budi"
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              />
            </div>

            {/* Order Source & Contact Detail */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                  Source
                </label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as OrderSource)}
                  className="w-full px-2 py-2 bg-[#f6f6f6] border border-[#e3e3e3] rounded-lg text-xs font-medium text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                  {formSource === 'whatsapp'
                    ? 'Phone Number'
                    : formSource === 'instagram'
                    ? 'Instagram Handle'
                    : 'Contact Info'}
                </label>
                <input
                  type="text"
                  value={formContactDetail}
                  onChange={(e) => setFormContactDetail(e.target.value)}
                  placeholder={
                    formSource === 'whatsapp'
                      ? 'e.g. 081234567890'
                      : formSource === 'instagram'
                      ? '@username'
                      : 'Phone or email'
                  }
                  className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Delivery Address <span className="text-[#8d8d8d] font-normal">(leave blank for self pickup)</span>
              </label>
              <input
                type="text"
                value={formDeliveryAddress}
                onChange={(e) => setFormDeliveryAddress(e.target.value)}
                placeholder="e.g. Jl. Mawar No. 14, Jakarta Selatan or Pickup"
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              />
            </div>

            {/* Payment Method & Payment Status */}
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Payment Method
              </label>
              <select
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              >
                <option value="Transfer">Bank Transfer</option>
                <option value="E-wallet / QRIS">E-wallet / QRIS</option>
                <option value="Cash">Cash / COD</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Payment Status
              </label>
              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setFormPaymentStatus('unpaid')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition-colors cursor-pointer ${
                    formPaymentStatus === 'unpaid'
                      ? 'bg-amber-800 text-white border-amber-800'
                      : 'bg-white text-amber-900 border-amber-200'
                  }`}
                >
                  Not Paid
                </button>
                <button
                  type="button"
                  onClick={() => setFormPaymentStatus('paid')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition-colors cursor-pointer ${
                    formPaymentStatus === 'paid'
                      ? 'bg-[#547e69] text-white border-[#547e69]'
                      : 'bg-white text-[#547e69] border-[#547e69]/30'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* Target Delivery Date */}
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Target Date / Time
              </label>
              <input
                type="date"
                value={formDeliveryDate}
                onChange={(e) => setFormDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Special Notes / Requests
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Gift box, candles, less sugar..."
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              />
            </div>
          </div>

          {/* Products List Section */}
          <div className="pt-3 border-t border-[#e3e3e3] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a]">
                Products Ordered
              </label>
              <button
                type="button"
                onClick={handleAddProductLine}
                className="inline-flex items-center space-x-1 text-xs text-[#547e69] font-medium hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {formProducts.map((p, idx) => (
                <div key={p.id || idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    value={p.name}
                    onChange={(e) => handleUpdateProductLine(idx, 'name', e.target.value)}
                    placeholder="Product name (e.g. Sourdough Loaf)"
                    className="flex-1 px-3 py-1.5 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                  />

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={p.quantity}
                      onChange={(e) => handleUpdateProductLine(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 bg-white border border-[#e3e3e3] rounded-lg text-sm text-center text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                    />
                  </div>

                  <div className="w-32 relative flex items-center">
                    <span className="absolute left-2 text-xs text-[#6a6a6a]">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={p.unitPrice}
                      onChange={(e) => handleUpdateProductLine(idx, 'unitPrice', e.target.value)}
                      placeholder="Price"
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-[#e3e3e3] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                    />
                  </div>

                  {formProducts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProductLine(idx)}
                      className="p-1.5 text-[#8d8d8d] hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#e3e3e3]">
            <button
              type="button"
              onClick={() => setIsOrderFormOpen(false)}
              className="px-4 py-2 border border-[#e3e3e3] rounded-lg text-xs font-medium text-[#6a6a6a] hover:bg-[#f6f6f6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a1a1a] text-white rounded-lg text-xs font-medium hover:bg-[#333333] transition-colors cursor-pointer shadow-sm"
            >
              {editingOrderId ? 'Save Order' : 'Create Order'}
            </button>
          </div>
        </form>
      )}

      {/* Orders Cards List Grid */}
      {finalFilteredOrders.length === 0 ? (
        <div className="bg-white border border-[#e3e3e3] rounded-xl p-12 text-center space-y-3">
          <ShoppingBag className="w-8 h-8 text-[#8d8d8d] mx-auto" />
          <h3 className="text-lg font-serif text-[#1a1a1a]">No orders found</h3>
          <p className="text-xs text-[#6a6a6a] max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try clearing your search.`
              : 'No orders in this batch. Click "+ New Order" to add customer orders to this batch.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 px-3 py-1.5 bg-[#f6f6f6] text-xs font-medium rounded-lg text-[#1a1a1a] border border-[#e3e3e3] cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {finalFilteredOrders.map((order) => {
            const allProductsMade = order.products.length > 0 && order.products.every((p) => p.isMade);
            const isUnpaid = order.paymentStatus === 'unpaid';
            const contactUrl = getContactLink(order.source, order.contactDetail);
            const parentBatch = batches.find((b) => b.id === order.batchId);

            const computedTotal = order.products.reduce((sum, p) => {
              const q = typeof p.quantity === 'number' ? p.quantity : parseFloat(p.quantity) || 1;
              const price = typeof p.unitPrice === 'number' ? p.unitPrice : parseFloat(p.unitPrice?.toString() || '0') || 0;
              return sum + q * price;
            }, 0);

            const displayAmount = computedTotal > 0 ? computedTotal : (typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount?.toString() || '0') || 0);

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4 transition-all relative ${
                  isUnpaid
                    ? 'border-amber-300 ring-1 ring-amber-200/60 bg-gradient-to-b from-amber-50/20 to-white'
                    : 'border-[#e3e3e3] hover:border-[#547e69]'
                }`}
              >
                {/* Card Top Row: Customer Name, Batch Tag, Source & Payment Badge */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e3e3e3]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-semibold text-[#1a1a1a]">
                        {order.customerName}
                      </h3>

                      {/* Source Icon Badge */}
                      {order.source === 'whatsapp' && (
                        <span
                          title="WhatsApp Order"
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          <MessageCircle className="w-3 h-3 mr-1 text-emerald-600" />
                          WA
                        </span>
                      )}

                      {order.source === 'instagram' && (
                        <span
                          title="Instagram Order"
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200"
                        >
                          <Instagram className="w-3 h-3 mr-1 text-purple-600" />
                          IG
                        </span>
                      )}
                    </div>

                    {/* Associated Batch Tag */}
                    {parentBatch ? (
                      <div className="mt-1 flex items-center space-x-1 text-[11px] text-[#547e69] font-medium">
                        <Layers className="w-3 h-3 text-[#547e69]" />
                        <span>{parentBatch.name}</span>
                      </div>
                    ) : (
                      <div className="mt-1 text-[11px] text-[#8d8d8d] italic">
                        Standalone Order (No Batch)
                      </div>
                    )}

                    {/* Social/Messaging Link */}
                    {order.contactDetail && contactUrl && (
                      <a
                        href={contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-[#547e69] hover:underline mt-0.5"
                      >
                        <span>{order.contactDetail}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>

                  {/* Payment Status Badge Toggle */}
                  <button
                    onClick={() => handleTogglePayment(order.id)}
                    title="Click to toggle Payment Status"
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isUnpaid
                        ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200'
                        : 'bg-[#f1fcf6] text-[#547e69] border-[#547e69]/40 hover:bg-[#e3f8eb]'
                    }`}
                  >
                    {isUnpaid ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>UNPAID</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#547e69]" />
                        <span>PAID</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Delivery & Date Metadata */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#6a6a6a]">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8d8d8d] shrink-0" />
                    <span className="truncate">
                      {order.deliveryAddress || 'Self Pickup at Bakery'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-[#8d8d8d] shrink-0" />
                    <span>
                      {order.deliveryDate ? `Due: ${order.deliveryDate}` : `Ordered: ${order.orderDate}`}
                    </span>
                  </div>
                </div>

                {/* Products Prep Checklist */}
                <div className="bg-[#f6f6f6] rounded-lg p-3 space-y-2 border border-[#e3e3e3]">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#6a6a6a]">
                    <span>Items Checklist ({order.products.filter(p => p.isMade).length}/{order.products.length} ready)</span>
                    {allProductsMade && (
                      <span className="text-[#547e69] flex items-center">
                        <PackageCheck className="w-3.5 h-3.5 mr-1" />
                        All Prepared
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {order.products.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleToggleProductMade(order.id, prod.id)}
                        className="flex items-center justify-between group cursor-pointer select-none text-xs p-1.5 rounded hover:bg-white transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {prod.isMade ? (
                            <CheckSquare className="w-4 h-4 text-[#547e69] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-[#8d8d8d] group-hover:text-[#1a1a1a] shrink-0" />
                          )}
                          <span
                            className={`transition-all ${
                              prod.isMade
                                ? 'line-through text-[#8d8d8d]'
                                : 'text-[#1a1a1a] font-medium'
                            }`}
                          >
                            {prod.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-[#4d3f32] bg-white px-2 py-0.5 rounded border border-[#e3e3e3]">
                            x{prod.quantity}
                          </span>
                          {prod.unitPrice && parseFloat(prod.unitPrice.toString()) > 0 && (
                            <span className="text-[11px] text-[#6a6a6a]">
                              {formatCurrency(parseFloat(prod.unitPrice.toString()) * (typeof prod.quantity === 'number' ? prod.quantity : parseFloat(prod.quantity) || 1), currencySymbol)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes if present */}
                {order.notes && (
                  <p className="text-xs text-[#6a6a6a] italic bg-amber-50/50 px-2.5 py-1.5 rounded border border-amber-200/50">
                    <strong>Note:</strong> {order.notes}
                  </p>
                )}

                {/* Card Footer: Payment Method, Total Amount, Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#e3e3e3]">
                  <div>
                    <span className="text-[11px] text-[#6a6a6a] block">
                      {order.paymentMethod}
                    </span>
                    {displayAmount > 0 && (
                      <span className="text-base font-semibold text-[#1a1a1a]">
                        {formatCurrency(displayAmount, currencySymbol)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditOrderForm(order)}
                      className="px-2.5 py-1.5 border border-[#e3e3e3] hover:bg-[#f6f6f6] text-xs font-medium text-[#1a1a1a] rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3 text-[#6a6a6a]" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-[#8d8d8d] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Supabase Connection & Sync Modal */}
      <SupabaseSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onConnected={() => {
          setHasSupabase(true);
          loadSupabaseData();
        }}
      />

    </div>
  );
};
