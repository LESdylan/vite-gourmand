/**
 * Reset Password Form Component
 * Reset password using token from email
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ResetPasswordFormProps {
  email?: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function ResetPasswordForm({ email, onSuccess, onBack }: ResetPasswordFormProps) {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password validation
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return { hasMinLength, hasUpper, hasLower, hasNumber, isValid: hasMinLength && hasUpper && hasLower && hasNumber };
  };

  const passwordValidation = validatePassword(formData.newPassword);

  const errors = {
    token: touched.token && formData.token.length < 10 
      ? 'Token invalide' : '',
    newPassword: touched.newPassword && !passwordValidation.isValid 
      ? 'Le mot de passe ne respecte pas les critères' : '',
    confirmPassword: touched.confirmPassword && formData.newPassword !== formData.confirmPassword 
      ? 'Les mots de passe ne correspondent pas' : '',
  };

  const isValid = 
    formData.token.length >= 10 && 
    passwordValidation.isValid && 
    formData.newPassword === formData.confirmPassword;

  const getPasswordStrength = () => {
    const { hasMinLength, hasUpper, hasLower, hasNumber } = passwordValidation;
    const score = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;
    if (score <= 1) return { class: 'weak', text: 'Faible' };
    if (score === 2) return { class: 'fair', text: 'Moyen' };
    if (score === 3) return { class: 'good', text: 'Bon' };
    return { class: 'strong', text: 'Fort' };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!isValid) return;

    try {
      await resetPassword(formData.token, formData.newPassword);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch {
      // Error handled by hook
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) clearError();
  };

  const handleBlur = (field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const strength = getPasswordStrength();

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-alert alert-success" role="alert">
          <strong>Mot de passe réinitialisé !</strong>
          <p style={{ margin: '8px 0 0' }}>
            Votre nouveau mot de passe a été enregistré.
            <br />
            Redirection vers la connexion...
          </p>
        </div>
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

      {email && (
        <div className="auth-alert alert-info" role="alert">
          Réinitialisation pour : <strong>{email}</strong>
        </div>
      )}

      {/* Token Field */}
      <div className="form-floating">
        <textarea
          className={`form-control ${errors.token ? 'is-invalid' : touched.token && formData.token ? 'is-valid' : ''}`}
          id="resetToken"
          placeholder="Token de réinitialisation"
          value={formData.token}
          onChange={handleChange('token')}
          onBlur={handleBlur('token')}
          disabled={isLoading}
          style={{ height: '80px', resize: 'none' }}
          required
        />
        <label htmlFor="resetToken">Token de réinitialisation</label>
        {errors.token && <div className="invalid-feedback">{errors.token}</div>}
      </div>

      <div className="auth-alert alert-info" style={{ marginTop: '8px' }}>
        <small>Le token se trouve dans les logs du backend ou dans l'email de réinitialisation.</small>
      </div>

      {/* New Password */}
      <div className="form-floating" style={{ marginTop: '16px' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          className={`form-control ${errors.newPassword ? 'is-invalid' : touched.newPassword && passwordValidation.isValid ? 'is-valid' : ''}`}
          id="resetNewPassword"
          placeholder="Nouveau mot de passe"
          value={formData.newPassword}
          onChange={handleChange('newPassword')}
          onBlur={handleBlur('newPassword')}
          disabled={isLoading}
          autoComplete="new-password"
          required
        />
        <label htmlFor="resetNewPassword">Nouveau mot de passe</label>
        {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
      </div>

      {/* Password Strength */}
      {formData.newPassword && (
        <div className="password-strength">
          <div className="password-strength-bar">
            <div className={`bar ${strength.class}`}></div>
          </div>
          <div className="password-strength-text">
            Force: {strength.text} | 
            {!passwordValidation.hasMinLength && ' 8 car. min '}
            {!passwordValidation.hasUpper && ' 1 majuscule '}
            {!passwordValidation.hasLower && ' 1 minuscule '}
            {!passwordValidation.hasNumber && ' 1 chiffre'}
          </div>
        </div>
      )}

      {/* Confirm Password */}
      <div className="form-floating" style={{ marginTop: '16px' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          className={`form-control ${errors.confirmPassword ? 'is-invalid' : touched.confirmPassword && formData.confirmPassword === formData.newPassword && formData.confirmPassword ? 'is-valid' : ''}`}
          id="resetConfirmPassword"
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          disabled={isLoading}
          autoComplete="new-password"
          required
        />
        <label htmlFor="resetConfirmPassword">Confirmer le mot de passe</label>
        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
      </div>

      {/* Show Password */}
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="showResetPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />
        <label className="form-check-label" htmlFor="showResetPassword" style={{ fontSize: '13px', color: '#666' }}>
          Afficher les mots de passe
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-auth-primary"
        disabled={isLoading || !isValid}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status"></span>
            Réinitialisation...
          </>
        ) : (
          'Réinitialiser mon mot de passe'
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
