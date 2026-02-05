/**
 * EmployeeTasks - Task management for employee role
 */

import './EmployeeWidgets.css';

export function EmployeeTasks() {
  return (
    <div className="employee-widget">
      <header className="widget-header">
        <h2>📝 Mes Tâches</h2>
        <p className="widget-subtitle">Liste des tâches à accomplir</p>
      </header>

      <div className="tasks-summary">
        <div className="task-stat">
          <span className="task-stat-value">3</span>
          <span className="task-stat-label">À faire</span>
        </div>
        <div className="task-stat">
          <span className="task-stat-value">5</span>
          <span className="task-stat-label">Terminées</span>
        </div>
        <div className="task-stat">
          <span className="task-stat-value">62%</span>
          <span className="task-stat-label">Progression</span>
        </div>
      </div>

      <div className="tasks-list">
        <TaskSection title="🔴 Urgent">
          <TaskCard 
            title="Réapprovisionner desserts" 
            priority="high"
            dueTime="Avant 14h"
          />
        </TaskSection>

        <TaskSection title="📋 À faire">
          <TaskCard 
            title="Mise en place tables 1-5" 
            priority="medium"
            dueTime="Midi"
          />
          <TaskCard 
            title="Vérifier réservations du soir" 
            priority="medium"
            dueTime="16h"
          />
          <TaskCard 
            title="Nettoyage fin de service" 
            priority="low"
            dueTime="Fermeture"
          />
        </TaskSection>

        <TaskSection title="✅ Terminées">
          <TaskCard 
            title="Ouverture caisse" 
            priority="done"
            dueTime="Terminé à 11h30"
            done
          />
          <TaskCard 
            title="Inventaire boissons" 
            priority="done"
            dueTime="Terminé à 11h45"
            done
          />
        </TaskSection>
      </div>
    </div>
  );
}

function TaskSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="task-section">
      <h3 className="task-section-title">{title}</h3>
      <div className="task-section-items">{children}</div>
    </section>
  );
}

interface TaskCardProps {
  title: string;
  priority: 'high' | 'medium' | 'low' | 'done';
  dueTime: string;
  done?: boolean;
}

function TaskCard({ title, priority, dueTime, done }: TaskCardProps) {
  return (
    <div className={`task-card task-card--${priority} ${done ? 'task-card--done' : ''}`}>
      <div className="task-card-check">
        <input type="checkbox" checked={done} readOnly />
      </div>
      <div className="task-card-content">
        <span className="task-card-title">{title}</span>
        <span className="task-card-time">{dueTime}</span>
      </div>
      {!done && (
        <button className="task-card-action">Terminer</button>
      )}
    </div>
  );
}
