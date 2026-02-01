/**
 * Auth Storage
 * =============
 * Local storage utilities for auth tokens
 */

const TOKEN_KEY = 'vg_access_token';
const REFRESH_TOKEN_KEY = 'vg_refresh_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  setStoredToken(accessToken);
  setStoredRefreshToken(refreshToken);
}
