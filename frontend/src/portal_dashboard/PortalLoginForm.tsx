/**
 * Portal Login / Register / Forgot Password Form
 * Unified form with mode switching and password validation
 * Keeps all existing auth.ts & PortalAuthContext backend logic
 */

import { useState, useEffect, useMemo } from 'react';
import { usePortalAuth } from './PortalAuthContext';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin,
  ArrowRight, CheckCircle, AlertCircle, ChevronLeft,
} from 'lucide-react';
import './PortalLogin.css';

type Mode = 'login' | 'register' | 'forgot';

/* ── Password validation (10 chars, 1 special, 1 upper, 1 lower, 1 digit) ── */
function validatePassword(pw: string) {
  return {
    minLength: pw.length >= 10,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasDigit: /\d/.test(pw),
    hasSpecial: /[^A-Za-z0-9]/.test(pw),
  };
}

function isPasswordValid(pw: string): boolean {
  const v = validatePassword(pw);
  return v.minLength && v.hasUpper && v.hasLower && v.hasDigit && v.hasSpecial;
}

export function PortalLoginForm() {
  const {
    login, register, forgotPassword, loginWithGoogle,
    rememberMeData, isLoading, error,
  } = usePortalAuth();

  const [mode, setMode] = useState<Mode>('login');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // Register fields
  const [regNom, setRegNom] = useState('');
  const [regPrenom, setRegPrenom] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot fields
  const [forgotEmail, setForgotEmail] = useState('');

  // UI state
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  // Pre-fill remember me
  useEffect(() => {
    if (rememberMeData) {
      setEmail(rememberMeData.email);
      setRemember(true);
    }
  }, [rememberMeData]);

  // Clear messages on mode change
  useEffect(() => {
    setSuccessMsg('');
    setLocalError('');
  }, [mode]);

  // Password strength
  const pwChecks = useMemo(() => validatePassword(regPassword), [regPassword]);

  /* ── Handlers ── */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password, remember);
    } catch {
      // Error is in context
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!regNom.trim() || !regPrenom.trim()) {
      setLocalError('Le nom et le prénom sont obligatoires.');
      return;
    }
    if (!isPasswordValid(regPassword)) {
      setLocalError('Le mot de passe ne respecte pas les critères de sécurité.');
      return;
    }
    if (regPassword !== regConfirm) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await register({
        email: regEmail,
        password: regPassword,
        firstName: `${regPrenom.trim()} ${regNom.trim()}`,
        telephoneNumber: regPhone || undefined,
        postalAddress: regAddress || undefined,
      });
      // On success, PortalAuthContext sets user → Portal.tsx will redirect
    } catch {
      // Error is in context
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      const msg = await forgotPassword(forgotEmail);
      setSuccessMsg(msg || 'Un email de réinitialisation a été envoyé.');
    } catch {
      setLocalError('Impossible d\'envoyer l\'email. Vérifiez votre adresse.');
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle('mock-google-credential');
  };

  const displayError = localError || error;

  /* ══════════════════════════════════════
     RENDER
     ══════════════════════════════════════ */

  return (
    <div className="pf-card">
      {/* ── Tab header ── */}
      <div className="pf-tabs">
        <button
          className={`pf-tab ${mode === 'login' ? 'pf-tab--active' : ''}`}
          onClick={() => setMode('login')}
          type="button"
        >
          Connexion
        </button>
        <button
          className={`pf-tab ${mode === 'register' ? 'pf-tab--active' : ''}`}
          onClick={() => setMode('register')}
          type="button"
        >
          Inscription
        </button>
      </div>

      <div className="pf-body">
        {/* Error */}
        {displayError && (
          <div className="pf-alert pf-alert--error">
            <AlertCircle size={16} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="pf-alert pf-alert--success">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── LOGIN MODE ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="pf-form" noValidate>
            {/* Remember me banner */}
            {rememberMeData && (
              <div className="pf-remember-banner">
                <span>👋 Bon retour, {rememberMeData.name} !</span>
                <button type="button" onClick={() => setEmail('')}>Changer</button>
              </div>
            )}

            <div className="pf-field">
              <label htmlFor="login-email" className="pf-label">
                Adresse email
              </label>
              <div className="pf-input-wrap">
                <Mail size={16} className="pf-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jean@exemple.fr"
                  required
                  autoComplete="email"
                  className="pf-input"
                />
              </div>
            </div>

            <div className="pf-field">
              <label htmlFor="login-pw" className="pf-label">
                Mot de passe
              </label>
              <div className="pf-input-wrap">
                <Lock size={16} className="pf-input-icon" />
                <input
                  id="login-pw"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  className="pf-input"
                />
                <button
                  type="button"
                  className="pf-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pf-row">
              <label className="pf-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" className="pf-link" onClick={() => setMode('forgot')}>
                Mot de passe oublié ?
              </button>
            </div>

            <button type="submit" className="pf-submit" disabled={isLoading}>
              {isLoading ? 'Connexion…' : (
                <>Se connecter <ArrowRight size={16} /></>
              )}
            </button>

            <div className="pf-divider"><span>ou</span></div>
            <GoogleBtn onClick={handleGoogleLogin} disabled={isLoading} />
          </form>
        )}

        {/* ── REGISTER MODE ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="pf-form" noValidate>
            {/* Nom + Prénom */}
            <div className="pf-row-2">
              <div className="pf-field">
                <label htmlFor="reg-prenom" className="pf-label">Prénom *</label>
                <div className="pf-input-wrap">
                  <User size={16} className="pf-input-icon" />
                  <input id="reg-prenom" type="text" value={regPrenom} onChange={e => setRegPrenom(e.target.value)} placeholder="Jean" required className="pf-input" autoComplete="given-name" />
                </div>
              </div>
              <div className="pf-field">
                <label htmlFor="reg-nom" className="pf-label">Nom *</label>
                <div className="pf-input-wrap">
                  <User size={16} className="pf-input-icon" />
                  <input id="reg-nom" type="text" value={regNom} onChange={e => setRegNom(e.target.value)} placeholder="Dupont" required className="pf-input" autoComplete="family-name" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="pf-field">
              <label htmlFor="reg-email" className="pf-label">Adresse email *</label>
              <div className="pf-input-wrap">
                <Mail size={16} className="pf-input-icon" />
                <input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="jean@exemple.fr" required className="pf-input" autoComplete="email" />
              </div>
            </div>

            {/* GSM */}
            <div className="pf-field">
              <label htmlFor="reg-phone" className="pf-label">Numéro de GSM</label>
              <div className="pf-input-wrap">
                <Phone size={16} className="pf-input-icon" />
                <input id="reg-phone" type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="06 12 34 56 78" className="pf-input" autoComplete="tel" />
              </div>
            </div>

            {/* Adresse postale */}
            <div className="pf-field">
              <label htmlFor="reg-addr" className="pf-label">Adresse postale</label>
              <div className="pf-input-wrap">
                <MapPin size={16} className="pf-input-icon" />
                <input id="reg-addr" type="text" value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="15 Rue Sainte-Catherine, 33000 Bordeaux" className="pf-input" autoComplete="street-address" />
              </div>
            </div>

            {/* Password */}
            <div className="pf-field">
              <label htmlFor="reg-pw" className="pf-label">Mot de passe *</label>
              <div className="pf-input-wrap">
                <Lock size={16} className="pf-input-icon" />
                <input id="reg-pw" type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 10 caractères" required className="pf-input" autoComplete="new-password" />
                <button type="button" className="pf-input-toggle" onClick={() => setShowRegPassword(!showRegPassword)} aria-label={showRegPassword ? 'Masquer' : 'Afficher'}>
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength indicators */}
              {regPassword.length > 0 && (
                <ul className="pf-pw-checks">
                  <PwCheck ok={pwChecks.minLength} label="10 caractères minimum" />
                  <PwCheck ok={pwChecks.hasUpper} label="1 majuscule" />
                  <PwCheck ok={pwChecks.hasLower} label="1 minuscule" />
                  <PwCheck ok={pwChecks.hasDigit} label="1 chiffre" />
                  <PwCheck ok={pwChecks.hasSpecial} label="1 caractère spécial" />
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className="pf-field">
              <label htmlFor="reg-confirm" className="pf-label">Confirmer le mot de passe *</label>
              <div className="pf-input-wrap">
                <Lock size={16} className="pf-input-icon" />
                <input id="reg-confirm" type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Retapez votre mot de passe" required className="pf-input" autoComplete="new-password" />
              </div>
              {regConfirm.length > 0 && regPassword !== regConfirm && (
                <p className="pf-field-error">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button type="submit" className="pf-submit" disabled={isLoading}>
              {isLoading ? 'Création…' : (
                <>Créer mon compte <ArrowRight size={16} /></>
              )}
            </button>

            <p className="pf-hint">
              En vous inscrivant, vous recevrez un email de bienvenue.
              Le rôle « utilisateur » vous sera attribué.
            </p>
          </form>
        )}

        {/* ── FORGOT MODE ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="pf-form" noValidate>
            <button type="button" className="pf-back" onClick={() => setMode('login')}>
              <ChevronLeft size={16} /> Retour à la connexion
            </button>

            <h2 className="pf-form-title">Mot de passe oublié ?</h2>
            <p className="pf-form-desc">
              Entrez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>

            <div className="pf-field">
              <label htmlFor="forgot-email" className="pf-label">Adresse email</label>
              <div className="pf-input-wrap">
                <Mail size={16} className="pf-input-icon" />
                <input id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="jean@exemple.fr" required className="pf-input" autoComplete="email" />
              </div>
            </div>

            <button type="submit" className="pf-submit" disabled={isLoading}>
              {isLoading ? 'Envoi…' : (
                <>Envoyer le lien <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Small components ── */

function PwCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`pf-pw-check ${ok ? 'pf-pw-check--ok' : ''}`}>
      {ok ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
      <span>{label}</span>
    </li>
  );
}

function GoogleBtn({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" className="pf-google" onClick={onClick} disabled={disabled}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Continuer avec Google</span>
    </button>
  );
}
