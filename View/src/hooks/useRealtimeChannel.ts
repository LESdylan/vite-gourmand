/**
 * useRealtimeChannel — React hook for subscribing to
 * realtime-agnostic CDC events on a table.
 *
 * @example
 * ```tsx
 * function OrderList() {
 *   const { events, connected } = useRealtimeChannel<Order>('orders');
 *
 *   // `events` accumulates all CDC events received since mount.
 *   // Use the callback form for more control:
 *   useRealtimeChannel('notifications', {
 *     adapter: 'postgresql',
 *     eventFilter: 'INSERT',
 *     onEvent: (e) => toast.info(e.record.title),
 *   });
 * }
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getRealtimeClient,
  type ConnectionState,
  type RealtimeAdapter,
  type RealtimeEvent,
  type RealtimeEventType,
  type RealtimeSubscription,
} from '../lib/realtime';
import { supabase } from '../lib/supabase';

// ── Options ────────────────────────────────────────────────────────

export interface UseRealtimeChannelOptions<T> {
  /** Database adapter (default: `"postgresql"`) */
  adapter?: RealtimeAdapter;
  /** Only receive specific event types (`"INSERT"`, `"UPDATE"`, `"DELETE"`, or `"*"`) */
  eventFilter?: RealtimeEventType;
  /** Per-event callback — runs in addition to populating `events` */
  onEvent?: (event: RealtimeEvent<T>) => void;
  /** Max events to keep in the `events` array (default: 100) */
  maxEvents?: number;
  /** Disable the subscription without removing the hook */
  enabled?: boolean;
}

// ── Return value ───────────────────────────────────────────────────

export interface UseRealtimeChannelResult<T> {
  /** Accumulated CDC events (newest last) */
  events: RealtimeEvent<T>[];
  /** WebSocket connection state */
  connected: ConnectionState;
  /** Clear the accumulated events array */
  clear: () => void;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useRealtimeChannel<T = Record<string, unknown>>(
  table: string,
  options: UseRealtimeChannelOptions<T> = {},
): UseRealtimeChannelResult<T> {
  const {
    adapter = 'postgresql',
    eventFilter,
    onEvent,
    maxEvents = 100,
    enabled = true,
  } = options;

  const [events, setEvents] = useState<RealtimeEvent<T>[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');

  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const clear = useCallback(() => setEvents([]), []);

  useEffect(() => {
    if (!enabled || !table) return;

    const client = getRealtimeClient();

    // Track connection state
    const unsubState = client.onStateChange(setConnectionState);
    setConnectionState(client.state);

    // Connect if not already connected — grab the session JWT
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      client.connect(session?.access_token);
    })();

    // Subscribe to the table
    const sub: RealtimeSubscription = client.subscribe<T>(
      table,
      adapter,
      (event) => {
        setEvents((prev) => {
          const next = [...prev, event];
          return next.length > maxEvents ? next.slice(-maxEvents) : next;
        });
        onEventRef.current?.(event);
      },
      eventFilter,
    );

    return () => {
      sub.unsubscribe();
      unsubState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, adapter, eventFilter, maxEvents, enabled]);

  return { events, connected: connectionState, clear };
}

export default useRealtimeChannel;
