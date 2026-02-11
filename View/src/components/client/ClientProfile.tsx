/**
 * ClientProfile - Profile editing & address management
 * Uses PUT /api/users/me, GET /api/users/me/addresses (existing backend)
 */

import { useState, useEffect } from 'react';
import { usePortalAuth } from '../../portal_dashboard';
import { apiRequest } from '../../services/api';
import './ClientWidgets.css';

interface UserProfile {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
}

interface Address {
  id: number;
  label: string;
  address: string;
  city: string;
  postal_code: string;
  is_default: boolean;
}

export function ClientProfile() {
  const { user } = usePortalAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const [profileRes, addrRes] = await Promise.all([
          apiRequest<{ data: UserProfile }>('/api/users/me'),
          apiRequest<{ data: Address[] }>('/api/users/me/addresses').catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setAddresses(Array.isArray(addrRes.data) ? addrRes.data : []);
        setForm({
          first_name: profileRes.data.first_name || '',
          last_name: profileRes.data.last_name || '',
          phone: profileRes.data.phone || '',
          city: profileRes.data.city || '',
          address: profileRes.data.address || '',
        });
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiRequest<{ data: UserProfile }>('/api/users/me', {
        method: 'PUT',
        body: form,
      });
      setProfile(res.data);
      setEditing(false);
      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="client-widget">
        <div className="client-loading">
          <div className="client-loading-spinner" />
          <p>Chargement du profil…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-widget">
      <header className="widget-header">
        <div className="widget-header-content">
          <h2>👤 Mon Profil</h2>
          <p className="widget-subtitle">Informations personnelles et adresses</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            ✏️ Modifier
          </button>
        )}
      </header>

      {success && (
        <div className="client-success-banner">{success}</div>
      )}

      {/* Profile Card */}
      <div className="profile-hero">
        <div className="profile-avatar-large">
          {getInitials(profile?.first_name, profile?.last_name, user?.name)}
        </div>
        <div className="profile-hero-info">
          <h3 className="profile-hero-name">
            {profile?.first_name || profile?.last_name
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
              : user?.name || 'Client'}
          </h3>
          <span className="profile-hero-email">📧 {profile?.email || user?.email}</span>
          <span className="profile-hero-since">
            📅 Membre depuis {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              : 'récemment'}
          </span>
        </div>
      </div>

      {/* Edit Form or Display */}
      {editing ? (
        <form className="profile-edit-form" onSubmit={handleSave}>
          <div className="client-form-row">
            <div className="client-form-group">
              <label className="client-label" htmlFor="profile-firstname">Prénom</label>
              <input
                id="profile-firstname"
                className="client-input"
                type="text"
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                placeholder="Votre prénom"
              />
            </div>
            <div className="client-form-group">
              <label className="client-label" htmlFor="profile-lastname">Nom</label>
              <input
                id="profile-lastname"
                className="client-input"
                type="text"
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="client-form-row">
            <div className="client-form-group">
              <label className="client-label" htmlFor="profile-phone">Téléphone</label>
              <input
                id="profile-phone"
                className="client-input"
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="client-form-group">
              <label className="client-label" htmlFor="profile-city">Ville</label>
              <input
                id="profile-city"
                className="client-input"
                type="text"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="Votre ville"
              />
            </div>
          </div>

          <div className="client-form-group">
            <label className="client-label" htmlFor="profile-address">Adresse</label>
            <input
              id="profile-address"
              className="client-input"
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Votre adresse principale"
            />
          </div>

          <div className="profile-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : '💾 Enregistrer'}
            </button>
          </div>
        </form>
      ) : (
        <section className="widget-section">
          <div className="widget-section-header">
            <h3>📋 Informations</h3>
          </div>
          <div className="profile-fields">
            <ProfileField label="Prénom" value={profile?.first_name} />
            <ProfileField label="Nom" value={profile?.last_name} />
            <ProfileField label="Email" value={profile?.email} />
            <ProfileField label="Téléphone" value={profile?.phone} />
            <ProfileField label="Ville" value={profile?.city} />
            <ProfileField label="Adresse" value={profile?.address} />
          </div>
        </section>
      )}

      {/* Saved Addresses */}
      <section className="widget-section">
        <div className="widget-section-header">
          <h3>📍 Adresses enregistrées</h3>
        </div>
        {addresses.length === 0 ? (
          <p className="widget-subtitle">Aucune adresse enregistrée. Elles seront ajoutées lors de vos commandes.</p>
        ) : (
          <div className="profile-addresses-grid">
            {addresses.map(addr => (
              <div key={addr.id} className={`profile-address-card ${addr.is_default ? 'profile-address-card--default' : ''}`}>
                <div className="profile-address-header">
                  <span className="profile-address-label">{addr.label || 'Adresse'}</span>
                  {addr.is_default && <span className="profile-default-badge">Par défaut</span>}
                </div>
                <p className="profile-address-text">
                  {addr.address}<br />
                  {addr.postal_code} {addr.city}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Danger Zone */}
      <section className="widget-section profile-danger-zone">
        <div className="widget-section-header">
          <h3>⚠️ Zone de danger</h3>
        </div>
        <p className="widget-subtitle">Actions irréversibles sur votre compte.</p>
        <button className="btn btn-danger btn-sm" onClick={() => {
          if (globalThis.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
            apiRequest('/api/users/me', { method: 'DELETE' }).then(() => {
              globalThis.location.href = '/portal';
            });
          }
        }}>
          🗑️ Supprimer mon compte
        </button>
      </section>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <span className="profile-field-value">{value || '—'}</span>
    </div>
  );
}

function getInitials(first?: string | null, last?: string | null, name?: string): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return '👤';
}
