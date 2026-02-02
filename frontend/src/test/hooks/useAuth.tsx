/**
 * Authentication Hook & Context
 * Manages auth state across the application
 * 
 * TEST MODE: Tracks created users for cleanup on exit
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, type AuthResponse, type LoginRequest, type RegisterRequest } from '../services/api';

// ============================================================
// Types
// ============================================================

interface User {
  id: number;
  email: string;
  firstName: string;
  role: string;
  accessToken?: string;
  avatar?: string;
  googleId?: string;
}

interface TestUser {
  id: number;
  email: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  testUsers: TestUser[]; // Track users created during this session
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  googleLogin: () => Promise<void>;
  googleLoginWithCredential: (credential: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  cleanupTestUsers: () => Promise<void>;
}

// ============================================================
// Constants
// ============================================================

const TEST_USERS_STORAGE_KEY = 'testPortal_createdUsers';

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Helper Functions
// ============================================================

function getStoredTestUsers(): TestUser[] {
  try {
    const stored = sessionStorage.getItem(TEST_USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeTestUsers(users: TestUser[]): void {
  sessionStorage.setItem(TEST_USERS_STORAGE_KEY, JSON.stringify(users));
}

function addTestUser(user: TestUser): void {
  const users = getStoredTestUsers();
  users.push(user);
  storeTestUsers(users);
}

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    testUsers: getStoredTestUsers(),
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        try {
          const user = await authApi.getMe();
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }));
        } catch {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }));
      }
    };

    checkAuth();
  }, []);

  // Handle successful auth response (track if test user)
  const handleAuthSuccess = useCallback((response: AuthResponse, isNewUser: boolean = false) => {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    // Build user object with accessToken for display
    const userWithToken: User = {
      ...response.user,
      accessToken: response.accessToken,
    };
    
    // Track new test users for cleanup
    if (isNewUser) {
      const testUser: TestUser = {
        id: response.user.id,
        email: response.user.email,
        createdAt: new Date(),
      };
      addTestUser(testUser);
      
      setState(prev => ({
        ...prev,
        user: userWithToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        testUsers: [...prev.testUsers, testUser],
      }));
    } else {
      setState(prev => ({
        ...prev,
        user: userWithToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    }
  }, []);

  // Login (existing user, don't track)
  const login = useCallback(async (data: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authApi.login(data);
      handleAuthSuccess(response, false); // Not a new user
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'Login failed. Please check your credentials.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [handleAuthSuccess]);

  // Register (new user, TRACK for cleanup)
  const register = useCallback(async (data: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authApi.register(data);
      handleAuthSuccess(response, true); // Track as test user
      console.log(`📝 Test user created: ${response.user.email} (ID: ${response.user.id})`);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'Registration failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [handleAuthSuccess]);

  // Google Login - Redirect to real Google OAuth
  const googleLogin = useCallback(async () => {
    // Redirect to backend's Google OAuth endpoint
    // The backend will handle the OAuth flow and redirect back
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const redirectUrl = `${backendUrl}/api/auth/google`;
    
    // Store current location for callback
    sessionStorage.setItem('googleOAuthReturn', window.location.href);
    
    // Redirect to Google OAuth
    window.location.href = redirectUrl;
  }, []);

  // Google Login with Credential (from Google Identity Services)
  const googleLoginWithCredential = useCallback(async (credential: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authApi.googleLogin(credential);
      // Google login might be new user or existing - we'll mark as potential new
      handleAuthSuccess(response, true);
      console.log(`✅ Google login successful: ${response.user.email}`);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'Google login failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [handleAuthSuccess]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }));
  }, []);

  // Forgot Password
  const forgotPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authApi.forgotPassword({ email });
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'Failed to send reset email.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authApi.resetPassword({ token, newPassword });
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'Failed to reset password.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  // Clear Error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup Test Users - Mark for deletion (manual cleanup required)
  // Note: Backend doesn't have admin DELETE endpoint, so we log users for manual cleanup
  const cleanupTestUsers = useCallback(async () => {
    const users = state.testUsers;
    if (users.length === 0) {
      console.log('✅ No test users to clean up');
      return;
    }

    console.log(`🧹 Test users to clean up (${users.length}):`);
    console.log('─'.repeat(50));
    users.forEach((user) => {
      console.log(`  ID: ${user.id} | Email: ${user.email}`);
    });
    console.log('─'.repeat(50));
    console.log('⚠️ Manual cleanup required: Use CLI tool or direct DB access');
    console.log('   CLI: cd backend && npm run cli:test');
    console.log('   SQL: DELETE FROM "users" WHERE id IN (' + users.map(u => u.id).join(', ') + ');');

    // Clear tracked users from session
    sessionStorage.removeItem(TEST_USERS_STORAGE_KEY);
    setState(prev => ({ ...prev, testUsers: [] }));

    console.log('✅ Session cleared. Test user list reset.');
  }, [state.testUsers]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        googleLogin,
        googleLoginWithCredential,
        forgotPassword,
        resetPassword,
        clearError,
        cleanupTestUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
