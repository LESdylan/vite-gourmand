/**
 * API Base Service
 * Re-exports the Supabase client plus a backward-compatible apiRequest()
 * for components that still call custom /api/* endpoints (AI, loyalty, etc.).
 * Auth tokens are managed automatically by supabase-js.
 */

import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

export { supabase };

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Synchronous auth check (reads supabase session from localStorage) */
export function isAuthenticated(): boolean {
  const keys = Object.keys(localStorage);
  return keys.some((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
}

/** Async auth check (verifies session with Supabase) */
export async function isAuthenticatedAsync(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/**
 * Generic fetch wrapper for endpoints that go through Kong gateway.
 * Adds apikey + JWT headers automatically.
 * Routes /api/* calls through the Vite dev proxy.
 */
export async function apiRequest<T>(
  url: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };

  // Attach JWT token if available
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Build absolute URL for Kong routes, keep relative for /api/* (Vite proxy)
  const fullUrl = url.startsWith('/api') ? url : `${SUPABASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    method: options?.method ?? 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }

  return res.json() as Promise<T>;
}
