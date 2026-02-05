/**
 * Portal Page
 * Entry point for dashboard authentication
 */

import { Navigate } from 'react-router-dom';
import { usePortalAuth } from './PortalAuthContext';
import { PortalLoginForm } from './PortalLoginForm';
import { GradientBackground } from '../components/DevBoard/GradientBackground';
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
    <div className="portal">
      <GradientBackground />
      <div className="portal-content">
        <PortalLogo />
        <PortalLoginForm />
        <PortalFooter />
      </div>
    </div>
  );
}

function PortalLoading() {
  return (
    <div className="portal portal--loading">
      <GradientBackground />
      <div className="portal-spinner">Chargement...</div>
    </div>
  );
}

function PortalLogo() {
  return (
    <div className="portal-logo">
      <span className="portal-logo-icon">🍽️</span>
      <span className="portal-logo-text">Vite Gourmand</span>
      <span className="portal-logo-badge">Dashboard</span>
    </div>
  );
}

function PortalFooter() {
  return (
    <footer className="portal-footer">
      <span>© 2026 Vite Gourmand</span>
      <span>•</span>
      <a href="/privacy">Confidentialité</a>
    </footer>
  );
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case 'superadmin': return '/dev';
    case 'admin': return '/admin';
    case 'employee': return '/employee';
    case 'customer': return '/unauthorized'; // Customers can't access dashboard
    default: return '/portal';
  }
}
