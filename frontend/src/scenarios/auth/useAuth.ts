/**
 * useAuth - Auth form state management
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/auth';
import type { AuthMode, FormState, FormErrors } from './types';
import { initialFormState } from './types';

export function useAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (mode !== 'forgot') {
      if (!form.password || form.password.length < 8) {
        newErrors.password = 'Minimum 8 caractères';
      }
    }
    
    if (mode === 'register') {
      if (!form.name || form.name.length < 2) {
        newErrors.name = 'Nom requis (min 2 caractères)';
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, mode]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      switch (mode) {
        case 'login':
          await authService.login({ email: form.email, password: form.password });
          navigate('/');
          break;
        case 'register':
          await authService.register({
            email: form.email,
            password: form.password,
            name: form.name,
            phone: form.phone || undefined,
          });
          navigate('/');
          break;
        case 'forgot':
          await authService.forgotPassword(form.email);
          setSuccess('Email de réinitialisation envoyé !');
          break;
      }
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Une erreur est survenue' });
    } finally {
      setLoading(false);
    }
  }, [form, mode, navigate, validate]);

  const handleGoogleLogin = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      await authService.googleLogin(credential);
      navigate('/');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Échec Google OAuth' });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setForm(initialFormState);
    setErrors({});
    setSuccess(null);
  }, []);

  return {
    mode,
    form,
    errors,
    loading,
    success,
    updateField,
    handleSubmit,
    handleGoogleLogin,
    switchMode,
  };
}
