/** Header - Top navigation bar with burger menu for mobile */

import { useState } from 'react';
import { BurgerIcon, MobileMenu } from '../../ui/BurgerMenu';
import { LogoIcon, DashboardIcon, DocsIcon, ResourcesIcon, AccountIcon, NotificationIcon } from './HeaderIcons';
import type { CategoryData, TestCategory } from '../../features/qa/sidebar';
import './Header.css';

export type NavSection = 'dashboard' | 'docs' | 'resources' | 'account';
export interface NavItem { id: NavSection; label: string; icon: React.ReactNode; }

interface HeaderProps {
  activeSection?: NavSection;
  onSectionChange?: (section: NavSection) => void;
  categories?: CategoryData[];
  activeCategory?: TestCategory;
  onCategoryChange?: (category: TestCategory) => void;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'docs', label: 'Docs', icon: <DocsIcon /> },
  { id: 'resources', label: 'Resources', icon: <ResourcesIcon /> },
  { id: 'account', label: 'Account', icon: <AccountIcon /> },
];

export function Header({
  activeSection = 'dashboard',
  onSectionChange,
  categories = [],
  activeCategory = 'overview',
  onCategoryChange,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="layout-header">
      <div className="header-left">
        <div className="header-burger">
          <BurgerIcon isOpen={menuOpen} onClick={() => setMenuOpen(v => !v)} />
        </div>
        <Brand />
      </div>

      <nav className="header-nav">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} active={activeSection === item.id} onClick={onSectionChange} />
        ))}
      </nav>

      <div className="header-actions">
        <NotificationButton />
      </div>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={NAV_ITEMS}
        categories={categories}
        activeSection={activeSection}
        activeCategory={activeCategory}
        onNavChange={(s) => { onSectionChange?.(s); setMenuOpen(false); }}
        onCategoryChange={(c) => { onCategoryChange?.(c); setMenuOpen(false); }}
      />
    </header>
  );
}

function Brand() {
  return (
    <div className="header-brand">
      <div className="header-logo"><LogoIcon /></div>
      <span className="header-title">DevBoard</span>
    </div>
  );
}

const NavButton = ({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: (s: NavSection) => void }) => (
  <button className={`header-nav-item ${active ? 'header-nav-item--active' : ''}`} onClick={() => onClick?.(item.id)}>
    <span className="header-nav-icon">{item.icon}</span>
    <span className="header-nav-label">{item.label}</span>
  </button>
);

const NotificationButton = () => (
  <button className="header-action-btn" aria-label="Notifications"><NotificationIcon /></button>
);
