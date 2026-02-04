/**
 * TypeBadge - Displays test type (automatic/manual)
 * Used for categorizing tests visually
 */

import './TypeBadge.css';

export type TestTypeVariant = 'automatic' | 'manual' | 'api' | 'database' | 'security' | 'scenario';

interface TypeBadgeProps {
  type: TestTypeVariant;
  size?: 'sm' | 'md';
}

const TYPE_CONFIG: Record<TestTypeVariant, { label: string; icon: string }> = {
  automatic: { label: 'Auto', icon: '⚡' },
  manual: { label: 'Manuel', icon: '👤' },
  api: { label: 'API', icon: '🔌' },
  database: { label: 'BDD', icon: '💾' },
  security: { label: 'Sécurité', icon: '🔒' },
  scenario: { label: 'Scénario', icon: '🎬' },
};

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type];
  const classes = buildClasses(type, size);
  
  return (
    <span className={classes}>
      <span className="type-badge-icon" aria-hidden="true">{config.icon}</span>
      <span className="type-badge-label">{config.label}</span>
    </span>
  );
}

function buildClasses(type: TestTypeVariant, size: string): string {
  return ['type-badge', `type-badge-${type}`, `type-badge-${size}`].join(' ');
}
