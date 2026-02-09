/**
 * useMenus Hook
 * React hook for fetching and managing menu data from the API
 */

import { useState, useEffect, useCallback } from 'react';
import * as menuService from './menus';
import type { Menu, MenuFilters, PaginationMeta, Theme, Diet } from './menus';

export interface UseMenusState {
  menus: Menu[];
  meta: PaginationMeta | null;
  themes: Theme[];
  diets: Diet[];
  isLoading: boolean;
  error: string | null;
}

export interface UseMenusActions {
  fetchMenus: (filters?: MenuFilters) => Promise<void>;
  fetchThemes: () => Promise<void>;
  fetchDiets: () => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseMenusResult extends UseMenusState, UseMenusActions {}

export function useMenus(initialFilters: MenuFilters = {}): UseMenusResult {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MenuFilters>(initialFilters);

  const fetchMenus = useCallback(async (newFilters?: MenuFilters) => {
    setIsLoading(true);
    setError(null);
    
    const activeFilters = newFilters || filters;
    if (newFilters) setFilters(newFilters);
    
    try {
      const result = await menuService.getMenus(activeFilters);
      setMenus(result.menus);
      setMeta(result.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch menus');
      console.error('Error fetching menus:', e);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchThemes = useCallback(async () => {
    try {
      const result = await menuService.getThemes();
      setThemes(result);
    } catch (e) {
      console.error('Error fetching themes:', e);
    }
  }, []);

  const fetchDiets = useCallback(async () => {
    try {
      const result = await menuService.getDiets();
      setDiets(result);
    } catch (e) {
      console.error('Error fetching diets:', e);
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([fetchMenus(), fetchThemes(), fetchDiets()]);
  }, [fetchMenus, fetchThemes, fetchDiets]);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, []);

  return {
    menus,
    meta,
    themes,
    diets,
    isLoading,
    error,
    fetchMenus,
    fetchThemes,
    fetchDiets,
    refetch,
  };
}

// Re-export types for convenience
export type { Menu, MenuFilters, PaginationMeta, Theme, Diet } from './menus';
