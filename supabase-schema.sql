-- Supabase schema for Bakeaway bakery pre-orders and batches.
-- This creates the tables only. Keep Row Level Security enabled and add
-- narrowly scoped policies before using the database from a public frontend.

CREATE TABLE IF NOT EXISTS public.batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  baking_date DATE NOT NULL,
  notes TEXT,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  batch_id TEXT REFERENCES public.batches(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  source TEXT CHECK (source IN ('whatsapp', 'instagram', 'other')),
  contact_detail TEXT,
  delivery_address TEXT,
  payment_method TEXT DEFAULT 'Transfer',
  payment_status TEXT CHECK (payment_status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  notes TEXT,
  products JSONB DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
