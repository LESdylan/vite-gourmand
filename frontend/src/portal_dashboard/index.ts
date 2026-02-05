/**
 * Portal Dashboard - Barrel exports
 */

export { Portal } from './Portal';
export { PortalAuthProvider, usePortalAuth } from './PortalAuthContext';
export { ProtectedRoute } from './ProtectedRoute';
export { Unauthorized } from './Unauthorized';
export { DebugSwitcher } from './DebugSwitcher';
export { hasPermission, canAccessDashboard, DEBUG_BOTS } from './types';
export type { UserRole, DashboardUser, PortalAuthState, BotId } from './types';
