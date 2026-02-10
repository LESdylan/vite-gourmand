/**
 * NotificationContext — Global notification state for authenticated users.
 *
 * • Polls `/api/notifications` every 30 s while the user is logged-in.
 * • Exposes unread count, notification list, and actions (dismiss, mark read).
 * • Only activates when a valid auth token exists — no wasted calls for guests.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { isAuthenticated } from '../services/api';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from '../services/notifications';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface NotificationState {
  /** All recent notifications */
  notifications: Notification[];
  /** Number of unread notifications */
  unreadCount: number;
  /** Whether the notification panel is open */
  isOpen: boolean;
  /** IDs that the user dismissed locally (hidden from toast) */
  dismissedIds: Set<number>;
  /** Toggle the panel open/closed */
  toggle: () => void;
  /** Close the panel */
  close: () => void;
  /** Dismiss a single notification locally (hides it) */
  dismiss: (id: number) => void;
  /** Mark a single notification as read on the server */
  read: (id: number) => Promise<void>;
  /** Mark all as read */
  readAll: () => Promise<void>;
  /** Remove a notification permanently */
  remove: (id: number) => Promise<void>;
  /** Force-refresh from server */
  refresh: () => Promise<void>;
}

const defaultState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  dismissedIds: new Set(),
  toggle: () => {},
  close: () => {},
  dismiss: () => {},
  read: async () => {},
  readAll: async () => {},
  remove: async () => {},
  refresh: async () => {},
};

/* ------------------------------------------------------------------ */
/*  Context & hook                                                     */
/* ------------------------------------------------------------------ */

const NotificationCtx = createContext<NotificationState>(defaultState);

export function useNotifications(): NotificationState {
  return useContext(NotificationCtx);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

const POLL_INTERVAL = 30_000; // 30 seconds

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch from backend ──
  const refresh = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(30),
        getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {
      // Silently fail — user may have logged out
    }
  }, []);

  // ── Polling ──
  useEffect(() => {
    if (!isAuthenticated()) return;

    // Initial fetch
    refresh();

    intervalRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  // ── Actions ──
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  const dismiss = useCallback((id: number) => {
    setDismissedIds(prev => new Set(prev).add(id));
  }, []);

  const read = useCallback(async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }, []);

  const readAll = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      dismiss(id);
    } catch {
      // ignore
    }
  }, [dismiss]);

  return (
    <NotificationCtx.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        dismissedIds,
        toggle,
        close,
        dismiss,
        read,
        readAll,
        remove,
        refresh,
      }}
    >
      {children}
    </NotificationCtx.Provider>
  );
}
