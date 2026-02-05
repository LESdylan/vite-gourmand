/**
 * Portal Dashboard - Barrel exports
 */

export { Portal } from './Portal';
export { PortalAuthProvider, usePortalAuth } from './PortalAuthContext';
export { ProtectedRoute } from './ProtectedRoute';
export { Unauthorized } from './Unauthorized';
export { hasPermission } from './types';
export type { UserRole, DashboardUser, PortalAuthState } from './types';
