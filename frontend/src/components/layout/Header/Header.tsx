/**
 * Header - Top navigation/branding area
 * Used as the main application header
 */

import './Header.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="layout-header">
      <HeaderBrand title={title} subtitle={subtitle} />
      {actions && <HeaderActions>{actions}</HeaderActions>}
    </header>
  );
}

function HeaderBrand({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="header-brand">
      <h1 className="header-title">{title}</h1>
      {subtitle && <span className="header-subtitle">{subtitle}</span>}
    </div>
  );
}

function HeaderActions({ children }: { children: React.ReactNode }) {
  return <div className="header-actions">{children}</div>;
}
