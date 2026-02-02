/**
 * Login Form Component
 * Email/Password login form with validation
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

export function LoginForm({ onForgotPassword, onRegister }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  // Validation
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const errors = {
    email: touched.email && !validateEmail(formData.email) 
      ? 'Veuillez entrer un email valide' 
      : '',
    password: touched.password && formData.password.length < 8 
      ? 'Le mot de passe doit contenir au moins 8 caractères' 
      : '',
  };

  const isValid = validateEmail(formData.email) && formData.password.length >= 8;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!isValid) return;

    try {
      await login(formData);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) clearError();
  };

  const handleBlur = (field: keyof typeof touched) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div className="form-floating">
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : touched.email && formData.email ? 'is-valid' : ''}`}
          id="loginEmail"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          disabled={isLoading}
          autoComplete="email"
          required
        />
        <label htmlFor="loginEmail">Adresse email</label>
        {errors.email && (
          <div className="invalid-feedback">{errors.email}</div>
        )}
      </div>

      {/* Password Field */}
      <div className="form-floating">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`form-control ${errors.password ? 'is-invalid' : touched.password && formData.password ? 'is-valid' : ''}`}
          id="loginPassword"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
          disabled={isLoading}
          autoComplete="current-password"
          required
        />
        <label htmlFor="loginPassword">Mot de passe</label>
        {errors.password && (
          <div className="invalid-feedback">{errors.password}</div>
        )}
      </div>

      {/* Show Password Toggle */}
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="showPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />
        <label className="form-check-label" htmlFor="showPassword" style={{ fontSize: '13px', color: '#666' }}>
          Afficher le mot de passe
        </label>
      </div>

      {/* Forgot Password Link */}
      <div className="forgot-password-link">
        <button type="button" onClick={onForgotPassword} disabled={isLoading}>
          Mot de passe oublié ?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-auth-primary"
        disabled={isLoading || !isValid}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </button>

      {/* Register Link */}
      <div className="auth-links">
        Première visite ?{' '}
        <button type="button" className="link-btn" onClick={onRegister} disabled={isLoading}>
          Créer un compte
        </button>
      </div>
    </form>
  );
}
