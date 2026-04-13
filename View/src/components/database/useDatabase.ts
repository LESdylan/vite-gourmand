/**
 * useDatabase - State management hook for database viewer
 * Handles table loading, record fetching, search, pagination,
 * and realtime synchronisation via the realtime-agnostic engine.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { DatabaseService } from './DatabaseService';
import { useRealtimeSync } from './useRealtimeSync';
import type { FilterConfig, DatabaseState, TableRecord } from './types';
import type { RealtimeEvent } from '../../lib/realtime';

const DEFAULT_PAGE_SIZE = 20;

export function useDatabase() {
  const [state, setState] = useState<DatabaseState>({
    tables: [],
    activeTable: null,
    records: [],
    filters: [],
    pagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
    loading: false,
    error: null,
  });

  // Separate search state to avoid filter conflicts
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoading = (loading: boolean) => setState((s) => ({ ...s, loading }));

  const loadTables = useCallback(async () => {
    setLoading(true);
    setState((s) => ({ ...s, error: null }));
    try {
      const tables = await DatabaseService.getTables();
      setState((s) => ({ ...s, tables, loading: false }));
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to load tables';
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, []);

  // Auto-load tables on mount
  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // Load records with search term
  const loadRecords = useCallback(
    async (
      table: string,
      search: string,
      pagination: { page: number; pageSize: number; total: number },
    ) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      try {
        // Build filters array with search
        const filters: FilterConfig[] = search.trim()
          ? [{ column: '_search', operator: 'contains', value: search.trim() }]
          : [];

        const { data, total } = await DatabaseService.getRecords(table, filters, pagination);
        setState((s) => ({
          ...s,
          records: data,
          pagination: { ...s.pagination, total },
          filters,
          loading: false,
        }));
      } catch (e) {
        // Ignore abort errors
        if (e instanceof Error && e.name === 'AbortError') return;
        setLoading(false);
      }
    },
    [],
  );

  const selectTable = useCallback(
    async (table: string) => {
      // Clear search when switching tables
      setSearchTerm('');
      const newPagination = { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 };
      setState((s) => ({
        ...s,
        activeTable: table,
        pagination: newPagination,
        filters: [],
        records: [],
      }));
      await loadRecords(table, '', newPagination);
    },
    [loadRecords],
  );

  // Debounced search handler
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce the actual search
      searchTimeoutRef.current = setTimeout(() => {
        if (state.activeTable) {
          loadRecords(state.activeTable, term, { ...state.pagination, page: 1 });
        }
      }, 400);
    },
    [state.activeTable, state.pagination, loadRecords],
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (state.activeTable) {
      loadRecords(state.activeTable, '', { ...state.pagination, page: 1 });
    }
  }, [state.activeTable, state.pagination, loadRecords]);

  const setPage = useCallback(
    (page: number) => {
      if (!state.activeTable) return;
      const newPagination = { ...state.pagination, page };
      setState((s) => ({ ...s, pagination: newPagination }));
      loadRecords(state.activeTable, searchTerm, newPagination);
    },
    [state.activeTable, state.pagination, searchTerm, loadRecords],
  );

  // Refresh current table data
  const refresh = useCallback(() => {
    if (state.activeTable) {
      loadRecords(state.activeTable, searchTerm, state.pagination);
    }
  }, [state.activeTable, searchTerm, state.pagination, loadRecords]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // ── Realtime sync ──────────────────────────────────────────────
  // Resolve the PK column for the active table from loaded metadata
  const activePk =
    state.tables
      .find((t) => t.name === state.activeTable)
      ?.columns.find((c) => c.isPrimary)?.name ?? 'id';

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent<TableRecord>) => {
      const pk = activePk;

      setState((prev) => {
        // 1. Apply the event to the current records array
        let nextRecords = prev.records;
        switch (event.type) {
          case 'INSERT': {
            const rec = event.record;
            if (!nextRecords.some((r) => r[pk] === rec[pk])) {
              nextRecords = [...nextRecords, rec];
            }
            break;
          }
          case 'UPDATE': {
            const rec = event.record;
            const idx = nextRecords.findIndex((r) => r[pk] === rec[pk]);
            if (idx !== -1) {
              nextRecords = [...nextRecords];
              nextRecords[idx] = { ...nextRecords[idx], ...rec };
            }
            break;
          }
          case 'DELETE': {
            const old = event.old_record ?? event.record;
            nextRecords = nextRecords.filter((r) => r[pk] !== old[pk]);
            break;
          }
        }

        // 2. Update the row count for this table in the sidebar
        let delta = 0;
        if (event.type === 'INSERT') delta = 1;
        else if (event.type === 'DELETE') delta = -1;

        const nextTables =
          delta === 0
            ? prev.tables
            : prev.tables.map((t) =>
                t.name === event.table
                  ? { ...t, rowCount: Math.max(0, t.rowCount + delta) }
                  : t,
              );

        // 3. Adjust total count for pagination
        const nextTotal =
          delta === 0
            ? prev.pagination.total
            : Math.max(0, prev.pagination.total + delta);

        return {
          ...prev,
          records: nextRecords,
          tables: nextTables,
          pagination: { ...prev.pagination, total: nextTotal },
        };
      });
    },
    [activePk],
  );

  const { connectionState: realtimeState, eventCount: realtimeEventCount } =
    useRealtimeSync(state.activeTable, handleRealtimeEvent, {
      pkColumn: activePk,
    });

  return {
    ...state,
    searchTerm,
    realtimeState,
    realtimeEventCount,
    loadTables,
    selectTable,
    setPage,
    handleSearch,
    clearSearch,
    refresh,
  };
}
