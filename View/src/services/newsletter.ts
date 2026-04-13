/**
 * Newsletter Service
 * Talks to the newsletter-service NestJS microservice through Kong gateway
 * (route: /newsletter/v1/*)
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, supabase } from '../lib/supabase';

const BASE = `${SUPABASE_URL}/newsletter/v1`;

interface NewsletterResponse {
  message: string;
}

interface NewsletterStats {
  total: number;
  active: number;
  confirmed: number;
}

/** Internal helper — sends requests through Kong with apikey + optional JWT */
async function newsletterRequest<T>(
  path: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };

  // Attach JWT if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: options?.method ?? 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Newsletter API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Subscribe to the newsletter (public — no auth needed)
 */
export async function subscribeNewsletter(
  email: string,
  firstName?: string,
): Promise<NewsletterResponse> {
  return newsletterRequest<NewsletterResponse>('/subscribe', {
    method: 'POST',
    body: { email, firstName },
  });
}

/**
 * Confirm newsletter subscription via token
 */
export async function confirmNewsletter(token: string): Promise<NewsletterResponse> {
  return newsletterRequest<NewsletterResponse>(`/confirm/${token}`);
}

/**
 * Unsubscribe from the newsletter via token
 */
export async function unsubscribeNewsletter(token: string): Promise<NewsletterResponse> {
  return newsletterRequest<NewsletterResponse>(`/unsubscribe/${token}`);
}

/**
 * Get newsletter stats (admin only)
 */
export async function getNewsletterStats(): Promise<NewsletterStats> {
  return newsletterRequest<NewsletterStats>('/stats');
}
