/**
 * Notification Service
 * CRUD operations against the notifications table via PostgREST / Supabase client.
 * Includes realtime subscription for live notification delivery.
 */

import { supabase } from '../lib/supabase';
import { getRealtimeClient, type RealtimeEvent, type RealtimeSubscription } from '../lib/realtime';

// ── Types matching database schema ──

export interface Notification {
  id: string;
  user_id: string;
  type: string; // 'order_update' | 'review' | 'system' | 'promo'
  title: string | null;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

// ── API calls ──

/** Fetch current user's notifications (most recent first) */
export async function getNotifications(limit = 20, unreadOnly = false): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let q = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) q = q.eq('is_read', false);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data as Notification[];
}

/** Get unread notification count */
export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Mark a single notification as read */
export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/** Mark all notifications as read */
export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw new Error(error.message);
}

/** Delete a single notification */
export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ── Realtime subscription ──

/**
 * Subscribe to live notification events via the realtime-agnostic WebSocket.
 * Calls `onNew` whenever a new notification is INSERTed for the current user.
 *
 * @returns An unsubscribe function to tear down the subscription.
 *
 * @example
 * ```ts
 * const unsub = subscribeToNotifications((notif) => {
 *   toast.info(notif.title ?? 'Nouvelle notification');
 * });
 * // later:
 * unsub();
 * ```
 */
export function subscribeToNotifications(
  onNew: (notification: Notification) => void,
): () => void {
  const client = getRealtimeClient();

  // Ensure WebSocket is connected
  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    client.connect(session?.access_token);
  })();

  const sub: RealtimeSubscription = client.subscribe<Notification>(
    'notifications',
    'postgresql',
    (event: RealtimeEvent<Notification>) => {
      // Only forward INSERTs (new notifications)
      if (event.type === 'INSERT' && event.record) {
        onNew(event.record);
      }
    },
    'INSERT',
  );

  return () => sub.unsubscribe();
}
