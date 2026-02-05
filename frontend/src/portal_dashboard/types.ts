/**
 * Portal Dashboard Types
 * Role-based access definitions
 */

export type UserRole = 'developer' | 'admin' | 'employee';

export interface DashboardUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface RememberMeData {
  email: string;
  name: string;
  avatar?: string;
  timestamp: number;
}

export interface PortalAuthState {
  user: DashboardUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/** Role-based permissions */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  developer: ['*'], // All access
  admin: ['metrics', 'activity', 'database', 'logs', 'settings'],
  employee: ['tasks', 'activity'],
};

/** Check if role has permission */
export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes('*') || perms.includes(permission);
}
