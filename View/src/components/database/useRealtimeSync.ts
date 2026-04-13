/**
 * useRealtimeSync — Keeps an in-memory record list synchronised with
 * CDC events from the `realtime-agnostic` engine.
 *
 * Given a table name and the current primary-key column, this hook:
 *  1. Subscribes to `public.<table>` via the existing RealtimeClient.
 *  2. On INSERT → appends the new record.
 *  3. On UPDATE → patches the existing record in-place.
 *  4. On DELETE → removes the record.
 *
 * It also exposes state about the WebSocket connection so the UI can
 * display a "live" indicator.
 *
 * The hook is **generic** — it knows nothing about the application's
 * data model; table names and PK columns are resolved at runtime.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

import {
  getRealtimeClient,
  type ConnectionState,
  type RealtimeEvent,
  type RealtimeSubscription,
} from '../../lib/realtime';
import { supabase } from '../../lib/supabase';
import type { TableRecord } from './types';

// ── Options ────────────────────────────────────────────────────────

export interface UseRealtimeSyncOptions {
  /** Primary-key column name (default: `"id"`) */
  pkColumn?: string;
  /** Disable the subscription without removing the hook */
  enabled?: boolean;
}

// ── Return value ───────────────────────────────────────────────────

export interface UseRealtimeSyncResult {
  /** WebSocket connection state */
  connectionState: ConnectionState;
  /** Apply a realtime event to an existing records array (pure function) */
  applyEvent: (
    records: TableRecord[],
    event: RealtimeEvent<TableRecord>,
  ) => TableRecord[];
  /** Number of realtime events received since subscription started */
  eventCount: number;
  /** Last event timestamp (epoch ms) — useful for "live" indicators */
  lastEventAt: number | null;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useRealtimeSync(
  table: string | null,
  onEvent: (event: RealtimeEvent<TableRecord>) => void,
  options: UseRealtimeSyncOptions = {},
): UseRealtimeSyncResult {
  const { pkColumn = 'id', enabled = true } = options;

  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [eventCount, setEventCount] = useState(0);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);

  // Keep the callback ref fresh without re-subscribing
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const pkRef = useRef(pkColumn);
  pkRef.current = pkColumn;

  // Pure helper — apply a single CDC event to a records array
  const applyEvent = useCallback(
    (
      records: TableRecord[],
      event: RealtimeEvent<TableRecord>,
    ): TableRecord[] => {
      const pk = pkRef.current;

      switch (event.type) {
        case 'INSERT': {
          const rec = event.record;
          // Avoid duplicates (idempotency)
          if (records.some((r) => r[pk] === rec[pk])) return records;
          return [...records, rec];
        }
        case 'UPDATE': {
          const rec = event.record;
          const idx = records.findIndex((r) => r[pk] === rec[pk]);
          if (idx === -1) return records; // not in current page
          const next = [...records];
          next[idx] = { ...next[idx], ...rec };
          return next;
        }
        case 'DELETE': {
          const old = event.old_record ?? event.record;
          return records.filter((r) => r[pk] !== old[pk]);
        }
        default:
          return records;
      }
    },
    [],
  );

  // ── Subscribe / unsubscribe when table changes ─────────────────
  useEffect(() => {
    if (!enabled || !table) return;

    const client = getRealtimeClient();

    // Track connection state
    const unsubState = client.onStateChange(setConnectionState);
    setConnectionState(client.state);

    // Connect if not already — get JWT from current session
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      client.connect(session?.access_token);
    })();

    // Subscribe to `public.<table>`
    const sub: RealtimeSubscription = client.subscribe<TableRecord>(
      table, // RealtimeClient auto-prefixes with "public."
      'postgresql',
      (event) => {
        setEventCount((c) => c + 1);
        setLastEventAt(Date.now());
        onEventRef.current(event);
      },
    );

    // Reset counters on table switch
    setEventCount(0);
    setLastEventAt(null);

    return () => {
      sub.unsubscribe();
      unsubState();
    };
  }, [table, enabled]);

  return { connectionState, applyEvent, eventCount, lastEventAt };
}
