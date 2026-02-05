/**
 * Admin Dashboard
 * Main admin interface - reuses DevBoard layout structure
 */

import { useEffect } from 'react';
import { usePortalAuth } from '../portal_dashboard';
import { GradientBackground } from '../components/DevBoard/GradientBackground';
import { Sidebar, GenericCategoryList } from '../components/layout/Sidebar';
import { SidebarHeader } from '../components/features/qa/sidebar';
import { AdminContent } from './AdminContent';
import { useAdminDashboard } from './useAdminDashboard';
import { ADMIN_CATEGORIES, type AdminCategoryId } from './types';
import './AdminDashboard.css';

export function AdminDashboard() {
  const { user, logout } = usePortalAuth();
  const { activeCategory, isSidebarCollapsed, stats, selectCategory, toggleSidebar, refreshStats } = useAdminDashboard();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <div className="admin-dashboard">
      <GradientBackground />
      <header className="admin-dashboard-header">
        <h1>🏪 Vite Gourmand - Admin</h1>
      </header>
      <section className="admin-dashboard-body">
        <Sidebar collapsed={isSidebarCollapsed}>
          <SidebarHeader collapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
          <GenericCategoryList<AdminCategoryId>
            categories={ADMIN_CATEGORIES}
            activeCategory={activeCategory}
            collapsed={isSidebarCollapsed}
            onSelect={selectCategory}
          />
          <UserInfo user={user} onLogout={logout} collapsed={isSidebarCollapsed} />
        </Sidebar>
        <AdminContent activeCategory={activeCategory} stats={stats} />
      </section>
    </div>
  );
}

interface UserInfoProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
  collapsed: boolean;
}

function UserInfo({ user, onLogout, collapsed }: UserInfoProps) {
  if (collapsed || !user) return null;
  
  return (
    <div className="sidebar-user">
      <div className="sidebar-user-info">
        <span className="sidebar-user-name">{user.name}</span>
        <span className="sidebar-user-role">Administrateur</span>
      </div>
      <button className="sidebar-logout" onClick={onLogout} title="Déconnexion">🚪</button>
    </div>
  );
}
