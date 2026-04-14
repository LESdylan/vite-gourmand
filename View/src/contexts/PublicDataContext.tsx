/**
 * PublicDataContext — Centralised data fetching for public pages.
 *
 * All shared read-only data (site info, working hours, reviews, stats) is
 * fetched **once** when PublicSPA mounts and exposed via context so that
 * Footer, Home, Contact … receive it via `usePublicData()` instead of each
 * component firing its own API calls on every page navigation.
 */

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  fetchSiteInfo,
  fetchWorkingHours,
  fetchApprovedReviews,
  fetchReviewStats,
  type SiteInfo,
  type WorkingHour,
  type PublicReview,
  type ReviewStats,
} from '../services/public';
import { getRealtimeClient, type RealtimeSubscription } from '../lib/realtime';
import { supabase } from '../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PublicData {
  siteInfo: SiteInfo | null;
  workingHours: WorkingHour[];
  reviews: PublicReview[];
  reviewStats: ReviewStats | null;
  loading: boolean;
}

const defaultValue: PublicData = {
  siteInfo: null,
  workingHours: [],
  reviews: [],
  reviewStats: null,
  loading: true,
};

/* ------------------------------------------------------------------ */
/*  Context & hook                                                     */
/* ------------------------------------------------------------------ */

const PublicDataCtx = createContext<PublicData>(defaultValue);

// eslint-disable-next-line react-refresh/only-export-components
export function usePublicData(): PublicData {
  return useContext(PublicDataCtx);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

const DAY_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PublicData>(defaultValue);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Use allSettled so one failure doesn't kill all data
        const [infoResult, hoursResult, reviewsResult, statsResult] = await Promise.allSettled([
          fetchSiteInfo(),
          fetchWorkingHours(),
          fetchApprovedReviews(1, 20),
          fetchReviewStats(),
        ]);

        if (cancelled) return;

        const info = infoResult.status === 'fulfilled' ? infoResult.value : null;
        const hours = hoursResult.status === 'fulfilled' ? hoursResult.value : [];
        const rawReviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : [];
        const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;

        // Log any rejected promises for debugging
        [infoResult, hoursResult, reviewsResult, statsResult].forEach((r, i) => {
          if (r.status === 'rejected') {
            const labels = ['siteInfo', 'workingHours', 'reviews', 'reviewStats'];
            console.warn(`[PublicDataProvider] ${labels[i]} failed:`, r.reason);
          }
        });

        // Sort hours by weekday
        hours.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

        setData({
          siteInfo: info,
          workingHours: hours,
          reviews: rawReviews,
          reviewStats: stats,
          loading: false,
        });
      } catch (err) {
        console.error('[PublicDataProvider] Failed to fetch public data:', err);
        if (!cancelled) {
          setData((prev) => ({ ...prev, loading: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // fetch once on mount

  /* ── Realtime subscriptions — re-fetch when DB changes ────────── */

  const refetchHours = useCallback(async () => {
    try {
      const hours = await fetchWorkingHours();
      hours.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
      setData((prev) => ({ ...prev, workingHours: hours }));
    } catch (err) {
      console.warn('[PublicDataContext] Refetch workingHours failed:', err);
    }
  }, []);

  const refetchReviews = useCallback(async () => {
    try {
      const [rawReviews, stats] = await Promise.all([
        fetchApprovedReviews(1, 20),
        fetchReviewStats(),
      ]);
      setData((prev) => ({ ...prev, reviews: rawReviews, reviewStats: stats }));
    } catch (err) {
      console.warn('[PublicDataContext] Refetch reviews failed:', err);
    }
  }, []);

  const refetchSiteInfo = useCallback(async () => {
    try {
      const info = await fetchSiteInfo();
      setData((prev) => ({ ...prev, siteInfo: info }));
    } catch (err) {
      console.warn('[PublicDataContext] Refetch siteInfo failed:', err);
    }
  }, []);

  // Debounced refetch scheduler — coalesces rapid-fire CDC events
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const scheduleRefetch = useCallback((key: string, fn: () => Promise<void>) => {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      fn();
      delete timers.current[key];
    }, 300);
  }, []);

  useEffect(() => {
    const client = getRealtimeClient();

    // Connect with current session token (or anon key for public visitors)
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      client.connect(session?.access_token);
    })();

    // Subscribe to every table that feeds the public context
    const subs: RealtimeSubscription[] = [
      client.subscribe('working_hours', 'postgresql', () => {
        scheduleRefetch('hours', refetchHours);
      }),
      client.subscribe('reviews', 'postgresql', () => {
        scheduleRefetch('reviews', refetchReviews);
      }),
      client.subscribe('companies', 'postgresql', () => {
        scheduleRefetch('siteInfo', refetchSiteInfo);
      }),
      client.subscribe('company_owners', 'postgresql', () => {
        scheduleRefetch('siteInfo', refetchSiteInfo);
      }),
    ];

    return () => {
      subs.forEach((s) => s.unsubscribe());
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, [scheduleRefetch, refetchHours, refetchReviews, refetchSiteInfo]);

  return <PublicDataCtx.Provider value={data}>{children}</PublicDataCtx.Provider>;
}
