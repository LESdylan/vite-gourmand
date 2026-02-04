/**
 * SidebarHeader - Branding area of QA sidebar
 * Displays logo and collapse toggle
 */

import './SidebarHeader.css';

interface SidebarHeaderProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function SidebarHeader({ collapsed = false, onToggle }: SidebarHeaderProps) {
  return (
    <div className="sidebar-header">
      <Logo collapsed={collapsed} />
      {onToggle && <ToggleButton collapsed={collapsed} onClick={onToggle} />}
    </div>
  );
}

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="sidebar-logo">
      <span className="sidebar-logo-icon">🧪</span>
      {!collapsed && <span className="sidebar-logo-text">DevBoard</span>}
    </div>
  );
}

function ToggleButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="sidebar-toggle"
      onClick={onClick}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? '→' : '←'}
    </button>
  );
}
