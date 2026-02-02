/**
 * Welcome Page Component
 * Displays a full welcome page after successful authentication
 */

import { useAuth } from '../hooks/useAuth';

interface WelcomePageProps {
  onContinue?: () => void;
}

export function WelcomePage({ onContinue }: WelcomePageProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isGoogleUser = user.email?.includes('@gmail.com') || user.googleId;
  const loginDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getRoleLabel = (role: string) => {
    const roles: Record<string, { label: string; color: string; icon: string }> = {
      admin: { label: 'Administrateur', color: '#dc3545', icon: '👑' },
      manager: { label: 'Manager', color: '#fd7e14', icon: '📊' },
      employee: { label: 'Employé', color: '#0d6efd', icon: '👔' },
      client: { label: 'Client', color: '#198754', icon: '🍽️' },
    };
    return roles[role] || { label: role, color: '#6c757d', icon: '👤' };
  };

  const roleInfo = getRoleLabel(user.role || 'client');

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Success Banner */}
        <div style={styles.successBanner}>
          <div style={styles.checkmark}>✓</div>
          <h1 style={styles.title}>Connexion réussie !</h1>
        </div>

        {/* User Profile Section */}
        <div style={styles.profileSection}>
          <div style={styles.avatarContainer}>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
              </div>
            )}
            {isGoogleUser && (
              <div style={styles.googleBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
            )}
          </div>

          <h2 style={styles.userName}>
            Bienvenue, {user.firstName || user.email?.split('@')[0]} !
          </h2>
          
          <p style={styles.userEmail}>{user.email}</p>

          <div style={{ ...styles.roleBadge, backgroundColor: roleInfo.color }}>
            <span>{roleInfo.icon}</span>
            <span>{roleInfo.label}</span>
          </div>
        </div>

        {/* Session Details */}
        <div style={styles.detailsSection}>
          <h3 style={styles.sectionTitle}>📋 Détails de la session</h3>
          
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>ID Utilisateur</span>
            <span style={styles.detailValue}>#{user.id}</span>
          </div>
          
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Méthode de connexion</span>
            <span style={styles.detailValue}>
              {isGoogleUser ? '🔐 Google OAuth' : '📧 Email/Mot de passe'}
            </span>
          </div>
          
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Date de connexion</span>
            <span style={styles.detailValue}>{loginDate}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Statut</span>
            <span style={{ ...styles.detailValue, color: '#198754' }}>
              ✅ Session active
            </span>
          </div>
        </div>

        {/* Token Info (collapsible) */}
        <details style={styles.tokenSection}>
          <summary style={styles.tokenSummary}>🔑 Token d'accès (développeur)</summary>
          <div style={styles.tokenContent}>
            <code style={styles.tokenCode}>
              {user.accessToken?.substring(0, 50)}...
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(user.accessToken || '')}
              style={styles.copyButton}
            >
              📋 Copier
            </button>
          </div>
        </details>

        {/* Action Buttons */}
        <div style={styles.actions}>
          {onContinue && (
            <button onClick={onContinue} style={styles.primaryButton}>
              🏠 Continuer vers l'application
            </button>
          )}
          
          <button onClick={logout} style={styles.secondaryButton}>
            🚪 Se déconnecter
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>Vite Gourmand - Restaurant gastronomique</p>
          <p style={styles.footerSmall}>
            Votre session est sécurisée et chiffrée
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%',
    overflow: 'hidden',
  },
  successBanner: {
    background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)',
    padding: '30px',
    textAlign: 'center',
    color: 'white',
  },
  checkmark: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    margin: '0 auto 15px',
    animation: 'pulse 2s infinite',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  profileSection: {
    padding: '30px',
    textAlign: 'center',
    borderBottom: '1px solid #eee',
  },
  avatarContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '15px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '3px solid #198754',
  },
  avatarPlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#198754',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 600,
  },
  googleBadge: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  userName: {
    margin: '0 0 5px',
    fontSize: '22px',
    color: '#212529',
  },
  userEmail: {
    margin: '0 0 15px',
    color: '#6c757d',
    fontSize: '14px',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
  },
  detailsSection: {
    padding: '20px 30px',
    borderBottom: '1px solid #eee',
  },
  sectionTitle: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#495057',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f1f1',
  },
  detailLabel: {
    color: '#6c757d',
    fontSize: '14px',
  },
  detailValue: {
    color: '#212529',
    fontSize: '14px',
    fontWeight: 500,
  },
  tokenSection: {
    padding: '15px 30px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa',
  },
  tokenSummary: {
    cursor: 'pointer',
    color: '#6c757d',
    fontSize: '14px',
    padding: '5px 0',
  },
  tokenContent: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tokenCode: {
    backgroundColor: '#212529',
    color: '#20c997',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '11px',
    wordBreak: 'break-all',
  },
  copyButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    alignSelf: 'flex-start',
  },
  actions: {
    padding: '20px 30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  primaryButton: {
    backgroundColor: '#198754',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#dc3545',
    border: '1px solid #dc3545',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  footer: {
    padding: '20px 30px',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    fontSize: '13px',
  },
  footerSmall: {
    fontSize: '11px',
    marginTop: '5px',
    color: '#adb5bd',
  },
};

export default WelcomePage;
