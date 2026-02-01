/**
 * API Client
 * ===========
 * Axios instance with interceptors for auth and error handling
 */

import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { getStoredToken, clearStoredToken } from './auth.storage';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => handleApiError(error)
);

function handleApiError(error: AxiosError): Promise<never> {
  if (error.response?.status === 401) {
    clearStoredToken();
  }
  return Promise.reject(error);
}

export default apiClient;
