/**
 * Google Login Button Component
 * Uses Google Identity Services (GIS) for browser-based authentication
 * Google detects if user is already signed in and shows One Tap or popup
 */

import { useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

interface GoogleButtonConfig {
  type: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

export function GoogleLoginButton() {
  const { googleLoginWithCredential } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle the credential response from Google
  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the auth context to handle login - this updates app state
      await googleLoginWithCredential(response.credential);
      // Success! The auth context will update the UI automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [googleLoginWithCredential]);

  // Load Google Identity Services script
  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.accounts?.id) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setError('Failed to load Google Sign-In');
    document.head.appendChild(script);

    return () => {
      // Cleanup is optional since script should persist
    };
  }, []);

  // Initialize Google Identity Services when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !window.google?.accounts?.id) return;

    // Get client ID from backend config endpoint
    authApi.getGoogleClientId().then((clientId) => {
      if (!clientId) {
        setError('Google Sign-In not configured');
        return;
      }

      window.google!.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false, // Don't auto-select, let user click
        cancel_on_tap_outside: true,
        context: 'signin',
        use_fedcm_for_prompt: false, // Disable FedCM, use popup instead
      } as GoogleIdConfig & { use_fedcm_for_prompt: boolean });

      // Render the Google button in our container
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        window.google!.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 280,
        });
      }

      // Also show One Tap prompt (if user is already signed into Google in browser)
      window.google!.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('One Tap not displayed:', notification.getNotDisplayedReason());
        }
      });
    }).catch((err) => {
      console.error('Failed to get Google client ID:', err);
      setError('Google Sign-In configuration error');
    });
  }, [isScriptLoaded, handleCredentialResponse]);

  if (error) {
    return (
      <div className="google-login-error">
        <p className="text-danger small">{error}</p>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="google-login-container">
      {isLoading && (
        <div className="text-center py-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Connexion en cours...</span>
          </div>
          <span className="ms-2 small">Connexion avec Google...</span>
        </div>
      )}
      
      {/* Google will render its button here */}
      <div 
        id="google-signin-button" 
        style={{ display: isLoading ? 'none' : 'flex', justifyContent: 'center' }}
      />
      
      {!isScriptLoaded && !error && (
        <div className="text-center py-2">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
}
