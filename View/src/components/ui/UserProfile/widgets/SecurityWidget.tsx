/**
 * SecurityWidget — GDPR, marketing consent, account created/updated
 * Visible: self, admin, superadmin
 */

import type { ProfileWidgetProps } from '../types';
import { WidgetCard } from './WidgetCard';

export function SecurityWidget({ profile }: ProfileWidgetProps) {
  return (
    <WidgetCard icon="🔒" title="Sécurité & RGPD">
      <div className="up-field-list">
        <Field label="Consentement RGPD" value={profile.gdprConsent ? 'Oui' : 'Non'} />
        {profile.gdprConsentDate && (
          <Field label="Date consentement" value={formatDate(profile.gdprConsentDate)} />
        )}
        <Field label="Consentement marketing" value={profile.marketingConsent ? 'Oui' : 'Non'} />
        <Field label="Compte créé" value={formatDate(profile.createdAt)} />
        <Field label="Dernière mise à jour" value={formatDate(profile.updatedAt)} />
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
