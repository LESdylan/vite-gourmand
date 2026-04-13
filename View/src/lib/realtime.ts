/**
 * Realtime WebSocket Client for `realtime-agnostic` engine.
 *
 * The engine speaks a simple JSON protocol over WebSocket:
 *
 *   → { action: "subscribe",   channel: "public.posts", adapter: "postgresql" }
 *   → { action: "unsubscribe", channel: "public.posts" }
 *   ← { type: "INSERT", schema: "public", table: "posts", record: {...} }
 *   ← { type: "UPDATE", schema: "public", table: "posts", record: {...}, old_record: {...} }
 *   ← { type: "DELETE", schema: "public", table: "posts", old_record: {...} }
 *
 * Connection URL:  ws://<host>/realtime/v1/ws?apikey=<anon_key>&token=<jwt>
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

// ── Types ──────────────────────────────────────────────────────────

export type RealtimeAdapter = 'postgresql' | 'mongodb';

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimeEvent<T = Record<string, unknown>> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  record: T;
  old_record: T | null;
  timestamp: number;
}

export interface RealtimeSubscription {
  channel: string;
  adapter: RealtimeAdapter;
  unsubscribe: () => void;
}

type EventCallback<T = Record<string, unknown>> = (event: RealtimeEvent<T>) => void;

interface SubscriptionEntry {
  channel: string;
  adapter: RealtimeAdapter;
  callbacks: Map<string, EventCallback>;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

type StateCallback = (state: ConnectionState) => void;

// ── Client ─────────────────────────────────────────────────────────

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly subscriptions = new Map<string, SubscriptionEntry>();
  private readonly stateCallbacks = new Set<StateCallback>();
  private _state: ConnectionState = 'disconnected';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly baseReconnectDelay = 1000; // ms
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private disposed = false;

  constructor(url?: string) {
    // Build WS URL from the Supabase URL (Kong gateway)
    const base = url || SUPABASE_URL;
    const wsProtocol = base.startsWith('https') ? 'wss' : 'ws';
    const host = base.replace(/^https?:\/\//, '');
    this.url = `${wsProtocol}://${host}/realtime/v1/ws`;
  }

  /** Current connection state */
  get state(): ConnectionState {
    return this._state;
  }

  /** Register a state change listener */
  onStateChange(cb: StateCallback): () => void {
    this.stateCallbacks.add(cb);
    return () => this.stateCallbacks.delete(cb);
  }

  private setState(s: ConnectionState) {
    this._state = s;
    this.stateCallbacks.forEach((cb) => cb(s));
  }

  /** Open the WebSocket connection */
  connect(accessToken?: string): void {
    if (this.disposed) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.setState('connecting');

    const params = new URLSearchParams({ apikey: SUPABASE_ANON_KEY });
    if (accessToken) params.set('token', accessToken);

    const wsUrl = `${this.url}?${params}`;

    try {
      this.ws = new WebSocket(wsUrl);
    } catch {
      this.setState('disconnected');
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.setState('connected');
      // Re-subscribe to all active channels
      this.subscriptions.forEach((entry) => {
        this.sendSubscribe(entry.channel, entry.adapter);
      });
      this.startHeartbeat();
    };

    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string);
        this.handleMessage(data);
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      if (!this.disposed) {
        this.setState('disconnected');
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  /** Cleanly close the connection and release resources */
  disconnect(): void {
    this.disposed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.setState('disconnected');
  }

  /**
   * Subscribe to a table channel.
   *
   * @param table  Table name (e.g. "posts" or "public.posts")
   * @param adapter  Database adapter ("postgresql" or "mongodb")
   * @param callback  Called for each realtime event
   * @param eventFilter  Optional: only receive specific event types
   * @returns A subscription handle with an `unsubscribe()` method
   */
  subscribe<T = Record<string, unknown>>(
    table: string,
    adapter: RealtimeAdapter,
    callback: EventCallback<T>,
    eventFilter?: RealtimeEventType,
  ): RealtimeSubscription {
    const channel = table.includes('.') ? table : `public.${table}`;
    const callbackId = crypto.randomUUID();

    // Wrap with optional filter
    const wrappedCb: EventCallback = (event) => {
      if (!eventFilter || eventFilter === '*' || event.type === eventFilter) {
        callback(event as RealtimeEvent<T>);
      }
    };

    let entry = this.subscriptions.get(channel);
    if (!entry) {
      entry = { channel, adapter, callbacks: new Map() };
      this.subscriptions.set(channel, entry);
      // Send subscribe message if connected
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendSubscribe(channel, adapter);
      }
    }
    entry.callbacks.set(callbackId, wrappedCb);

    return {
      channel,
      adapter,
      unsubscribe: () => {
        entry.callbacks.delete(callbackId);
        if (entry.callbacks.size === 0) {
          this.subscriptions.delete(channel);
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.sendUnsubscribe(channel);
          }
        }
      },
    };
  }

  // ── Private ──────────────────────────────────────────────────────

  private sendSubscribe(channel: string, adapter: RealtimeAdapter): void {
    this.send({ action: 'subscribe', channel, adapter });
  }

  private sendUnsubscribe(channel: string): void {
    this.send({ action: 'unsubscribe', channel });
  }

  private send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(data: Record<string, unknown>): void {
    // CDC events have { type, schema, table, record, ... }
    if (typeof data.type === 'string' && typeof data.table === 'string') {
      const schema = typeof data.schema === 'string' ? data.schema : 'public';
      const channel = `${schema}.${data.table}`;
      const entry = this.subscriptions.get(channel);
      if (entry) {
        entry.callbacks.forEach((cb) => cb(data as unknown as RealtimeEvent));
      }
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ action: 'heartbeat' });
    }, 30_000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.setState('reconnecting');
    const delay = Math.min(
      this.baseReconnectDelay * 2 ** this.reconnectAttempts,
      30_000,
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

// ── Singleton ──────────────────────────────────────────────────────

let _instance: RealtimeClient | null = null;

/** Get (or create) the shared RealtimeClient singleton */
export function getRealtimeClient(): RealtimeClient {
  if (!_instance) {
    _instance = new RealtimeClient();
  }
  return _instance;
}
