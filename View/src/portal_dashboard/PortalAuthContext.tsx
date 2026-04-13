/**
 * Portal Auth Context
 * Provides authentication state across the dashboard.
 * Listens to supabase.auth.onAuthStateChange for reactive session management.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import * as authService from '../services/auth';
import { fetchAppRole } from '../services/auth';
import type { RegisterData } from '../services/auth';
import { getRememberMe, saveRememberMe, clearRememberMe } from './rememberMe';
import type { PortalAuthState, UserRole } from './types';

interface PortalAuthContextValue extends PortalAuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  rememberMeData: { email: string; name: string } | null;
}

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortalAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const [rememberMeData, setRememberMeData] = useState<{ email: string; name: string } | null>(
    null,
  );

  // Subscribe to auth state changes from supabase
  useEffect(() => {
    const remembered = getRememberMe();
    if (remembered) setRememberMeData({ email: remembered.email, name: remembered.name });

    // Get the initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata ?? {};
        const role = mapRole(await fetchAppRole(session.user.id));
        setState({
          user: {
            id: session.user.id,
            email: session.user.email ?? '',
            name: meta.first_name ?? meta.name ?? session.user.email?.split('@')[0] ?? '',
            role,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    });

    // Listen for future changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata ?? {};
        const role = mapRole(await fetchAppRole(session.user.id));
        setState({
          user: {
            id: session.user.id,
            email: session.user.email ?? '',
            name: meta.first_name ?? meta.name ?? session.user.email?.split('@')[0] ?? '',
            role,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string, remember = false) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { user } = await authService.login({ email, password });
      const role = mapRole(user.role);

      if (remember) saveRememberMe({ email: user.email, name: user.name });
      setState({ user: { ...user, role }, isAuthenticated: true, isLoading: false, error: null });
    } catch (e) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: e instanceof Error ? e.message : 'Login failed',
      }));
      throw e;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      await authService.googleLogin();
      // Auth state change listener will handle state update after redirect
      setState((s) => ({ ...s, isLoading: false }));
    } catch (e) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: e instanceof Error ? e.message : 'Google login failed',
      }));
      throw e;
    }
  }, []);

  const registerUser = useCallback(async (data: RegisterData) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { user } = await authService.register(data);
      const role = mapRole(user.role);
      setState({ user: { ...user, role }, isAuthenticated: true, isLoading: false, error: null });
    } catch (e) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: e instanceof Error ? e.message : "Échec de l'inscription",
      }));
      throw e;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<string> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const result = await authService.forgotPassword(email);
      setState((s) => ({ ...s, isLoading: false }));
      return result.message;
    } catch (e) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: e instanceof Error ? e.message : "Échec de l'envoi",
      }));
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearRememberMe();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  return (
    <PortalAuthContext.Provider
      value={{
        ...state,
        login,
        register: registerUser,
        forgotPassword,
        loginWithGoogle,
        logout,
        rememberMeData,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider');
  return ctx;
}

/** Map API/DB role to dashboard role */
function mapRole(apiRole: string): UserRole {
  const normalizedRole = apiRole?.toLowerCase() || '';
  if (normalizedRole === 'superadmin') return 'superadmin';
  if (normalizedRole === 'admin') return 'admin';
  if (normalizedRole === 'employee') return 'employee';
  return 'customer';
}
