/**
 * Auth Service
 * Wraps @supabase/supabase-js auth (GoTrue) while keeping the same
 * interface the rest of the app already consumes.
 */

import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// ── Public types (consumed by components) ────────────────────────

export interface AuthUserMapped {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUserMapped;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  telephoneNumber?: string;
  city?: string;
  gdprConsent: boolean;
  newsletterConsent?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

// ── Role mapping ─────────────────────────────────────────────────
// The database of truth for a user's application role is
// public.profiles.app_role (superadmin | admin | employee | utilisateur).
// GoTrue's user.role is always 'authenticated' (the PG role), so we
// must query the profiles table after login.

const DB_TO_UI_ROLE: Record<string, string> = {
  superadmin: 'superadmin',
  admin: 'admin',
  employee: 'employee',
  utilisateur: 'customer',
};

/**
 * Fetch the user's app_role from public.profiles.
 * Falls back to 'customer' if the profile doesn't exist yet.
 */
export async function fetchAppRole(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('app_role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[auth] Could not fetch profile role:', error.message);
  }
  return DB_TO_UI_ROLE[data?.app_role ?? 'utilisateur'] ?? 'customer';
}

/** Build the mapped user object — requires an async profile fetch. */
async function mapUser(u: SupabaseUser): Promise<AuthUserMapped> {
  const meta = u.user_metadata ?? {};
  const role = await fetchAppRole(u.id);
  return {
    id: u.id,
    email: u.email ?? '',
    name: meta.first_name ?? meta.name ?? u.email?.split('@')[0] ?? '',
    role,
  };
}

// ── Auth operations ──────────────────────────────────────────────

/** Register a new user via GoTrue */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const { data: result, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        telephone_number: data.telephoneNumber,
        city: data.city,
        gdpr_consent: data.gdprConsent,
        newsletter_consent: data.newsletterConsent ?? false,
        role: 'customer',
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!result.user) throw new Error('Registration failed — no user returned');

  return { user: await mapUser(result.user) };
}

/** Login with email and password */
export async function login(data: LoginData): Promise<AuthResponse> {
  const { data: result, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);
  if (!result.user) throw new Error('Login failed');

  return { user: await mapUser(result.user) };
}

/** Google OAuth login */
export async function googleLogin(_credential?: string): Promise<AuthResponse> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });

  if (error) throw new Error(error.message);

  // OAuth redirects — we'll pick up the session via onAuthStateChange
  // Return a placeholder; auth context will update on redirect return
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Google login: session not established yet');
  return { user: await mapUser(user) };
}

/** Request password reset email */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw new Error(error.message);
  return { message: 'Un e-mail de réinitialisation a été envoyé.' };
}

/** Verify reset token validity (GoTrue handles via redirect) */
export async function verifyResetToken(
  _token: string,
): Promise<{ valid: boolean; message: string }> {
  // GoTrue handles token verification via the redirect URL
  // The session is established when the user clicks the link
  const { data } = await supabase.auth.getSession();
  return {
    valid: !!data.session,
    message: data.session ? 'Token valide' : 'Token expiré ou invalide',
  };
}

/** Reset password (user must have a valid session from the reset link) */
export async function resetPassword(_token: string, password: string): Promise<{ message: string }> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return { message: 'Mot de passe mis à jour avec succès.' };
}

/** Logout user */
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

/** Get Google OAuth client ID — not needed with supabase OAuth */
export async function getGoogleConfig(): Promise<{ clientId: string | null }> {
  // supabase.auth.signInWithOAuth handles Google config internally
  return { clientId: null };
}

/** Get current user profile */
export async function getProfile(): Promise<AuthUserMapped> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error(error?.message ?? 'Not authenticated');
  return mapUser(user);
}
