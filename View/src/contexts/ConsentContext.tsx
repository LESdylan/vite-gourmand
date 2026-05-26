/**
 * Consent Context — single source of truth for the user's cookie choices.
 *
 * Why localStorage and not just a cookie:
 *   - Synchronous read on every render (`useConsent()` returns the current
 *     state without a Promise), so analytics/marketing scripts can be gated
 *     before they're injected into the DOM.
 *   - The choice is also mirrored to a 13-month cookie so server-rendered
 *     responses or future SSR can read it.
 *
 * CNIL re-prompt rule: choices expire after 13 months (`MAX_AGE_DAYS`).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  recordConsentOnServer,
  type ConsentAction,
  type ConsentChoice,
} from '../services/consent';

const STORAGE_KEY = 'vg.consent.v1';
const ANON_ID_KEY = 'vg.consent.anonId';
const MAX_AGE_DAYS = 395; // 13 months — CNIL recommendation
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

interface StoredConsent {
  choice: ConsentChoice;
  decidedAt: number; // epoch ms
  version: 1;
}

interface ConsentContextValue {
  /** Current choice (null while the user hasn't decided yet) */
  choice: ConsentChoice | null;
  /** True when the bottom banner should be visible */
  shouldPrompt: boolean;
  /** True when the customize modal is open */
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveCustom: (choice: Omit<ConsentChoice, 'necessary'>) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

const ALL_REJECTED: ConsentChoice = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const ALL_ACCEPTED: ConsentChoice = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: true,
};

function readStorage(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== 1) return null;
    if (Date.now() - parsed.decidedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(choice: ConsentChoice): void {
  try {
    const payload: StoredConsent = { choice, decidedAt: Date.now(), version: 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Mirror to a cookie so SSR/edge handlers could read it
    const expires = new Date(Date.now() + MAX_AGE_MS).toUTCString();
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(choice))}; expires=${expires}; path=/; SameSite=Lax${secure}`;
  } catch {
    // localStorage might be disabled — banner will keep prompting
  }
}

function getOrCreateAnonId(): string {
  try {
    const existing = localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
    return id;
  } catch {
    return 'fallback-' + Math.random().toString(36).slice(2);
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [isPreferencesOpen, setPreferencesOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStorage();
    if (stored) setChoice(stored.choice);
    setHydrated(true);
  }, []);

  const commit = useCallback((next: ConsentChoice, action: ConsentAction) => {
    writeStorage(next);
    setChoice(next);
    setPreferencesOpen(false);
    void recordConsentOnServer(action, next, getOrCreateAnonId());
  }, []);

  const acceptAll = useCallback(() => commit(ALL_ACCEPTED, 'accept_all'), [commit]);
  const rejectAll = useCallback(() => commit(ALL_REJECTED, 'reject_all'), [commit]);

  const saveCustom = useCallback(
    (partial: Omit<ConsentChoice, 'necessary'>) => {
      commit({ necessary: true, ...partial }, 'custom');
    },
    [commit],
  );

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      choice,
      shouldPrompt: hydrated && choice === null,
      isPreferencesOpen,
      acceptAll,
      rejectAll,
      saveCustom,
      openPreferences,
      closePreferences,
    }),
    [choice, hydrated, isPreferencesOpen, acceptAll, rejectAll, saveCustom, openPreferences, closePreferences],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
