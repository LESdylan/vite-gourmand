/**
 * AdminSettings - Settings panel for admin role
 */

import './AdminWidgets.css';

export function AdminSettings() {
  return (
    <div className="admin-widget">
      <header className="widget-header">
        <h2>⚙️ Paramètres</h2>
        <p className="widget-subtitle">Configuration du restaurant</p>
      </header>

      <div className="settings-sections">
        <SettingsSection title="Restaurant">
          <SettingItem label="Nom du restaurant" value="Vite Gourmand" type="text" />
          <SettingItem label="Adresse" value="123 Rue de la Cuisine, Paris" type="text" />
          <SettingItem label="Téléphone" value="01 23 45 67 89" type="text" />
        </SettingsSection>

        <SettingsSection title="Horaires">
          <SettingItem label="Ouverture" value="11:30" type="time" />
          <SettingItem label="Fermeture" value="22:30" type="time" />
          <SettingToggle label="Ouvert le dimanche" checked={false} />
        </SettingsSection>

        <SettingsSection title="Commandes">
          <SettingToggle label="Commandes en ligne" checked={true} />
          <SettingToggle label="Livraison" checked={true} />
          <SettingToggle label="Click & Collect" checked={true} />
          <SettingItem label="Délai minimum (min)" value="30" type="number" />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingToggle label="Nouvelles commandes" checked={true} />
          <SettingToggle label="Alertes stock" checked={true} />
          <SettingToggle label="Avis clients" checked={false} />
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="settings-section">
      <h3 className="settings-section-title">{title}</h3>
      <div className="settings-items">{children}</div>
    </section>
  );
}

function SettingItem({ label, value, type }: { label: string; value: string; type: string }) {
  return (
    <div className="setting-item">
      <label className="setting-label">{label}</label>
      <input className="setting-input" type={type} defaultValue={value} />
    </div>
  );
}

function SettingToggle({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="setting-item">
      <label className="setting-label">{label}</label>
      <label className="toggle">
        <input type="checkbox" defaultChecked={checked} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}
