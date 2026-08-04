import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Normalize URL in case user inputs https://xxxx.supabase.co/rest/v1/
const cleanUrl = (rawUrl: string) => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/$/, '');
  return url;
};

const envUrl = cleanUrl(import.meta.env.VITE_SUPABASE_URL || '');
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Get stored credentials if available
export const getStoredCredentials = () => {
  const localUrl = cleanUrl(localStorage.getItem('supabase_url') || '');
  const localKey = (localStorage.getItem('supabase_anon_key') || '').trim();

  const url = envUrl || localUrl;
  const anonKey = envAnonKey || localKey;

  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

export const isSupabaseConfigured = Boolean(
  (envUrl || localStorage.getItem('supabase_url')) &&
  (envAnonKey || localStorage.getItem('supabase_anon_key'))
);

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getStoredCredentials();
  if (!isConfigured) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(url, anonKey);
  }
  return clientInstance;
};

export const resetSupabaseClient = (url: string, anonKey: string) => {
  const normalizedUrl = cleanUrl(url);
  localStorage.setItem('supabase_url', normalizedUrl);
  localStorage.setItem('supabase_anon_key', anonKey.trim());
  clientInstance = createClient(normalizedUrl, anonKey.trim());
  return clientInstance;
};
