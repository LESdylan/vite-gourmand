/**
 * RoleInfoWidget — Department, position, joinedAt, lastActive
 * Visible: admin/employee roles
 */

import type { ProfileWidgetProps } from '../types';
import { WidgetCard } from './WidgetCard';

export function RoleInfoWidget({ profile }: ProfileWidgetProps) {
  return (
    <WidgetCard icon="🛠️" title="Informations professionnelles">
      <div className="up-field-list">
        {profile.department && <Field label="Département" value={profile.department} />}
        {profile.position && <Field label="Poste" value={profile.position} />}
        <Field label="Depuis le" value={formatDate(profile.joinedAt)} />
        <Field label="Dernière activité" value={formatDate(profile.lastActive)} />
      </div>
    </WidgetCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="up-field">
      <span className="up-field-label">{label}</span>
      <span className="up-field-value">{value}</span>
    </div>
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
