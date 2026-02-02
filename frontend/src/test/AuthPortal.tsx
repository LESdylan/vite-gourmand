/**
 * Auth Portal - Main Component
 * Complete authentication portal with all forms
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { GoogleLoginButton } from './components/GoogleLoginButton';
import { WelcomePage } from './components/WelcomePage';
import './styles/auth-portal.css';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface AuthPortalContentProps {
  onBack?: () => void;
}

function AuthPortalContent({ onBack }: AuthPortalContentProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [resetEmail, setResetEmail] = useState('');
  
  // Handle reset email sent
  const handleResetSent = (email: string) => {
    setResetEmail(email);
    setCurrentView('reset-password');
  };

  // Loading state
  if (isLoading && !user) {
    return (
      <div className="auth-portal">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>🍽️ Vite Gourmand</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner-border" role="status" style={{ color: '#764ba2' }}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p style={{ marginTop: '16px', color: '#666' }}>Vérification de la session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Logged in state - show full welcome page
  if (isAuthenticated && user) {
    return <WelcomePage onContinue={onBack} />;
  }

  // Auth forms
  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <>
            <div className="auth-title">
              <h2>Connexion</h2>
              <p>Accédez à votre espace client</p>
            </div>

            <GoogleLoginButton />

            <div className="auth-divider">
              <span>ou par email</span>
            </div>

            <LoginForm
              onForgotPassword={() => setCurrentView('forgot-password')}
              onRegister={() => setCurrentView('register')}
            />
          </>
        );

      case 'register':
        return (
          <>
            <div className="auth-title">
              <h2>Créer un compte</h2>
              <p>Rejoignez Vite Gourmand</p>
            </div>

            <GoogleLoginButton />

            <div className="auth-divider">
              <span>ou par email</span>
            </div>

            <RegisterForm onLogin={() => setCurrentView('login')} />
          </>
        );

      case 'forgot-password':
        return (
          <>
            <div className="auth-title">
              <h2>Mot de passe oublié</h2>
              <p>Réinitialisez votre mot de passe</p>
            </div>

            <ForgotPasswordForm
              onBack={() => setCurrentView('login')}
              onResetSent={handleResetSent}
            />
          </>
        );

      case 'reset-password':
        return (
          <>
            <div className="auth-title">
              <h2>Nouveau mot de passe</h2>
              <p>Choisissez un nouveau mot de passe sécurisé</p>
            </div>

            <ResetPasswordForm
              email={resetEmail}
              onSuccess={() => setCurrentView('login')}
              onBack={() => setCurrentView('login')}
            />
          </>
        );
    }
  };

  return (
    <div className="auth-portal">
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
      )}
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🍽️ Vite Gourmand</h1>
          <p className="subtitle">Traiteur d'exception</p>
        </div>

        {renderView()}
      </div>
    </div>
  );
}

// Main exported component with provider
interface AuthPortalProps {
  onBack?: () => void;
}

export function AuthPortal({ onBack }: AuthPortalProps) {
  return (
    <AuthProvider>
      <AuthPortalContent onBack={onBack} />
    </AuthProvider>
  );
}
