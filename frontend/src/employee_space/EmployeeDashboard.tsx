/**
 * Employee Dashboard
 * Main employee interface - reuses DevBoard layout structure
 */

import { usePortalAuth } from '../portal_dashboard';
import { GradientBackground } from '../components/DevBoard/GradientBackground';
import { Sidebar, GenericCategoryList } from '../components/layout/Sidebar';
import { SidebarHeader } from '../components/features/qa/sidebar';
import { EmployeeContent } from './EmployeeContent';
import { useEmployeeDashboard } from './useEmployeeDashboard';
import { EMPLOYEE_CATEGORIES, type EmployeeCategoryId } from './types';
import './EmployeeDashboard.css';

export function EmployeeDashboard() {
  const { user, logout } = usePortalAuth();
  const { activeCategory, isSidebarCollapsed, tasks, selectCategory, toggleSidebar, updateTaskStatus } = useEmployeeDashboard();

  return (
    <div className="employee-dashboard">
      <GradientBackground />
      <header className="employee-dashboard-header">
        <h1>🍽️ Vite Gourmand - Espace Employé</h1>
      </header>
      <section className="employee-dashboard-body">
        <Sidebar collapsed={isSidebarCollapsed}>
          <SidebarHeader collapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
          <GenericCategoryList<EmployeeCategoryId>
            categories={EMPLOYEE_CATEGORIES}
            activeCategory={activeCategory}
            collapsed={isSidebarCollapsed}
            onSelect={selectCategory}
          />
          <UserInfo user={user} onLogout={logout} collapsed={isSidebarCollapsed} />
        </Sidebar>
        <EmployeeContent 
          activeCategory={activeCategory} 
          tasks={tasks} 
          onUpdateTask={updateTaskStatus} 
        />
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
        <span className="sidebar-user-role">Employé</span>
      </div>
      <button className="sidebar-logout" onClick={onLogout} title="Déconnexion">🚪</button>
    </div>
  );
}
