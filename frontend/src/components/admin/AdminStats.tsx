/**
 * AdminStats - Statistics dashboard for admin role
 */

import './AdminWidgets.css';

export function AdminStats() {
  return (
    <div className="admin-widget">
      <header className="widget-header">
        <h2>📈 Statistiques</h2>
        <p className="widget-subtitle">Analyse des performances</p>
      </header>

      <div className="stats-period">
        <button className="period-btn">Jour</button>
        <button className="period-btn active">Semaine</button>
        <button className="period-btn">Mois</button>
        <button className="period-btn">Année</button>
      </div>

      <div className="widget-grid">
        <StatBox label="Chiffre d'affaires" value="8,450€" change="+15%" icon="💰" />
        <StatBox label="Commandes" value="187" change="+8%" icon="📦" />
        <StatBox label="Panier moyen" value="45.20€" change="+3%" icon="🛒" />
        <StatBox label="Nouveaux clients" value="23" change="+12%" icon="👤" />
      </div>

      <section className="widget-section">
        <h3>Top 5 des plats</h3>
        <div className="ranking-list">
          <RankingItem rank={1} name="Pizza Margherita" count={45} />
          <RankingItem rank={2} name="Burger Gourmet" count={38} />
          <RankingItem rank={3} name="Salade César" count={32} />
          <RankingItem rank={4} name="Pâtes Carbonara" count={28} />
          <RankingItem rank={5} name="Tiramisu" count={24} />
        </div>
      </section>
    </div>
  );
}

function StatBox({ label, value, change, icon }: { label: string; value: string; change: string; icon: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="stat-box">
      <div className="stat-box-icon">{icon}</div>
      <div className="stat-box-content">
        <span className="stat-box-value">{value}</span>
        <span className="stat-box-label">{label}</span>
      </div>
      <span className={`stat-box-change ${isPositive ? 'positive' : 'negative'}`}>{change}</span>
    </div>
  );
}

function RankingItem({ rank, name, count }: { rank: number; name: string; count: number }) {
  return (
    <div className="ranking-item">
      <span className="ranking-position">#{rank}</span>
      <span className="ranking-name">{name}</span>
      <span className="ranking-count">{count} vendus</span>
    </div>
  );
}
