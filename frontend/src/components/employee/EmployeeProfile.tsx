/**
 * EmployeeProfile - Profile settings for employee role
 */

import './EmployeeWidgets.css';

export function EmployeeProfile() {
  return (
    <div className="employee-widget">
      <header className="widget-header">
        <h2>👤 Mon Profil</h2>
        <p className="widget-subtitle">Informations personnelles et préférences</p>
      </header>

      <div className="profile-card">
        <div className="profile-avatar">👷</div>
        <div className="profile-info">
          <h3 className="profile-name">Jean Dupont</h3>
          <span className="profile-role">Serveur</span>
          <span className="profile-since">Depuis le 15 mars 2024</span>
        </div>
      </div>

      <div className="profile-sections">
        <ProfileSection title="Informations personnelles">
          <ProfileField label="Email" value="jean.dupont@vitegourmand.fr" />
          <ProfileField label="Téléphone" value="06 12 34 56 78" />
          <ProfileField label="Adresse" value="123 Rue des Lilas, Paris" />
        </ProfileSection>

        <ProfileSection title="Horaires habituels">
          <ProfileField label="Lundi" value="11h - 15h / 18h - 22h" />
          <ProfileField label="Mardi" value="11h - 15h / 18h - 22h" />
          <ProfileField label="Mercredi" value="Repos" />
          <ProfileField label="Jeudi" value="11h - 15h / 18h - 22h" />
          <ProfileField label="Vendredi" value="11h - 15h / 18h - 23h" />
          <ProfileField label="Samedi" value="11h - 15h / 18h - 23h" />
          <ProfileField label="Dimanche" value="Repos" />
        </ProfileSection>

        <ProfileSection title="Statistiques du mois">
          <ProfileStat label="Commandes servies" value="245" />
          <ProfileStat label="Heures travaillées" value="142h" />
          <ProfileStat label="Note moyenne" value="4.8/5" />
          <ProfileStat label="Pourboires" value="187€" />
        </ProfileSection>

        <ProfileSection title="Préférences">
          <ProfileToggle label="Notifications push" checked />
          <ProfileToggle label="Rappels de tâches" checked />
          <ProfileToggle label="Mode sombre" checked={false} />
        </ProfileSection>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="profile-section">
      <h3 className="profile-section-title">{title}</h3>
      <div className="profile-section-content">{children}</div>
    </section>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <span className="profile-field-value">{value}</span>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-stat">
      <span className="profile-stat-value">{value}</span>
      <span className="profile-stat-label">{label}</span>
    </div>
  );
}

function ProfileToggle({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="profile-toggle">
      <span className="profile-toggle-label">{label}</span>
      <label className="toggle">
        <input type="checkbox" defaultChecked={checked} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}
