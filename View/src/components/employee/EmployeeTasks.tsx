/**
 * EmployeeTasks - Task management for employee role
 */

import './EmployeeWidgets.css';

export function EmployeeTasks() {
  return (
    <div className="employee-widget">
      <header className="widget-header">
        <div className="widget-header-content">
          <h2>📝 Mes Tâches</h2>
          <p className="widget-subtitle">Liste des tâches à accomplir</p>
        </div>
        <button className="btn btn-primary">+ Nouvelle tâche</button>
      </header>

      <div className="quick-stats-grid">
        <div className="quick-stat quick-stat--warning">
          <div className="quick-stat-icon">📋</div>
          <span className="quick-stat-value">3</span>
          <span className="quick-stat-label">À faire</span>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon">✅</div>
          <span className="quick-stat-value">5</span>
          <span className="quick-stat-label">Terminées</span>
        </div>
        <div className="quick-stat quick-stat--highlight">
          <div className="quick-stat-icon">📊</div>
          <span className="quick-stat-value">62%</span>
          <span className="quick-stat-label">Progression</span>
        </div>
      </div>

      <section className="widget-section">
        <div className="widget-section-header">
          <h3>🔴 Tâches urgentes</h3>
        </div>
        <div className="task-list">
          <TaskCard title="Réapprovisionner desserts" priority="high" dueTime="Avant 14h" />
        </div>
      </section>

      <section className="widget-section">
        <div className="widget-section-header">
          <h3>📋 À faire</h3>
        </div>
        <div className="task-list">
          <TaskCard title="Mise en place tables 1-5" priority="medium" dueTime="Midi" />
          <TaskCard title="Vérifier réservations du soir" priority="medium" dueTime="16h" />
          <TaskCard title="Nettoyage fin de service" priority="low" dueTime="Fermeture" />
        </div>
      </section>

      <section className="widget-section">
        <div className="widget-section-header">
          <h3>✅ Terminées</h3>
        </div>
        <div className="task-list">
          <TaskCard title="Ouverture caisse" priority="low" dueTime="Terminé à 11h30" done />
          <TaskCard title="Inventaire boissons" priority="low" dueTime="Terminé à 11h45" done />
        </div>
      </section>
    </div>
  );
}

interface TaskCardProps {
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueTime: string;
  done?: boolean;
}

function TaskCard({ title, priority, dueTime, done }: TaskCardProps) {
  return (
    <div className={`task-item ${done ? 'task-item--done' : ''}`}>
      <div className="task-checkbox">{done ? '✓' : ''}</div>
      <span className="task-label">{title}</span>
      <span className={`task-priority task-priority--${done ? 'low' : priority}`}>
        {done ? 'Fait' : dueTime}
      </span>
      {!done && <button className="btn btn-sm btn-primary">Terminer</button>}
    </div>
  );
}
