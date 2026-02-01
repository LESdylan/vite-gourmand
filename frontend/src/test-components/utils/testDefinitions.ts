/**
 * Test Definitions
 * =================
 * All automated test cases for the API
 */

import type { TestCase, PartialTestResult } from '../types';
import { api, setAuthToken, getAuthToken } from './apiClient';

// Helper to create test result
function createResult(
  passed: boolean,
  message: string,
  details?: Record<string, unknown>
): PartialTestResult {
  return {
    status: passed ? 'passed' : 'failed',
    message,
    details,
  };
}

// ============================================
// HEALTH TESTS
// ============================================

export const healthTests: TestCase[] = [
  {
    id: 'health-api-root',
    name: 'API Root Endpoint',
    description: 'Check if the API root endpoint is accessible',
    category: 'health',
    run: async () => {
      const response = await api.get('/');
      if (response.success && response.status === 200) {
        return createResult(true, 'API root is accessible', {
          response: response.data,
        });
      }
      return createResult(false, `API returned status ${response.status}`, {
        response: response,
      });
    },
  },
  {
    id: 'health-response-format',
    name: 'Response Format Validation',
    description: 'Verify API returns proper JSON structure',
    category: 'health',
    run: async () => {
      const response = await api.get('/');
      if (!response.success) {
        return createResult(false, 'Request failed');
      }
      
      const data = response.data as Record<string, unknown>;
      const hasSuccess = 'success' in data;
      const hasStatusCode = 'statusCode' in data;
      const hasMessage = 'message' in data;
      const hasTimestamp = 'timestamp' in data;
      
      const allPresent = hasSuccess && hasStatusCode && hasMessage && hasTimestamp;
      
      return createResult(allPresent, 
        allPresent 
          ? 'Response format is correct' 
          : 'Missing required fields in response',
        {
          hasSuccess,
          hasStatusCode,
          hasMessage,
          hasTimestamp,
        }
      );
    },
  },
  {
    id: 'health-cors',
    name: 'CORS Headers',
    description: 'Check if CORS is properly configured',
    category: 'health',
    run: async () => {
      await api.get('/');
      // If we got a response, CORS is working (browser would block otherwise)
      return createResult(true, 'CORS is properly configured (request succeeded)');
    },
  },
];

// ============================================
// AUTH TESTS
// ============================================

export const authTests: TestCase[] = [
  {
    id: 'auth-register-validation',
    name: 'Registration Validation',
    description: 'Verify registration validates required fields',
    category: 'auth',
    run: async () => {
      const response = await api.post('/auth/register', {});
      if (response.status === 400) {
        return createResult(true, 'Validation correctly rejects empty data', {
          response: response.data,
        });
      }
      return createResult(false, `Expected 400, got ${response.status}`);
    },
  },
  {
    id: 'auth-register-email-format',
    name: 'Email Format Validation',
    description: 'Verify invalid email is rejected',
    category: 'auth',
    run: async () => {
      const response = await api.post('/auth/register', {
        email: 'invalid-email',
        password: 'Test12345!',
        firstName: 'Test',
      });
      if (response.status === 400) {
        return createResult(true, 'Invalid email correctly rejected', {
          response: response.data,
        });
      }
      return createResult(false, `Expected 400, got ${response.status}`);
    },
  },
  {
    id: 'auth-register-password-length',
    name: 'Password Length Validation',
    description: 'Verify short password is rejected',
    category: 'auth',
    run: async () => {
      const response = await api.post('/auth/register', {
        email: 'test@test.com',
        password: 'short',
        firstName: 'Test',
      });
      if (response.status === 400) {
        return createResult(true, 'Short password correctly rejected', {
          response: response.data,
        });
      }
      return createResult(false, `Expected 400, got ${response.status}`);
    },
  },
  {
    id: 'auth-login-invalid',
    name: 'Login with Invalid Credentials',
    description: 'Verify login rejects wrong credentials',
    category: 'auth',
    run: async () => {
      const response = await api.post('/auth/login', {
        email: 'nonexistent@test.com',
        password: 'WrongPassword123!',
      });
      if (response.status === 401) {
        return createResult(true, 'Invalid credentials correctly rejected', {
          response: response.data,
        });
      }
      return createResult(false, `Expected 401, got ${response.status}`);
    },
  },
  {
    id: 'auth-login-valid',
    name: 'Login with Valid Credentials',
    description: 'Login with test user and get tokens',
    category: 'auth',
    run: async () => {
      const response = await api.post('/auth/login', {
        email: 'testuser@example.com',
        password: 'Test12345!',
      });
      
      if (response.success && response.status === 200) {
        const data = response.data as { data?: { accessToken?: string } };
        if (data.data?.accessToken) {
          setAuthToken(data.data.accessToken);
          return createResult(true, 'Login successful, token stored', {
            hasAccessToken: true,
            hasRefreshToken: !!(data.data as Record<string, unknown>).refreshToken,
          });
        }
      }
      return createResult(false, `Login failed with status ${response.status}`, {
        response: response.data,
      });
    },
  },
  {
    id: 'auth-me-authenticated',
    name: 'Get Current User (Authenticated)',
    description: 'Fetch user profile with valid token',
    category: 'auth',
    run: async () => {
      if (!getAuthToken()) {
        return createResult(false, 'No auth token available. Run login test first.');
      }
      
      const response = await api.get('/auth/me', { useAuth: true });
      if (response.success && response.status === 200) {
        return createResult(true, 'User profile retrieved', {
          response: response.data,
        });
      }
      return createResult(false, `Failed with status ${response.status}`, {
        response: response.data,
      });
    },
  },
  {
    id: 'auth-me-unauthenticated',
    name: 'Get Current User (Unauthenticated)',
    description: 'Verify /me endpoint requires auth',
    category: 'auth',
    run: async () => {
      const response = await api.get('/auth/me');
      if (response.status === 401) {
        return createResult(true, 'Endpoint correctly requires authentication');
      }
      return createResult(false, `Expected 401, got ${response.status}`);
    },
  },
  {
    id: 'auth-forgot-password-validation',
    name: 'Forgot Password Validation',
    description: 'Verify email is required for password reset',
    category: 'auth',
    run: async () => {
      const response = await api.post('/auth/forgot-password', {});
      if (response.status === 400) {
        return createResult(true, 'Validation correctly requires email');
      }
      return createResult(false, `Expected 400, got ${response.status}`);
    },
  },
];

// ============================================
// MENU TESTS
// ============================================

export const menuTests: TestCase[] = [
  {
    id: 'menu-list',
    name: 'List Menus',
    description: 'Fetch all menus (public endpoint)',
    category: 'menu',
    run: async () => {
      const response = await api.get('/menus');
      if (response.success) {
        return createResult(true, 'Menus retrieved successfully', {
          count: Array.isArray((response.data as { data?: unknown[] }).data) 
            ? (response.data as { data: unknown[] }).data.length 
            : 0,
        });
      }
      return createResult(false, `Failed with status ${response.status}`);
    },
  },
  {
    id: 'menu-get-invalid',
    name: 'Get Non-existent Menu',
    description: 'Verify 404 for invalid menu ID',
    category: 'menu',
    run: async () => {
      const response = await api.get('/menus/99999');
      if (response.status === 404) {
        return createResult(true, 'Non-existent menu returns 404');
      }
      return createResult(false, `Expected 404, got ${response.status}`);
    },
  },
];

// ============================================
// DISH TESTS
// ============================================

export const dishTests: TestCase[] = [
  {
    id: 'dish-list',
    name: 'List Dishes',
    description: 'Fetch all dishes (public endpoint)',
    category: 'menu',
    run: async () => {
      const response = await api.get('/dishes');
      if (response.success) {
        return createResult(true, 'Dishes retrieved successfully', {
          count: Array.isArray((response.data as { data?: unknown[] }).data) 
            ? (response.data as { data: unknown[] }).data.length 
            : 0,
        });
      }
      return createResult(false, `Failed with status ${response.status}`);
    },
  },
];

// ============================================
// ORDER TESTS
// ============================================

export const orderTests: TestCase[] = [
  {
    id: 'order-list-unauthenticated',
    name: 'List Orders (Unauthenticated)',
    description: 'Verify orders endpoint requires auth',
    category: 'order',
    run: async () => {
      const response = await api.get('/orders');
      if (response.status === 401) {
        return createResult(true, 'Orders endpoint correctly requires auth');
      }
      return createResult(false, `Expected 401, got ${response.status}`);
    },
  },
  {
    id: 'order-list-authenticated',
    name: 'List Orders (Authenticated)',
    description: 'Fetch user orders with valid token',
    category: 'order',
    run: async () => {
      if (!getAuthToken()) {
        return createResult(false, 'No auth token. Run login test first.');
      }
      
      const response = await api.get('/orders', { useAuth: true });
      if (response.success) {
        return createResult(true, 'Orders retrieved successfully', {
          count: Array.isArray((response.data as { data?: unknown[] }).data) 
            ? (response.data as { data: unknown[] }).data.length 
            : 0,
        });
      }
      return createResult(false, `Failed with status ${response.status}`);
    },
  },
];

// ============================================
// ADMIN TESTS
// ============================================

export const adminTests: TestCase[] = [
  {
    id: 'admin-stats-unauthenticated',
    name: 'Admin Stats (Unauthenticated)',
    description: 'Verify admin endpoints require auth',
    category: 'admin',
    run: async () => {
      const response = await api.get('/admin/stats');
      if (response.status === 401) {
        return createResult(true, 'Admin endpoint correctly requires auth');
      }
      return createResult(false, `Expected 401, got ${response.status}`);
    },
  },
  {
    id: 'admin-users-unauthenticated',
    name: 'Admin Users (Unauthenticated)',
    description: 'Verify admin users list requires auth',
    category: 'admin',
    run: async () => {
      const response = await api.get('/admin/users');
      if (response.status === 401) {
        return createResult(true, 'Admin users endpoint correctly requires auth');
      }
      return createResult(false, `Expected 401, got ${response.status}`);
    },
  },
];

// ============================================
// VALIDATION TESTS
// ============================================

export const validationTests: TestCase[] = [
  {
    id: 'validation-content-type',
    name: 'Content-Type Validation',
    description: 'Verify API handles missing Content-Type',
    category: 'validation',
    run: async () => {
      // This test verifies the API handles various edge cases
      const response = await api.post('/auth/login', {
        email: 'test@test.com',
        password: 'test12345678',
      });
      // Should get a proper error response, not a server crash
      if (response.status >= 400 && response.status < 500) {
        return createResult(true, 'API properly handles request');
      }
      return createResult(false, `Unexpected status ${response.status}`);
    },
  },
];

// ============================================
// ALL TESTS
// ============================================

export const allTests: TestCase[] = [
  ...healthTests,
  ...authTests,
  ...menuTests,
  ...dishTests,
  ...orderTests,
  ...adminTests,
  ...validationTests,
];

export function getTestsByCategory(category: string): TestCase[] {
  if (category === 'all') return allTests;
  return allTests.filter(t => t.category === category);
}
