/**
 * Supabase Client — single instance shared across the app.
 *
 * In dev  → points directly at Kong (http://localhost:8000)
 * In prod → points at the origin (nginx proxies to Kong)
 *
 * The anon key is the Kong `apikey` consumer credential
 * used to pass key-auth on every Kong route.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || window.location.origin;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
    },
  },
);

export { SUPABASE_URL, SUPABASE_ANON_KEY };
