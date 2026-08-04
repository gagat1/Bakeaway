import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, X, Key, Link as LinkIcon, RefreshCw, Terminal } from 'lucide-react';
import { getStoredCredentials, resetSupabaseClient } from '../lib/supabase';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const currentCreds = getStoredCredentials();
  const [url, setUrl] = useState(currentCreds.url || '');
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMessage({ type: 'error', text: 'Mohon isi Supabase Project URL dan anon API Key.' });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      const client = resetSupabaseClient(url, anonKey);
      // Quick test query
      const { error } = await client.from('batches').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, but connection key is valid
        if (error.message.includes('relation "public.batches" does not exist') || error.code === '42P01') {
          setStatusMessage({
            type: 'success',
            text: 'Koneksi ke Supabase berhasil! Jangan lupa jalankan SQL Schema di bawah di Supabase SQL Editor.',
          });
          onConnected();
        } else {
          setStatusMessage({ type: 'error', text: `Gagal terhubung: ${error.message}` });
        }
      } else {
        setStatusMessage({ type: 'success', text: 'Berhasil terhubung ke Supabase Database!' });
        onConnected();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Error: ${err.message || 'Gagal menyambung ke Supabase'}` });
    } finally {
      setIsTesting(false);
    }
  };

  const sqlScript = `-- 1. Table untuk Batch Pre-Order
CREATE TABLE IF NOT EXISTS public.batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  baking_date DATE NOT NULL,
  notes TEXT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 2. Table untuk Pesanan / Orders
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
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 3. Row Level Security Policy (Akses Publik / Anonim)
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Batches Public All" ON public.batches FOR ALL USING (true);
CREATE POLICY "Orders Public All" ON public.orders FOR ALL USING (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
      <div className="bg-white border-2 border-[#1a1a1a] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#e3e3e3] pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-[#547e69]/10 border border-[#547e69]/30 rounded-lg text-[#547e69]">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-serif font-medium text-[#1a1a1a]">
                Koneksi Database Supabase
              </h3>
              <p className="text-xs text-[#6a6a6a]">
                Hubungkan aplikasi Toko Roti & Pre-Order Anda ke Supabase Cloud.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6a6a6a] hover:text-[#1a1a1a] rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Step 1: Input Credentials */}
        <form onSubmit={handleSaveAndConnect} className="space-y-4">
          <div className="bg-[#f6f6f6] p-4 rounded-xl border border-[#e3e3e3] space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] flex items-center space-x-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#547e69]" />
              <span>Langkah 1: Masukkan Supabase Credentials</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-ref.supabase.co"
                className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-xs font-mono text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1 flex items-center justify-between">
                <span>Supabase Anon API Key</span>
                <span className="text-[10px] text-[#6a6a6a]">
                  (Dapatkan di Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public)
                </span>
              </label>
              <div className="relative flex items-center">
                <Key className="w-3.5 h-3.5 text-[#8d8d8d] absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-xs font-mono text-[#1a1a1a] focus:outline-none focus:border-[#547e69]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isTesting}
              className="w-full py-2 bg-[#547e69] text-white hover:bg-[#436755] rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyambungkan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan &amp; Uji Koneksi</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Step 2: SQL Schema Generator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#547e69]" />
              <span>Langkah 2: Jalankan Tabel Schema di SQL Editor Supabase</span>
            </h4>
            <button
              type="button"
              onClick={copySql}
              className="inline-flex items-center space-x-1 text-xs text-[#547e69] hover:underline cursor-pointer font-medium"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin SQL</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="p-3 bg-[#1a1a1a] text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-44 leading-relaxed">
              {sqlScript}
            </pre>
          </div>
          <p className="text-[11px] text-[#6a6a6a]">
            Buka Dashboard Supabase Anda &gt; <strong>SQL Editor</strong> &gt; <strong>New Query</strong> &gt; Tempel kode SQL di atas dan klik <strong>Run</strong>.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end pt-3 border-t border-[#e3e3e3]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-xs font-medium hover:bg-[#333333] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
