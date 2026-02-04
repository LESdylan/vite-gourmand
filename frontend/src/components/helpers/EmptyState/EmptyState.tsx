/**
 * EmptyState - Placeholder for empty content areas
 * Used when no data is available to display
 */

import './EmptyState.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <EmptyStateIcon icon={icon} />}
      <EmptyStateContent title={title} description={description} />
      {action && <EmptyStateAction action={action} />}
    </div>
  );
}

function EmptyStateIcon({ icon }: { icon: React.ReactNode }) {
  return <div className="empty-state-icon">{icon}</div>;
}

function EmptyStateContent({ title, description }: { title: string; description?: string }) {
  return (
    <div className="empty-state-content">
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
    </div>
  );
}

function EmptyStateAction({ action }: { action: React.ReactNode }) {
  return <div className="empty-state-action">{action}</div>;
}
