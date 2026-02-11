/**
 * API Base Service
 * Centralized fetch wrapper with auth handling
 */

// Use empty string to let Vite proxy handle /api routes
// In production, VITE_API_URL should be set to the backend URL
const API_BASE = import.meta.env.VITE_API_URL || '';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Get stored auth token */
function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

/** Store auth tokens */
export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem('accessToken', access);
  if (refresh) localStorage.setItem('refreshToken', refresh);
}

/** Clear auth tokens */
export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/** Check if user is authenticated */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Make API request with auth handling */
export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const token = getToken();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    // 401 = token expired or invalid → clear stale credentials
    if (response.status === 401) {
      clearTokens();
    }
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

export { ApiError };
