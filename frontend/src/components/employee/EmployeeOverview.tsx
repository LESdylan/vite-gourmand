/**
 * EmployeeOverview - Dashboard overview for employee role
 */

import './EmployeeWidgets.css';

export function EmployeeOverview() {
  return (
    <div className="employee-widget">
      <header className="widget-header">
        <h2>👋 Bonjour, Jean</h2>
        <p className="widget-subtitle">Votre espace de travail</p>
      </header>

      <div className="widget-grid">
        <QuickStat icon="📋" label="Commandes à traiter" value="5" highlight />
        <QuickStat icon="✅" label="Commandes livrées" value="12" />
        <QuickStat icon="⏱️" label="Temps moyen" value="8 min" />
        <QuickStat icon="⭐" label="Note du jour" value="4.9" />
      </div>

      <section className="widget-section">
        <h3>🚨 Commandes urgentes</h3>
        <div className="urgent-orders">
          <UrgentOrder id="#1234" table="Table 5" time="5 min" items={3} />
          <UrgentOrder id="#1235" table="Table 2" time="3 min" items={2} />
        </div>
      </section>

      <section className="widget-section">
        <h3>📝 Mes tâches du jour</h3>
        <div className="task-preview">
          <TaskItem label="Mise en place salle" done />
          <TaskItem label="Vérifier stocks" done={false} />
          <TaskItem label="Nettoyage fin de service" done={false} />
        </div>
      </section>
    </div>
  );
}

function QuickStat({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`quick-stat ${highlight ? 'quick-stat--highlight' : ''}`}>
      <span className="quick-stat-icon">{icon}</span>
      <span className="quick-stat-value">{value}</span>
      <span className="quick-stat-label">{label}</span>
    </div>
  );
}

function UrgentOrder({ id, table, time, items }: { id: string; table: string; time: string; items: number }) {
  return (
    <div className="urgent-order">
      <div className="urgent-order-info">
        <span className="urgent-order-id">{id}</span>
        <span className="urgent-order-table">{table}</span>
        <span className="urgent-order-items">{items} articles</span>
      </div>
      <div className="urgent-order-time">⏱️ {time}</div>
      <button className="btn-action">Prendre en charge</button>
    </div>
  );
}

function TaskItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`task-item ${done ? 'task-item--done' : ''}`}>
      <span className="task-check">{done ? '✅' : '⬜'}</span>
      <span className="task-label">{label}</span>
    </div>
  );
}
