/**
 * API Configuration
 * ==================
 * Central configuration for backend API communication
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  ME: '/auth/me',

  // Menus
  MENUS: '/menus',

  // Orders
  ORDERS: '/orders',

  // Users
  USERS: '/users',

  // Reviews
  REVIEWS: '/reviews',

  // Working Hours
  WORKING_HOURS: '/working-hours',
};
