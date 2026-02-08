/**
 * Portal Page
 * Entry point for dashboard authentication
 * Elegant design matching the Vite & Gourmand graphical chart
 */

import { Navigate } from 'react-router-dom';
import { usePortalAuth } from './PortalAuthContext';
import { PortalLoginForm } from './PortalLoginForm';
import { ChefHat } from 'lucide-react';
import './Portal.css';

export function Portal() {
  const { isAuthenticated, isLoading, user } = usePortalAuth();

  if (isLoading) {
    return <PortalLoading />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return (
    <div className="portal-page">
      {/* Background decorations */}
      <div className="portal-bg" aria-hidden="true">
        <div className="portal-bg-gradient" />
        <div className="portal-bg-pattern" />
        <div className="portal-bg-orb portal-bg-orb--1" />
        <div className="portal-bg-orb portal-bg-orb--2" />
      </div>

      <div className="portal-container">
        {/* Logo + branding */}
        <div className="portal-brand">
          <div className="portal-brand-icon">
            <ChefHat size={28} />
          </div>
          <h1 className="portal-brand-name">Vite & Gourmand</h1>
          <p className="portal-brand-tagline">Espace personnel</p>
        </div>

        {/* Login/Register form */}
        <PortalLoginForm />

        {/* Footer */}
        <footer className="portal-page-footer">
          <a href="/">← Retour au site</a>
          <span className="portal-page-footer-sep">·</span>
          <span>© {new Date().getFullYear()} Vite & Gourmand</span>
        </footer>
      </div>
    </div>
  );
}

function PortalLoading() {
  return (
    <div className="portal-page portal-page--loading">
      <div className="portal-bg" aria-hidden="true">
        <div className="portal-bg-gradient" />
      </div>
      <div className="portal-container">
        <div className="portal-brand">
          <div className="portal-brand-icon portal-brand-icon--pulse">
            <ChefHat size={28} />
          </div>
          <p style={{ color: '#722F37', fontSize: '0.875rem', marginTop: '1rem' }}>Chargement…</p>
        </div>
      </div>
    </div>
  );
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case 'superadmin':
    case 'admin':
    case 'employee':
      return '/dashboard';
    case 'customer':
      return '/unauthorized';
    default:
      return '/portal';
  }
}
