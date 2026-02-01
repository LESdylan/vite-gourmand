/**
 * Application constants
 * Centralized configuration values
 */

// Role constants
export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  CLIENT: 'client',
  CHEF: 'chef',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// JWT constants
export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_REGEX: /^(\+33|0)[1-9](\d{2}){4}$/,
  POSTAL_CODE_REGEX: /^\d{5}$/,
} as const;

// API Response messages
export const MESSAGES = {
  // Success
  SUCCESS: 'Operation successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',

  // Auth
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token expired',

  // Validation
  VALIDATION_ERROR: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',

  // Not found
  NOT_FOUND: 'Resource not found',
  USER_NOT_FOUND: 'User not found',
  MENU_NOT_FOUND: 'Menu not found',
  ORDER_NOT_FOUND: 'Order not found',

  // Server errors
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;

// Metadata keys
export const METADATA_KEYS = {
  IS_PUBLIC: 'isPublic',
  ROLES: 'roles',
} as const;
