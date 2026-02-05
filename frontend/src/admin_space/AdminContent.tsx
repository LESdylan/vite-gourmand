/**
 * Admin Dashboard Content
 * Renders content based on active category
 */

import { MetricsDashboard } from '../components/features/qa/metrics';
import { Activity } from '../components/features/qa/activity';
import type { AdminStats, AdminCategoryId } from './types';
import './AdminContent.css';

interface AdminContentProps {
  activeCategory: AdminCategoryId;
  stats: AdminStats;
}

export function AdminContent({ activeCategory, stats }: AdminContentProps) {
  return (
    <main className="admin-content">
      <header className="admin-content-header">
        <h2 className="admin-content-title">{getCategoryTitle(activeCategory)}</h2>
      </header>
      <div className="admin-content-body">
        {renderContent(activeCategory, stats)}
      </div>
    </main>
  );
}

function renderContent(category: AdminCategoryId, stats: AdminStats) {
  switch (category) {
    case 'overview':
      return <AdminOverview stats={stats} />;
    case 'orders':
      return <AdminOrders />;
    case 'users':
      return <AdminUsers />;
    case 'metrics':
      return <MetricsDashboard totalTests={stats.totalOrders} passedTests={stats.totalOrders - stats.pendingOrders} failedTests={stats.pendingOrders} passRate={Math.round(((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100)} />;
    default:
      return <AdminOverview stats={stats} />;
  }
}

function AdminOverview({ stats }: { stats: AdminStats }) {
  return (
    <div className="admin-overview">
      <StatCard title="Commandes" value={stats.totalOrders} icon="📦" trend="+12%" />
      <StatCard title="Chiffre d'affaires" value={`${stats.revenue}€`} icon="💰" trend="+8%" />
      <StatCard title="Utilisateurs actifs" value={stats.activeUsers} icon="👥" />
      <StatCard title="En attente" value={stats.pendingOrders} icon="⏳" variant="warning" />
      <div className="admin-activity-section">
        <h3>Activité Récente</h3>
        <Activity />
      </div>
    </div>
  );
}

function AdminOrders() {
  return <div className="admin-placeholder">Gestion des commandes (à implémenter)</div>;
}

function AdminUsers() {
  return <div className="admin-placeholder">Gestion des utilisateurs (à implémenter)</div>;
}

function StatCard({ title, value, icon, trend, variant }: { title: string; value: string | number; icon: string; trend?: string; variant?: 'warning' }) {
  return (
    <div className={`stat-card ${variant ? `stat-card--${variant}` : ''}`}>
      <span className="stat-icon">{icon}</span>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-title">{title}</span>
      </div>
      {trend && <span className="stat-trend">{trend}</span>}
    </div>
  );
}

function getCategoryTitle(category: AdminCategoryId): string {
  const titles: Record<AdminCategoryId, string> = {
    overview: 'Tableau de bord',
    orders: 'Commandes',
    users: 'Utilisateurs',
    metrics: 'Métriques Business',
    settings: 'Paramètres',
  };
  return titles[category] || 'Tableau de bord';
}
