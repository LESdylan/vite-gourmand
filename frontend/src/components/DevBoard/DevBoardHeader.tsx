/**
 * DevBoardHeader - Top navigation with 4 main sections
 * Dashboard, Docs, Resources, Account
 */

import { Header, type NavSection } from '../layout/Header/Header';

interface DevBoardHeaderProps {
  activeSection?: NavSection;
  onSectionChange?: (section: NavSection) => void;
}

export function DevBoardHeader({ activeSection = 'dashboard', onSectionChange }: DevBoardHeaderProps) {
  return (
    <Header
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    />
  );
}
