/**
 * Auth Service
 * =============
 * API calls for authentication operations
 */

import apiClient from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import { storeTokens, clearStoredToken } from './auth.storage';
import type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AuthResponse,
  ApiResponse,
  User,
} from '../types/auth.types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.LOGIN,
    credentials
  );
  
  const { accessToken, refreshToken, user } = response.data.data;
  storeTokens(accessToken, refreshToken);
  
  return { user, accessToken, refreshToken };
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.REGISTER,
    data
  );
  
  const { accessToken, refreshToken, user } = response.data.data;
  storeTokens(accessToken, refreshToken);
  
  return { user, accessToken, refreshToken };
}

export async function logout(): Promise<void> {
  clearStoredToken();
}

export async function forgotPassword(data: ForgotPasswordData): Promise<string> {
  const response = await apiClient.post<ApiResponse<{ message: string; token?: string }>>(
    API_ENDPOINTS.FORGOT_PASSWORD,
    data
  );
  return response.data.data.message;
}

export async function resetPassword(data: ResetPasswordData): Promise<string> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.RESET_PASSWORD,
    data
  );
  return response.data.data.message;
}

export async function changePassword(data: ChangePasswordData): Promise<string> {
  const response = await apiClient.put<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.CHANGE_PASSWORD,
    data
  );
  return response.data.data.message;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.ME);
  return response.data.data;
}
