/**
 * OAuth Callback Component
 * Handles the redirect from Google OAuth
 * Extracts tokens from URL and stores them
 */

import { useEffect, useState } from 'react';

interface OAuthCallbackProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function OAuthCallback({ onSuccess, onError }: OAuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Traitement de la connexion Google...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userId = params.get('userId');
    const email = params.get('email');
    const firstName = params.get('firstName');
    const role = params.get('role');
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Erreur OAuth: ${error}`);
      onError?.(error);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Log success
      console.log('✅ Google OAuth successful:', {
        userId,
        email,
        firstName,
        role,
      });

      setStatus('success');
      setMessage(`Bienvenue, ${firstName || email}!`);
      
      // Clear URL params for security
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Notify parent and redirect after delay
      setTimeout(() => {
        onSuccess?.();
        // Redirect to main page or dashboard
        window.location.href = '/';
      }, 1500);
    } else {
      setStatus('error');
      setMessage('Paramètres OAuth manquants');
      onError?.('Missing OAuth parameters');
    }
  }, [onSuccess, onError]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        color: '#333',
        maxWidth: '400px',
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f0f0f0',
              borderTopColor: '#764ba2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}
        
        {status === 'success' && (
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        )}
        
        {status === 'error' && (
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        )}
        
        <h2 style={{ margin: '0 0 12px', fontSize: '20px' }}>
          {status === 'loading' && 'Connexion en cours...'}
          {status === 'success' && 'Connexion réussie!'}
          {status === 'error' && 'Erreur de connexion'}
        </h2>
        
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          {message}
        </p>

        {status === 'error' && (
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: '#764ba2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Retour à l'accueil
          </button>
        )}
      </div>
    </div>
  );
}
