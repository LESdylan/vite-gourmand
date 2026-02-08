/**
 * Portal Login / Register / Forgot Password Form
 * Unified form with mode switching and password validation
 * Keeps all existing auth.ts & PortalAuthContext backend logic
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { usePortalAuth } from './PortalAuthContext';
import { getGoogleConfig } from '../services/auth';
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

  /* ── Google Identity Services (GSI) ── */
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);

  const onGoogleCredential = useCallback(async (response: { credential: string }) => {
    try {
      await loginWithGoogle(response.credential);
    } catch {
      // Error handled by context
    }
  }, [loginWithGoogle]);

  // Step 1: Load GSI script + initialize google.accounts.id
  useEffect(() => {
    let cancelled = false;

    async function initGoogle() {
      try {
        const { clientId } = await getGoogleConfig();
        if (!clientId || cancelled) return;

        // Load GSI script if not already present
        if (!document.getElementById('google-gsi-script')) {
          const script = document.createElement('script');
          script.id = 'google-gsi-script';
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (!cancelled) initGsiClient(clientId);
          };
          document.head.appendChild(script);
        } else if ((window as any).google?.accounts) {
          initGsiClient(clientId);
        }
      } catch {
        // Google config not available — hide button
      }
    }

    function initGsiClient(clientId: string) {
      const google = (window as any).google;
      if (!google?.accounts) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: onGoogleCredential,
        auto_select: false,
      });
      if (!cancelled) setGoogleReady(true);
    }

    initGoogle();
    return () => { cancelled = true; };
  }, [onGoogleCredential]);

  // Step 2: Render the Google button once GSI is ready AND the ref div is mounted
  useEffect(() => {
    if (!googleReady || !googleBtnRef.current) return;
    const google = (window as any).google;
    if (!google?.accounts) return;

    googleBtnRef.current.innerHTML = '';
    google.accounts.id.renderButton(googleBtnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      width: googleBtnRef.current.offsetWidth || 376,
      locale: 'fr',
    });
  }, [googleReady, mode]);

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
            <div ref={googleBtnRef} className="pf-google-wrap" style={googleReady ? undefined : { display: 'none' }} />
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


