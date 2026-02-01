/**
 * API Client for Testing
 * =======================
 * Low-level HTTP client that captures request/response details
 */

import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  duration: number;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
  };
}

export interface ApiError {
  success: false;
  data?: unknown;
  status: number;
  statusText: string;
  message: string;
  error: unknown;
  duration: number;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
  };
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function apiRequest<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: unknown,
  options?: { useAuth?: boolean; headers?: Record<string, string> }
): Promise<ApiResponse<T> | ApiError> {
  const startTime = performance.now();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
    data,
    validateStatus: () => true, // Don't throw on any status
  };

  const requestInfo = {
    method,
    url,
    headers,
    body: data,
  };

  try {
    const response = await axios(config);
    const duration = performance.now() - startTime;
    const isSuccess = response.status >= 200 && response.status < 300;

    if (isSuccess) {
      return {
        success: true as const,
        data: response.data as T,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        duration,
        request: requestInfo,
      };
    } else {
      return {
        success: false as const,
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        message: 'Request failed',
        error: response.data,
        duration,
        request: requestInfo,
      };
    }
  } catch (error) {
    const duration = performance.now() - startTime;
    const axiosError = error as AxiosError;
    
    return {
      success: false,
      status: axiosError.response?.status || 0,
      statusText: axiosError.response?.statusText || 'Network Error',
      message: axiosError.message,
      error: axiosError.response?.data || error,
      duration,
      request: requestInfo,
    };
  }
}

// Convenience methods
export const api = {
  get: <T = unknown>(endpoint: string, options?: { useAuth?: boolean }) => 
    apiRequest<T>('GET', endpoint, undefined, options),
  
  post: <T = unknown>(endpoint: string, data?: unknown, options?: { useAuth?: boolean }) => 
    apiRequest<T>('POST', endpoint, data, options),
  
  put: <T = unknown>(endpoint: string, data?: unknown, options?: { useAuth?: boolean }) => 
    apiRequest<T>('PUT', endpoint, data, options),
  
  patch: <T = unknown>(endpoint: string, data?: unknown, options?: { useAuth?: boolean }) => 
    apiRequest<T>('PATCH', endpoint, data, options),
  
  delete: <T = unknown>(endpoint: string, options?: { useAuth?: boolean }) => 
    apiRequest<T>('DELETE', endpoint, undefined, options),
};
