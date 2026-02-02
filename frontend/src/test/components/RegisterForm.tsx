/**
 * Register Form Component
 * Complete registration form with all required fields
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

interface RegisterFormProps {
  onLogin: () => void;
}

export function RegisterForm({ onLogin }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    telephoneNumber: '',
    city: '',
    country: 'France',
    postalAddress: '',
  });
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => !phone || /^(\+33|0)[1-9](\d{2}){4}$/.test(phone.replace(/\s/g, ''));
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return { hasMinLength, hasUpper, hasLower, hasNumber, isValid: hasMinLength && hasUpper && hasLower && hasNumber };
  };

  const passwordValidation = validatePassword(formData.password);
  
  const errors: Record<string, string> = {
    email: touched.email && !validateEmail(formData.email) 
      ? 'Veuillez entrer un email valide' : '',
    password: touched.password && !passwordValidation.isValid 
      ? 'Le mot de passe ne respecte pas les critères' : '',
    confirmPassword: touched.confirmPassword && formData.password !== formData.confirmPassword 
      ? 'Les mots de passe ne correspondent pas' : '',
    firstName: touched.firstName && formData.firstName.length < 2 
      ? 'Le prénom doit contenir au moins 2 caractères' : '',
    telephoneNumber: touched.telephoneNumber && !validatePhone(formData.telephoneNumber) 
      ? 'Numéro de téléphone invalide' : '',
  };

  const isValid = 
    validateEmail(formData.email) && 
    passwordValidation.isValid && 
    formData.password === formData.confirmPassword &&
    formData.firstName.length >= 2 &&
    validatePhone(formData.telephoneNumber);

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
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        telephoneNumber: formData.telephoneNumber || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        postalAddress: formData.postalAddress || undefined,
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) clearError();
  };

  const handleBlur = (field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const strength = getPasswordStrength();

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="form-floating">
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : touched.email && formData.email ? 'is-valid' : ''}`}
          id="regEmail"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          disabled={isLoading}
          autoComplete="email"
          required
        />
        <label htmlFor="regEmail">Adresse email *</label>
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>

      {/* First Name */}
      <div className="form-floating">
        <input
          type="text"
          className={`form-control ${errors.firstName ? 'is-invalid' : touched.firstName && formData.firstName ? 'is-valid' : ''}`}
          id="regFirstName"
          placeholder="Prénom"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          onBlur={handleBlur('firstName')}
          disabled={isLoading}
          autoComplete="given-name"
          required
        />
        <label htmlFor="regFirstName">Prénom *</label>
        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
      </div>

      {/* Password */}
      <div className="form-floating">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`form-control ${errors.password ? 'is-invalid' : touched.password && passwordValidation.isValid ? 'is-valid' : ''}`}
          id="regPassword"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
          disabled={isLoading}
          autoComplete="new-password"
          required
        />
        <label htmlFor="regPassword">Mot de passe *</label>
        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
      </div>

      {/* Password Strength Indicator */}
      {formData.password && (
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
          className={`form-control ${errors.confirmPassword ? 'is-invalid' : touched.confirmPassword && formData.confirmPassword === formData.password && formData.confirmPassword ? 'is-valid' : ''}`}
          id="regConfirmPassword"
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          disabled={isLoading}
          autoComplete="new-password"
          required
        />
        <label htmlFor="regConfirmPassword">Confirmer le mot de passe *</label>
        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
      </div>

      {/* Show Password Toggle */}
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="showRegPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />
        <label className="form-check-label" htmlFor="showRegPassword" style={{ fontSize: '13px', color: '#666' }}>
          Afficher les mots de passe
        </label>
      </div>

      {/* Phone (Optional) */}
      <div className="form-floating">
        <input
          type="tel"
          className={`form-control ${errors.telephoneNumber ? 'is-invalid' : touched.telephoneNumber && formData.telephoneNumber ? 'is-valid' : ''}`}
          id="regPhone"
          placeholder="06 12 34 56 78"
          value={formData.telephoneNumber}
          onChange={handleChange('telephoneNumber')}
          onBlur={handleBlur('telephoneNumber')}
          disabled={isLoading}
          autoComplete="tel"
        />
        <label htmlFor="regPhone">Téléphone</label>
        {errors.telephoneNumber && <div className="invalid-feedback">{errors.telephoneNumber}</div>}
      </div>

      {/* City (Optional) */}
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          id="regCity"
          placeholder="Ville"
          value={formData.city}
          onChange={handleChange('city')}
          disabled={isLoading}
          autoComplete="address-level2"
        />
        <label htmlFor="regCity">Ville</label>
      </div>

      {/* Postal Address (Optional) */}
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          id="regPostal"
          placeholder="Code postal"
          value={formData.postalAddress}
          onChange={handleChange('postalAddress')}
          disabled={isLoading}
          autoComplete="postal-code"
        />
        <label htmlFor="regPostal">Code postal</label>
      </div>

      {/* Country (Optional) */}
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          id="regCountry"
          placeholder="Pays"
          value={formData.country}
          onChange={handleChange('country')}
          disabled={isLoading}
          autoComplete="country-name"
        />
        <label htmlFor="regCountry">Pays</label>
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
            Inscription en cours...
          </>
        ) : (
          'Créer mon compte'
        )}
      </button>

      {/* Login Link */}
      <div className="auth-links">
        Déjà inscrit ?{' '}
        <button type="button" className="link-btn" onClick={onLogin} disabled={isLoading}>
          Se connecter
        </button>
      </div>
    </form>
  );
}
