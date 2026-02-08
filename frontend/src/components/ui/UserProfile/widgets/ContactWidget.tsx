/**
 * ContactWidget — Email, phone, address, city
 * Visible: self always, admins viewing staff, superadmin viewing anyone
 */

import type { ProfileWidgetProps } from '../types';
import { WidgetCard } from './WidgetCard';

export function ContactWidget({ profile }: ProfileWidgetProps) {
  return (
    <WidgetCard icon="📞" title="Contact">
      <div className="up-field-list">
        <Field label="Email" value={profile.email} />
        {profile.phone && <Field label="Téléphone" value={profile.phone} />}
        {profile.city && <Field label="Ville" value={profile.city} />}
        {profile.country && <Field label="Pays" value={profile.country} />}
        {profile.postalAddress && <Field label="Adresse" value={profile.postalAddress} />}
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
