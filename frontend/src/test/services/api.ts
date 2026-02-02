/**
 * API Client for Backend Communication
 * Uses axios to communicate with the NestJS backend
 * Includes CRUD operations for all entities
 */

import axios, { type AxiosError, type AxiosResponse } from 'axios';

// API Base URL - Use proxy in dev, direct URL in production
// In development, Vite proxy handles /api/* routes
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If 401 and we have a refresh token, try to refresh
    if (error.response?.status === 401 && originalRequest) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// Auth API Types
// ============================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  telephoneNumber?: string;
  city?: string;
  country?: string;
  postalAddress?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

// ============================================================
// Auth API Functions
// ============================================================

// Backend response wrapper type
interface ApiResponseWrapper<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export const authApi = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponseWrapper<AuthResponse>>('/api/auth/login', data);
    return response.data.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponseWrapper<AuthResponse>>('/api/auth/register', data);
    return response.data.data;
  },

  /**
   * Request password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponseWrapper<{ message: string }>>('/api/auth/forgot-password', data);
    return response.data.data || { message: response.data.message };
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponseWrapper<{ message: string }>>('/api/auth/reset-password', data);
    return response.data.data || { message: response.data.message };
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<AuthResponse['user']> {
    const response = await apiClient.get<ApiResponseWrapper<AuthResponse['user']>>('/api/auth/me');
    return response.data.data || response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<ApiResponseWrapper<{ accessToken: string }>>('/api/auth/refresh', { refreshToken });
    return response.data.data || response.data;
  },

  /**
   * Delete a user (for test cleanup via CRUD API)
   * Requires admin privileges
   */
  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/api/crud/users/${userId}`);
  },

  /**
   * Google OAuth - Login with Google ID token from Google Identity Services
   * The token is verified on the backend with Google's servers
   */
  async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponseWrapper<AuthResponse>>('/api/auth/google/token', {
      credential,
    });
    return response.data.data;
  },

  /**
   * Get Google Client ID from backend config
   * This allows the client ID to be configured on the server side
   */
  async getGoogleClientId(): Promise<string | null> {
    try {
      const response = await apiClient.get<ApiResponseWrapper<{ clientId: string }>>('/api/auth/google/config');
      return response.data.data?.clientId || null;
    } catch {
      return null;
    }
  },
};

// ============================================================
// CRUD API Functions
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface CrudUser {
  id: number;
  email: string;
  firstName: string;
  telephoneNumber: string;
  city: string;
  country: string;
  postalAddress: string;
  role: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
  ordersCount: number;
}

export interface Menu {
  id: number;
  title: string;
  person_min: number;
  price_per_person: number;
  description: string;
  remaining_qty: number;
  dietId: number | null;
  themeId: number | null;
  diet?: { id: number; libelle: string };
  theme?: { id: number; libelle: string };
  dishes?: Dish[];
}

export interface Dish {
  id: number;
  title_dish: string;
  photo: string;
  menuId: number | null;
  menu?: Menu;
  allergens?: Allergen[];
}

export interface Allergen {
  id: number;
  libelle: string;
}

export interface Diet {
  id: number;
  libelle: string;
}

export interface Theme {
  id: number;
  libelle: string;
}

export interface Role {
  id: number;
  libelle: string;
}

export interface Order {
  id: number;
  order_number: string;
  order_date: string;
  prestation_date: string;
  delivery_hour: string;
  menu_price: number;
  person_number: number;
  delivery_price: number;
  status: string;
  material_lending: boolean;
  get_back_material: boolean;
  userId: number;
  user?: { id: number; email: string; first_name: string };
  menus?: Menu[];
}

export interface WorkingHours {
  id: number;
  day: string;
  opening: string;
  closing: string;
}

export const crudApi = {
  // ============================================================
  // USERS
  // ============================================================
  users: {
    async getAll(params?: { skip?: number; take?: number; search?: string }): Promise<PaginatedResponse<CrudUser>> {
      const response = await apiClient.get<ApiResponseWrapper<PaginatedResponse<CrudUser>>>('/api/crud/users', { params });
      return response.data.data;
    },
    async getOne(id: number): Promise<CrudUser> {
      const response = await apiClient.get<ApiResponseWrapper<CrudUser>>(`/api/crud/users/${id}`);
      return response.data.data;
    },
    async create(data: Partial<CrudUser> & { password: string }): Promise<CrudUser> {
      const response = await apiClient.post<ApiResponseWrapper<CrudUser>>('/api/crud/users', data);
      return response.data.data;
    },
    async update(id: number, data: Partial<CrudUser>): Promise<CrudUser> {
      const response = await apiClient.put<ApiResponseWrapper<CrudUser>>(`/api/crud/users/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/users/${id}`);
      return response.data.data;
    },
  },

  // ============================================================
  // ROLES
  // ============================================================
  roles: {
    async getAll(): Promise<Role[]> {
      const response = await apiClient.get<ApiResponseWrapper<Role[]>>('/api/crud/roles');
      return response.data.data;
    },
    async getOne(id: number): Promise<Role> {
      const response = await apiClient.get<ApiResponseWrapper<Role>>(`/api/crud/roles/${id}`);
      return response.data.data;
    },
    async create(data: { libelle: string }): Promise<Role> {
      const response = await apiClient.post<ApiResponseWrapper<Role>>('/api/crud/roles', data);
      return response.data.data;
    },
    async update(id: number, data: { libelle: string }): Promise<Role> {
      const response = await apiClient.put<ApiResponseWrapper<Role>>(`/api/crud/roles/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/roles/${id}`);
      return response.data.data;
    },
  },

  // ============================================================
  // MENUS
  // ============================================================
  menus: {
    async getAll(params?: { skip?: number; take?: number; search?: string }): Promise<PaginatedResponse<Menu>> {
      const response = await apiClient.get<ApiResponseWrapper<PaginatedResponse<Menu>>>('/api/crud/menus', { params });
      return response.data.data;
    },
    async getOne(id: number): Promise<Menu> {
      const response = await apiClient.get<ApiResponseWrapper<Menu>>(`/api/crud/menus/${id}`);
      return response.data.data;
    },
    async create(data: Omit<Menu, 'id' | 'diet' | 'theme' | 'dishes'>): Promise<Menu> {
      const response = await apiClient.post<ApiResponseWrapper<Menu>>('/api/crud/menus', data);
      return response.data.data;
    },
    async update(id: number, data: Partial<Menu>): Promise<Menu> {
      const response = await apiClient.put<ApiResponseWrapper<Menu>>(`/api/crud/menus/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/menus/${id}`);
      return response.data.data;
    },
  },

  // ============================================================
  // DISHES
  // ============================================================
  dishes: {
    async getAll(params?: { skip?: number; take?: number; search?: string; menuId?: number }): Promise<PaginatedResponse<Dish>> {
      const response = await apiClient.get<ApiResponseWrapper<PaginatedResponse<Dish>>>('/api/crud/dishes', { params });
      return response.data.data;
    },
    async getOne(id: number): Promise<Dish> {
      const response = await apiClient.get<ApiResponseWrapper<Dish>>(`/api/crud/dishes/${id}`);
      return response.data.data;
    },
    async create(data: { title_dish: string; photo: string; menuId?: number; allergenIds?: number[] }): Promise<Dish> {
      const response = await apiClient.post<ApiResponseWrapper<Dish>>('/api/crud/dishes', data);
      return response.data.data;
    },
    async update(id: number, data: Partial<{ title_dish: string; photo: string; menuId: number; allergenIds: number[] }>): Promise<Dish> {
      const response = await apiClient.put<ApiResponseWrapper<Dish>>(`/api/crud/dishes/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/dishes/${id}`);
      return response.data.data;
    },
  },

  // ============================================================
  // ALLERGENS
  // ============================================================
  allergens: {
    async getAll(): Promise<Allergen[]> {
      const response = await apiClient.get<ApiResponseWrapper<Allergen[]>>('/api/crud/allergens');
      return response.data.data;
    },
    async getOne(id: number): Promise<Allergen> {
      const response = await apiClient.get<ApiResponseWrapper<Allergen>>(`/api/crud/allergens/${id}`);
      return response.data.data;
    },
    async create(data: { libelle: string }): Promise<Allergen> {
      const response = await apiClient.post<ApiResponseWrapper<Allergen>>('/api/crud/allergens', data);
      return response.data.data;
    },
    async update(id: number, data: { libelle: string }): Promise<Allergen> {
      const response = await apiClient.put<ApiResponseWrapper<Allergen>>(`/api/crud/allergens/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/allergens/${id}`);
      return response.data.data;
    },
  },

  // ============================================================
  // DIETS
  // ============================================================
  diets: {
    async getAll(): Promise<Diet[]> {
      const response = await apiClient.get<ApiResponseWrapper<Diet[]>>('/api/crud/diets');
      return response.data.data;
    },
    async getOne(id: number): Promise<Diet> {
      const response = await apiClient.get<ApiResponseWrapper<Diet>>(`/api/crud/diets/${id}`);
      return response.data.data;
    },
    async create(data: { libelle: string }): Promise<Diet> {
      const response = await apiClient.post<ApiResponseWrapper<Diet>>('/api/crud/diets', data);
      return response.data.data;
    },
    async update(id: number, data: { libelle: string }): Promise<Diet> {
      const response = await apiClient.put<ApiResponseWrapper<Diet>>(`/api/crud/diets/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/diets/${id}`);
      return response.data.data;
    },
  },

  // ============================================================
  // THEMES
  // ============================================================
  themes: {
    async getAll(): Promise<Theme[]> {
      const response = await apiClient.get<ApiResponseWrapper<Theme[]>>('/api/crud/themes');
      return response.data.data;
    },
    async getOne(id: number): Promise<Theme> {
      const response = await apiClient.get<ApiResponseWrapper<Theme>>(`/api/crud/themes/${id}`);
      return response.data.data;
    },
    async create(data: { libelle: string }): Promise<Theme> {
      const response = await apiClient.post<ApiResponseWrapper<Theme>>('/api/crud/themes', data);
      return response.data.data;
    },
    async update(id: number, data: { libelle: string }): Promise<Theme> {
      const response = await apiClient.put<ApiResponseWrapper<Theme>>(`/api/crud/themes/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/themes/${id}`);
      return response.data.data;
    },
  },

  // ============================================================
  // ORDERS
  // ============================================================
  orders: {
    async getAll(params?: { skip?: number; take?: number; status?: string; userId?: number }): Promise<PaginatedResponse<Order>> {
      const response = await apiClient.get<ApiResponseWrapper<PaginatedResponse<Order>>>('/api/crud/orders', { params });
      return response.data.data;
    },
    async getOne(id: number): Promise<Order> {
      const response = await apiClient.get<ApiResponseWrapper<Order>>(`/api/crud/orders/${id}`);
      return response.data.data;
    },
    async create(data: Omit<Order, 'id' | 'user' | 'menus'> & { menuIds?: number[] }): Promise<Order> {
      const response = await apiClient.post<ApiResponseWrapper<Order>>('/api/crud/orders', data);
      return response.data.data;
    },
    async update(id: number, data: Partial<{ status: string; delivery_hour: string; material_lending: boolean; get_back_material: boolean; menuIds: number[] }>): Promise<Order> {
      const response = await apiClient.put<ApiResponseWrapper<Order>>(`/api/crud/orders/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/orders/${id}`);
      return response.data.data;
    },
  },

  // ============================================================
  // WORKING HOURS
  // ============================================================
  workingHours: {
    async getAll(): Promise<WorkingHours[]> {
      const response = await apiClient.get<ApiResponseWrapper<WorkingHours[]>>('/api/crud/working-hours');
      return response.data.data;
    },
    async getOne(id: number): Promise<WorkingHours> {
      const response = await apiClient.get<ApiResponseWrapper<WorkingHours>>(`/api/crud/working-hours/${id}`);
      return response.data.data;
    },
    async create(data: Omit<WorkingHours, 'id'>): Promise<WorkingHours> {
      const response = await apiClient.post<ApiResponseWrapper<WorkingHours>>('/api/crud/working-hours', data);
      return response.data.data;
    },
    async update(id: number, data: Partial<WorkingHours>): Promise<WorkingHours> {
      const response = await apiClient.put<ApiResponseWrapper<WorkingHours>>(`/api/crud/working-hours/${id}`, data);
      return response.data.data;
    },
    async delete(id: number): Promise<{ message: string }> {
      const response = await apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/api/crud/working-hours/${id}`);
      return response.data.data;
    },
  },
};

export default apiClient;
