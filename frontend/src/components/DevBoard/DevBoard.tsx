/**
 * DevBoard - Main QA Dashboard component
 * Full-screen layout with header, sidebar, and content
 */

import { useState } from 'react';
import { useDevBoard } from './useDevBoard';
import { DevBoardHeader } from './DevBoardHeader';
import { DevBoardSidebar } from './DevBoardSidebar';
import { DevBoardContent } from './DevBoardContent';
import { SettingsModal } from '../features/qa/settings';
import { CATEGORIES } from './constants';
import type { NavSection } from '../layout/Header/Header';
import './DevBoard.css';

export function DevBoard() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const {
    activeCategory,
    isSidebarCollapsed,
    isSettingsOpen,
    selectCategory,
    toggleSidebar,
    closeSettings,
  } = useDevBoard();

  return (
    <div className="devboard">
      <DevBoardHeader 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <section className="devboard-body">
        <DevBoardSidebar
          categories={CATEGORIES}
          activeCategory={activeCategory}
          collapsed={isSidebarCollapsed}
          onSelectCategory={selectCategory}
          onToggleCollapse={toggleSidebar}
        />
        <DevBoardContent activeCategory={activeCategory} />
      </section>
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
}
