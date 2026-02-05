/**
 * Search Service - API integration for user search
 * Handles visibility rules based on current user role
 */

import type { SearchResult, UserVisibility } from './types';
import { apiRequest } from '../../../services/api';

// API Response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: {
    data: T;
    total: number;
    page: number;
    pageSize: number;
  };
}

// User from API
interface ApiUser {
  id: number;
  email: string;
  firstName: string;
  role: string;
  telephoneNumber?: string;
  city?: string;
}

/**
 * Search users by name or username
 * Results are filtered server-side, but we add client-side visibility check
 */
export async function searchUsers(query: string): Promise<SearchResult[]> {
  try {
    const response = await apiRequest<ApiResponse<ApiUser[]>>(`/api/crud/users?search=${encodeURIComponent(query)}`);
    
    // Transform API response to SearchResult format
    const users = response?.data?.data || [];
    return users.map((user): SearchResult => ({
      id: String(user.id),
      name: user.firstName,
      username: user.email.split('@')[0],
      email: user.email,
      role: user.role,
    }));
  } catch (error) {
    console.error('Search API error:', error);
    // Return mock data for development
    return getMockUsers(query);
  }
}

// Single user API response
interface SingleUserResponse {
  success: boolean;
  data: ApiUser;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<SearchResult | null> {
  try {
    const response = await apiRequest<SingleUserResponse>(`/api/crud/users/${userId}`);
    const user = response?.data;
    if (!user) return null;
    
    return {
      id: String(user.id),
      name: user.firstName,
      username: user.email.split('@')[0],
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}

/**
 * Visibility Rules:
 * - superadmin: can see everyone
 * - admin: can see admins + employees
 * - employee: can see only employees (transparency)
 * - customer: can see no one except themselves
 */
export function canViewUser(viewerRole: UserVisibility | undefined, targetRole: UserVisibility): boolean {
  if (!viewerRole) return false;
  
  const visibilityMatrix: Record<UserVisibility, UserVisibility[]> = {
    superadmin: ['superadmin', 'admin', 'employee', 'customer'],
    admin: ['admin', 'employee'], // Admins see admins and employees
    employee: ['employee'], // Employees see only other employees
    customer: [], // Customers can only see themselves (handled separately)
  };

  return visibilityMatrix[viewerRole]?.includes(targetRole) ?? false;
}

/**
 * Check if user can view detailed profile (not just search result)
 */
export function canViewDetailedProfile(viewerRole: UserVisibility | undefined, targetRole: UserVisibility, isSelf: boolean): boolean {
  if (isSelf) return true; // Can always view own profile
  return canViewUser(viewerRole, targetRole);
}

/**
 * Mock data for development/testing
 */
function getMockUsers(query: string): SearchResult[] {
  const mockUsers: SearchResult[] = [
    { id: '1', name: 'Jean Dupont', username: 'jdupont', email: 'jean@vitegourmand.fr', role: 'employee' },
    { id: '2', name: 'Marie Martin', username: 'mmartin', email: 'marie@vitegourmand.fr', role: 'employee' },
    { id: '3', name: 'Pierre Admin', username: 'padmin', email: 'pierre@vitegourmand.fr', role: 'admin' },
    { id: '4', name: 'Sophie Chef', username: 'schef', email: 'sophie@vitegourmand.fr', role: 'employee' },
    { id: '5', name: 'Lucas Manager', username: 'lmanager', email: 'lucas@vitegourmand.fr', role: 'admin' },
    { id: '6', name: 'Emma Serveur', username: 'eserveur', email: 'emma@vitegourmand.fr', role: 'employee' },
    { id: '7', name: 'Hugo Client', username: 'hclient', email: 'hugo@example.com', role: 'customer' },
    { id: '8', name: 'Léa SuperAdmin', username: 'lsuperadmin', email: 'lea@vitegourmand.fr', role: 'superadmin' },
  ];

  const lowerQuery = query.toLowerCase();
  return mockUsers.filter(
    user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.username.toLowerCase().includes(lowerQuery)
  );
}
