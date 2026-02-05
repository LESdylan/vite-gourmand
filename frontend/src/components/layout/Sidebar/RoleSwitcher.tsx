/**
 * RoleSwitcher - Sidebar dropdown for switching between role views
 * Only visible for superadmin users
 * Uses RoleViewContext for SPA-style view switching (no routing)
 */

import { useState } from 'react';
import { usePortalAuth } from '../../../portal_dashboard';
import { useRoleView } from '../../DevBoard/RoleViewContext';
import type { RoleView } from '../../DevBoard/constants';
import './RoleSwitcher.css';

interface RoleOption {
  id: RoleView;
  label: string;
  icon: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: 'dev', label: 'DevBoard', icon: '🛠️', description: 'QA & Development' },
  { id: 'admin', label: 'Admin', icon: '👔', description: 'Administration' },
  { id: 'employee', label: 'Employé', icon: '👷', description: 'Espace Employé' },
];

interface RoleSwitcherProps {
  collapsed?: boolean;
}

export function RoleSwitcher({ collapsed }: RoleSwitcherProps) {
  const { user } = usePortalAuth();
  const { currentView, setView } = useRoleView();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for superadmin
  if (user?.role !== 'superadmin') return null;

  const currentRole = ROLE_OPTIONS.find(r => r.id === currentView) || ROLE_OPTIONS[0];

  const handleSelect = (role: RoleOption) => {
    setView(role.id);
    setIsOpen(false);
  };

  if (collapsed) {
    return (
      <div className="role-switcher role-switcher--collapsed">
        <button 
          className="role-switcher-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          title="Switch View"
        >
          {currentRole.icon}
        </button>
        {isOpen && (
          <div className="role-switcher-dropdown role-switcher-dropdown--right">
            {ROLE_OPTIONS.map(role => (
              <button
                key={role.id}
                className={`role-option ${currentRole.id === role.id ? 'active' : ''}`}
                onClick={() => handleSelect(role)}
              >
                <span className="role-option-icon">{role.icon}</span>
                <span className="role-option-label">{role.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="role-switcher">
      <button 
        className="role-switcher-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="role-switcher-icon">{currentRole.icon}</span>
        <span className="role-switcher-info">
          <span className="role-switcher-label">Vue: {currentRole.label}</span>
          <span className="role-switcher-hint">{currentRole.description}</span>
        </span>
        <span className={`role-switcher-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="role-switcher-dropdown">
          <div className="role-dropdown-header">Changer de vue</div>
          {ROLE_OPTIONS.map(role => (
            <button
              key={role.id}
              className={`role-option ${currentRole.id === role.id ? 'active' : ''}`}
              onClick={() => handleSelect(role)}
            >
              <span className="role-option-icon">{role.icon}</span>
              <div className="role-option-content">
                <span className="role-option-label">{role.label}</span>
                <span className="role-option-desc">{role.description}</span>
              </div>
              {currentRole.id === role.id && <span className="role-option-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
