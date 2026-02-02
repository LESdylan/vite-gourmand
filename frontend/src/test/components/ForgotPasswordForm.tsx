/**
 * Forgot Password Form Component
 * Request password reset email
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onResetSent: (email: string) => void;
}

export function ForgotPasswordForm({ onBack, onResetSent }: ForgotPasswordFormProps) {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = touched && !validateEmail(email) ? 'Veuillez entrer un email valide' : '';
  const isValid = validateEmail(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!isValid) return;

    try {
      await forgotPassword(email);
      setSuccess(true);
      onResetSent(email);
    } catch {
      // Error handled by hook
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-alert alert-success" role="alert">
          <strong>Email envoyé !</strong>
          <p style={{ margin: '8px 0 0' }}>
            Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
            <br />
            Vérifiez votre boîte de réception et vos spams.
          </p>
        </div>
        
        <div className="auth-alert alert-info" role="alert">
          <strong>Pour les tests :</strong>
          <p style={{ margin: '8px 0 0' }}>
            Le token de reset est affiché dans les logs du backend.
            <br />
            Copiez-le pour continuer le test de réinitialisation.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-auth-primary"
          onClick={onBack}
          style={{ marginTop: '16px' }}
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="auth-alert alert-info" role="alert">
        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </div>

      {/* Email Field */}
      <div className="form-floating">
        <input
          type="email"
          className={`form-control ${emailError ? 'is-invalid' : touched && email ? 'is-valid' : ''}`}
          id="forgotEmail"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) clearError();
          }}
          onBlur={() => setTouched(true)}
          disabled={isLoading}
          autoComplete="email"
          autoFocus
          required
        />
        <label htmlFor="forgotEmail">Adresse email</label>
        {emailError && <div className="invalid-feedback">{emailError}</div>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-auth-primary"
        disabled={isLoading || !isValid}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status"></span>
            Envoi en cours...
          </>
        ) : (
          'Envoyer le lien de réinitialisation'
        )}
      </button>

      {/* Back Link */}
      <div className="auth-links">
        <button type="button" className="link-btn" onClick={onBack} disabled={isLoading}>
          ← Retour à la connexion
        </button>
      </div>
    </form>
  );
}
