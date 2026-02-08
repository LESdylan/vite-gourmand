/**
 * StatsWidget — Detailed stats (orders, hours, rating, tasks, completion)
 * Visible: all roles, but fields may be hidden by role
 */

import type { ProfileWidgetProps } from '../types';
import { WidgetCard } from './WidgetCard';

export function StatsWidget({ profile }: ProfileWidgetProps) {
  const s = profile.stats;
  return (
    <WidgetCard icon="📊" title="Statistiques">
      <div className="up-stats-list">
        <Stat label="Commandes" value={s.ordersHandled} icon="🍽️" />
        <Stat label="Heures" value={s.hoursWorked + 'h'} icon="⏱️" />
        <Stat label="Note" value={s.averageRating.toFixed(1)} icon="⭐" />
        <Stat label="Tâches" value={s.tasksCompleted} icon="📝" />
        <Stat label="Complétion" value={s.completionRate + '%'} icon="✅" />
      </div>
    </WidgetCard>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="up-stat">
      <span className="up-stat-icon">{icon}</span>
      <span className="up-stat-value">{value}</span>
      <span className="up-stat-label">{label}</span>
    </div>
  );
}
