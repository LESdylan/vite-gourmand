/**
 * PublicDataContext — Centralised data fetching for public pages.
 *
 * All shared read-only data (site info, working hours, reviews, stats) is
 * fetched **once** when PublicSPA mounts and exposed via context so that
 * Footer, Home, Contact … receive it via `usePublicData()` instead of each
 * component firing its own API calls on every page navigation.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
        const [info, hours, rawReviews, stats] = await Promise.all([
          fetchSiteInfo(),
          fetchWorkingHours(),
          fetchApprovedReviews(1, 20),
          fetchReviewStats(),
        ]);

        if (cancelled) return;

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

  return <PublicDataCtx.Provider value={data}>{children}</PublicDataCtx.Provider>;
}
