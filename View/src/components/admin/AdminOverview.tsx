/**
 * AdminOverview - Dashboard overview for admin role
 */

import './AdminWidgets.css';

export function AdminOverview() {
  return (
    <div className="admin-widget">
      <header className="widget-header">
        <div className="widget-header-content">
          <h2>📊 Tableau de bord</h2>
          <p className="widget-subtitle">Vue d'ensemble du restaurant</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard icon="🛒" label="Commandes du jour" value="24" trend="+12%" />
        <StatCard
          icon="💰"
          label="Chiffre d'affaires"
          value="1,245€"
          trend="+8%"
          variant="success"
        />
        <StatCard icon="👥" label="Clients servis" value="89" trend="+5%" />
        <StatCard icon="⭐" label="Note moyenne" value="4.7" trend="+0.2" variant="warning" />
      </div>

      <section className="widget-section">
        <div className="widget-section-header">
          <h3>📋 Commandes récentes</h3>
          <button className="btn btn-secondary btn-sm">Voir tout →</button>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Table</th>
              <th>Statut</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <OrderRow id="#1234" status="en-cours" table="Table 5" total="45.50€" />
            <OrderRow id="#1233" status="prêt" table="Table 2" total="32.00€" />
            <OrderRow id="#1232" status="livré" table="Table 8" total="67.20€" />
          </tbody>
        </table>
      </section>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  trend: string;
  variant?: 'warning' | 'success' | 'error';
}

function StatCard({ icon, label, value, trend, variant }: StatCardProps) {
  const isPositive = trend.startsWith('+');
  return (
    <div className={`stat-card ${variant ? `stat-card--${variant}` : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        <span className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>{trend}</span>
      </div>
    </div>
  );
}

function OrderRow({
  id,
  status,
  table,
  total,
}: {
  id: string;
  status: string;
  table: string;
  total: string;
}) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    'en-cours': { label: 'En préparation', className: 'order-card-badge--progress' },
    prêt: { label: 'Prêt', className: 'order-card-badge--ready' },
    livré: { label: 'Livré', className: 'order-card-badge--pending' },
  };
  const config = statusConfig[status] || statusConfig['en-cours'];
  return (
    <tr>
      <td>
        <strong>{id}</strong>
      </td>
      <td>{table}</td>
      <td>
        <span className={`order-card-badge ${config.className}`}>{config.label}</span>
      </td>
      <td>
        <strong>{total}</strong>
      </td>
    </tr>
  );
}
