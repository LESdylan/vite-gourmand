/**
 * Public Data Service
 * Fetches public-facing information via PostgREST / Supabase client:
 *   – approved reviews
 *   – review statistics (avg, count, satisfaction %)
 *   – working hours
 *   – site info (owners, experience, events, contact)
 *   – active promotions
 */

import { supabase } from '../lib/supabase';

// ── Types ──

export interface PublicReview {
  id: string;
  user_id: string;
  note: number;
  description: string;
  created_at: string;
  profiles?: { first_name: string | null };
}

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
  satisfactionPercent: number;
}

export interface WorkingHour {
  id: string;
  day: string;
  opening: string;
  closing: string;
}

export interface SiteOwner {
  firstName: string;
  lastName: string | null;
  role?: string;
  isPrimary?: boolean;
}

export interface SiteCompany {
  name: string;
  slogan: string | null;
  description: string | null;
}

export interface SiteInfo {
  company?: SiteCompany;
  owners: SiteOwner[];
  yearsOfExperience: number;
  establishedYear: number;
  eventCount: number;
  phone: string;
  email: string;
  address: string;
  city?: string;
  website?: string | null;
}

// ── API calls ──

/** Fetch approved reviews (public, paginated) */
export async function fetchApprovedReviews(page = 1, limit = 20): Promise<PublicReview[]> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(first_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return data as PublicReview[];
}

/** Fetch aggregate review stats (computed client-side from approved reviews) */
export async function fetchReviewStats(): Promise<ReviewStats> {
  const { data, error, count } = await supabase
    .from('reviews')
    .select('note', { count: 'exact' })
    .eq('status', 'approved');

  if (error) throw new Error(error.message);

  const notes = (data ?? []).map((r: { note: number }) => r.note);
  const reviewCount = count ?? notes.length;
  const averageRating = reviewCount > 0 ? notes.reduce((a, b) => a + b, 0) / reviewCount : 0;
  const satisfactionPercent =
    reviewCount > 0 ? Math.round((notes.filter((n) => n >= 4).length / reviewCount) * 100) : 0;

  return { averageRating: Math.round(averageRating * 10) / 10, reviewCount, satisfactionPercent };
}

/** Fetch working hours */
export async function fetchWorkingHours(): Promise<WorkingHour[]> {
  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .order('id');

  if (error) throw new Error(error.message);
  return data as WorkingHour[];
}

/** Fetch site info (owners, stats, contact) — aggregated from multiple tables */
export async function fetchSiteInfo(): Promise<SiteInfo> {
  // Fetch company, owners, and events in parallel
  const [companyRes, ownersRes, eventsRes] = await Promise.all([
    supabase.from('companies').select('*').limit(1).single(),
    supabase
      .from('company_owners')
      .select('*, profiles(first_name, last_name)')
      .order('is_primary', { ascending: false }),
    supabase.from('events').select('id', { count: 'exact' }),
  ]);

  const company = companyRes.data;
  const owners = (ownersRes.data ?? []).map(
    (o: { is_primary: boolean; profiles: { first_name: string; last_name: string | null } | null; role: string | null }) => ({
      firstName: o.profiles?.first_name ?? '',
      lastName: o.profiles?.last_name ?? null,
      role: o.role ?? undefined,
      isPrimary: o.is_primary,
    }),
  );

  const establishedYear = company?.established_year ?? new Date().getFullYear();
  const yearsOfExperience = new Date().getFullYear() - establishedYear;

  return {
    company: company
      ? { name: company.name, slogan: company.slogan, description: company.description }
      : undefined,
    owners,
    yearsOfExperience,
    establishedYear,
    eventCount: eventsRes.count ?? 0,
    phone: company?.phone ?? '',
    email: company?.email ?? '',
    address: company?.address ?? '',
    city: company?.city ?? undefined,
    website: company?.website ?? null,
  };
}

// ── Promotions ──

export interface PromotionDiscount {
  code: string;
  type: string;
  value: number;
}

export interface ActivePromotion {
  id: string;
  title: string;
  description: string | null;
  short_text: string | null;
  type: string;
  image_url: string | null;
  link_url: string | null;
  link_label: string | null;
  badge_text: string | null;
  bg_color: string;
  text_color: string;
  priority: number;
  start_date: string;
  end_date: string | null;
  discounts: PromotionDiscount | null;
}

/** Fetch currently active public promotions (banners, offers, etc.) */
export async function fetchActivePromotions(): Promise<ActivePromotion[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('promotions')
    .select('*, discounts(*)')
    .eq('is_active', true)
    .lte('start_date', now)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('priority', { ascending: false });

  if (error) throw new Error(error.message);
  return data as ActivePromotion[];
}
