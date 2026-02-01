/**
 * API Service for Manual Testing
 * Handles all API calls with timing, logging, and state management
 */

const API_BASE = 'http://localhost:3000/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  statusText: string;
  data: T;
  error?: string;
  duration: number;
  headers: Record<string, string>;
  request: {
    method: string;
    url: string;
    body?: unknown;
  };
}

class ManualTestApiService {
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private userId: string | null = null;
  private userEmail: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  setRefreshToken(token: string | null) {
    this.refreshToken = token;
  }

  setUser(id: string | null, email: string | null) {
    this.userId = id;
    this.userEmail = email;
  }

  getAuthState() {
    return {
      isAuthenticated: !!this.authToken,
      userId: this.userId,
      userEmail: this.userEmail,
      hasToken: !!this.authToken,
      hasRefreshToken: !!this.refreshToken
    };
  }

  clearAuth() {
    this.authToken = null;
    this.refreshToken = null;
    this.userId = null;
    this.userEmail = null;
  }

  async request<T = unknown>(
    method: string,
    endpoint: string,
    body?: unknown,
    useAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const startTime = performance.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const duration = Math.round(performance.now() - startTime);
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      // Handle auth responses
      if (endpoint === '/auth/login' || endpoint === '/auth/register') {
        const authData = data as { accessToken?: string; refreshToken?: string; user?: { id: string; email: string } };
        if (authData.accessToken) {
          this.authToken = authData.accessToken;
        }
        if (authData.refreshToken) {
          this.refreshToken = authData.refreshToken;
        }
        if (authData.user) {
          this.userId = authData.user.id;
          this.userEmail = authData.user.email;
        }
      }

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
        duration,
        headers: responseHeaders,
        request: { method, url, body }
      };
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      return {
        success: false,
        status: 0,
        statusText: 'Network Error',
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        headers: {},
        request: { method, url, body }
      };
    }
  }

  async get<T = unknown>(endpoint: string, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, useAuth);
  }

  async post<T = unknown>(endpoint: string, body?: unknown, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, useAuth);
  }

  async put<T = unknown>(endpoint: string, body?: unknown, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, useAuth);
  }

  async patch<T = unknown>(endpoint: string, body?: unknown, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, useAuth);
  }

  async delete<T = unknown>(endpoint: string, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, useAuth);
  }
}

export const apiService = new ManualTestApiService();
