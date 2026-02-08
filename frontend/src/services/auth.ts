/**
 * Auth Service
 * API calls for authentication operations
 */

import { apiRequest, setTokens, clearTokens } from './api';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  role: string;
}

// Map to frontend user format
export interface AuthUserMapped {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUserMapped;
  accessToken: string;
  refreshToken?: string;
}

// API wraps response in { success, data, ... }
interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

interface RawAuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  telephoneNumber?: string;
  postalAddress?: string;
  city?: string;
  country?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/** Map API user to frontend format */
function mapUser(user: AuthUser): AuthUserMapped {
  return {
    id: user.id,
    email: user.email,
    name: user.firstName,
    role: user.role,
  };
}

/** Register a new user */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const wrapper = await apiRequest<ApiWrapper<RawAuthResponse>>('/api/auth/register', {
    method: 'POST',
    body: data,
  });
  const response = wrapper.data;
  setTokens(response.accessToken, response.refreshToken);
  return { ...response, user: mapUser(response.user) };
}

/** Login with email and password */
export async function login(data: LoginData): Promise<AuthResponse> {
  const wrapper = await apiRequest<ApiWrapper<RawAuthResponse>>('/api/auth/login', {
    method: 'POST',
    body: data,
  });
  const response = wrapper.data;
  setTokens(response.accessToken, response.refreshToken);
  return { ...response, user: mapUser(response.user) };
}

/** Google OAuth login */
export async function googleLogin(credential: string): Promise<AuthResponse> {
  const wrapper = await apiRequest<ApiWrapper<RawAuthResponse>>('/api/auth/google/token', {
    method: 'POST',
    body: { credential },
  });
  const response = wrapper.data;
  setTokens(response.accessToken, response.refreshToken);
  return { ...response, user: mapUser(response.user) };
}

/** Request password reset email */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const wrapper = await apiRequest<ApiWrapper<{ message: string }>>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
  return wrapper.data;
}

/** Reset password with token */
export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const wrapper = await apiRequest<ApiWrapper<{ message: string }>>('/api/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
  return wrapper.data;
}

/** Logout user */
export function logout(): void {
  clearTokens();
}

/** Get current user profile */
export async function getProfile(): Promise<AuthUserMapped> {
  const wrapper = await apiRequest<ApiWrapper<AuthUser>>('/api/auth/me');
  return mapUser(wrapper.data);
}
