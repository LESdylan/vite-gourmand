/**
 * Portal Page
 * Entry point for dashboard authentication
 * Elegant design matching the Vite & Gourmand graphical chart
 */

import { Navigate } from 'react-router-dom';
import { usePortalAuth } from './PortalAuthContext';
import { PortalLoginForm } from './PortalLoginForm';
import { ChefHat, LayoutDashboard, BarChart3, Users, ShoppingBag } from 'lucide-react';
import './Portal.css';

// Dashboard preview image from Unsplash (elegant dashboard/analytics theme)
const DASHBOARD_PREVIEW = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&q=80';

export function Portal() {
  const { isAuthenticated, isLoading, user } = usePortalAuth();

  if (isLoading) {
    return <PortalLoading />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return (
    <div className="portal-page portal-page--split">
      {/* Background decorations */}
      <div className="portal-bg" aria-hidden="true">
        <div className="portal-bg-gradient" />
        <div className="portal-bg-pattern" />
        <div className="portal-bg-orb portal-bg-orb--1" />
        <div className="portal-bg-orb portal-bg-orb--2" />
      </div>

      <div className="portal-split-layout">
        {/* Left side - Dashboard preview */}
        <div className="portal-preview">
          <div className="portal-preview-content">
            <div className="portal-preview-badge">
              <LayoutDashboard size={14} />
              <span>Tableau de bord</span>
            </div>
            <h2 className="portal-preview-title">
              Gérez votre activité<br />
              <span className="portal-preview-title-accent">en toute simplicité</span>
            </h2>
            <p className="portal-preview-desc">
              Accédez à votre espace personnel pour gérer vos commandes, 
              suivre vos statistiques et piloter votre restaurant.
            </p>
            
            {/* Feature highlights */}
            <div className="portal-preview-features">
              <div className="portal-preview-feature">
                <div className="portal-preview-feature-icon">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <span className="portal-preview-feature-title">Analytics</span>
                  <span className="portal-preview-feature-desc">Statistiques en temps réel</span>
                </div>
              </div>
              <div className="portal-preview-feature">
                <div className="portal-preview-feature-icon">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <span className="portal-preview-feature-title">Commandes</span>
                  <span className="portal-preview-feature-desc">Suivi et gestion</span>
                </div>
              </div>
              <div className="portal-preview-feature">
                <div className="portal-preview-feature-icon">
                  <Users size={18} />
                </div>
                <div>
                  <span className="portal-preview-feature-title">Équipe</span>
                  <span className="portal-preview-feature-desc">Gestion du personnel</span>
                </div>
              </div>
            </div>

            {/* Dashboard image mockup */}
            <div className="portal-preview-mockup">
              <img 
                src={DASHBOARD_PREVIEW} 
                alt="Aperçu du tableau de bord" 
                className="portal-preview-image"
              />
              <div className="portal-preview-image-overlay" />
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="portal-form-side">
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
