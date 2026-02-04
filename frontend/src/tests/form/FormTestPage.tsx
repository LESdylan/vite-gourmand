/**
 * FormTestPage - Manual Form Validation Test
 * Tests form inputs, validation, submission
 */

import { useState } from 'react';
import './FormTestPage.css';

interface FormData {
  name: string;
  email: string;
  message: string;
  category: string;
  agree: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  category?: string;
  agree?: string;
}

export function FormTestPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    category: '',
    agree: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name: keyof FormData, value: string | boolean) => {
    switch (name) {
      case 'name':
        return typeof value === 'string' && value.length >= 2 
          ? '' : 'Nom requis (min 2 caractères)';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string) 
          ? '' : 'Email invalide';
      case 'message':
        return typeof value === 'string' && value.length >= 10 
          ? '' : 'Message requis (min 10 caractères)';
      case 'category':
        return value ? '' : 'Sélectionnez une catégorie';
      case 'agree':
        return value ? '' : 'Vous devez accepter les conditions';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name as keyof FormData, fieldValue),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {};
    (Object.keys(formData) as (keyof FormData)[]).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '', category: '', agree: false });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="form-test-page">
      <header className="form-test-header">
        <a href="/" className="back-link">← Retour au Dashboard</a>
        <h1>🧪 Test Manuel: Formulaire</h1>
        <p className="form-test-description">
          Testez la validation, les états d'erreur, et la soumission du formulaire
        </p>
      </header>

      <div className="form-test-container">
        <aside className="test-checklist">
          <h2>✅ Points à vérifier</h2>
          <ul>
            <li>Validation en temps réel</li>
            <li>Messages d'erreur clairs</li>
            <li>Focus et accessibilité (Tab)</li>
            <li>État de chargement</li>
            <li>Confirmation de succès</li>
            <li>Réinitialisation du formulaire</li>
            <li>Responsive design</li>
          </ul>
        </aside>

        <main className="form-test-main">
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Formulaire soumis avec succès!</h2>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
              <button onClick={handleReset} className="btn-reset">
                Tester à nouveau
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="test-form" noValidate>
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="name">Nom *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  autoComplete="name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
                <label htmlFor="category">Catégorie *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner...</option>
                  <option value="question">Question</option>
                  <option value="commande">Commande</option>
                  <option value="reclamation">Réclamation</option>
                  <option value="autre">Autre</option>
                </select>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>

              <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Votre message..."
                  rows={4}
                />
                {errors.message && <span className="error-text">{errors.message}</span>}
              </div>

              <div className={`form-group checkbox-group ${errors.agree ? 'has-error' : ''}`}>
                <label>
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                  />
                  <span>J'accepte les conditions d'utilisation *</span>
                </label>
                {errors.agree && <span className="error-text">{errors.agree}</span>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleReset} className="btn-secondary">
                  Réinitialiser
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Envoi...' : 'Soumettre'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
