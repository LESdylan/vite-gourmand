/**
 * Auth Service
 * API calls for authentication operations
 */

import { apiRequest, setTokens, clearTokens } from './api';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'client' | 'employee' | 'admin';
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/** Register a new user */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: data,
  });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

/** Login with email and password */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: data,
  });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

/** Google OAuth login */
export async function googleLogin(credential: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/google/token', {
    method: 'POST',
    body: { credential },
  });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

/** Request password reset email */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

/** Reset password with token */
export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
}

/** Logout user */
export function logout(): void {
  clearTokens();
}

/** Get current user profile */
export async function getProfile(): Promise<AuthUser> {
  return apiRequest('/api/auth/me');
}
