/**
 * StatusBadge - Displays test/task status
 * Used for showing idle, running, success, failed states
 */

import './StatusBadge.css';

export type BadgeStatus = 'idle' | 'running' | 'success' | 'failed' | 'pending';

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<BadgeStatus, { label: string; icon: string }> = {
  idle: { label: 'En attente', icon: '○' },
  running: { label: 'En cours', icon: '◎' },
  success: { label: 'Réussi', icon: '✓' },
  failed: { label: 'Échoué', icon: '✕' },
  pending: { label: 'En suspens', icon: '◔' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const classes = buildClasses(status, size);
  
  return (
    <span className={classes} role="status">
      <span className="status-badge-icon" aria-hidden="true">{config.icon}</span>
      <span className="status-badge-label">{config.label}</span>
    </span>
  );
}

function buildClasses(status: BadgeStatus, size: string): string {
  return ['status-badge', `status-badge-${status}`, `status-badge-${size}`].join(' ');
}
