/**
 * AdminOverview - Dashboard overview for admin role
 */

import './AdminWidgets.css';

export function AdminOverview() {
  return (
    <div className="admin-widget">
      <header className="widget-header">
        <h2>📊 Tableau de bord</h2>
        <p className="widget-subtitle">Vue d'ensemble du restaurant</p>
      </header>
      
      <div className="widget-grid">
        <StatCard icon="🛒" label="Commandes du jour" value="24" trend="+12%" />
        <StatCard icon="💰" label="Chiffre d'affaires" value="1,245€" trend="+8%" />
        <StatCard icon="👥" label="Clients servis" value="89" trend="+5%" />
        <StatCard icon="⭐" label="Note moyenne" value="4.7" trend="+0.2" />
      </div>

      <section className="widget-section">
        <h3>Commandes récentes</h3>
        <div className="widget-list">
          <OrderItem id="#1234" status="en-cours" table="Table 5" total="45.50€" />
          <OrderItem id="#1233" status="prêt" table="Table 2" total="32.00€" />
          <OrderItem id="#1232" status="livré" table="Table 8" total="67.20€" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: string; label: string; value: string; trend: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
      <span className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>{trend}</span>
    </div>
  );
}

function OrderItem({ id, status, table, total }: { id: string; status: string; table: string; total: string }) {
  const statusColors: Record<string, string> = {
    'en-cours': 'warning',
    'prêt': 'success',
    'livré': 'muted',
  };
  return (
    <div className="order-item">
      <span className="order-id">{id}</span>
      <span className={`order-status status-${statusColors[status]}`}>{status}</span>
      <span className="order-table">{table}</span>
      <span className="order-total">{total}</span>
    </div>
  );
}
