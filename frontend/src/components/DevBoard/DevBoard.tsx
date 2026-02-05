/**
 * DevBoard - Main QA Dashboard component
 * Full-screen layout with header, sidebar, and content
 */

import { useState, useEffect } from 'react';
import { useDevBoard } from './useDevBoard';
import { DevBoardHeader } from './DevBoardHeader';
import { DevBoardSidebar } from './DevBoardSidebar';
import { DevBoardContent } from './DevBoardContent';
import { GradientBackground } from './GradientBackground';
import { SettingsModal } from '../features/qa/settings';
import { ShellFab, ShellModal } from '../cloud-terminal';
import { CATEGORIES } from './constants';
import type { NavSection } from '../layout/Header/Header';
import './DevBoard.css';

export function DevBoard() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isShellOpen, setIsShellOpen] = useState(false);
  const {
    activeCategory,
    isSidebarCollapsed,
    isSettingsOpen,
    selectCategory,
    toggleSidebar,
    closeSettings,
  } = useDevBoard();

  // Keyboard shortcut: Ctrl+` to open terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsShellOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="devboard">
      <GradientBackground />
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
      
      {/* Cloud Shell - Accessible from anywhere */}
      <ShellFab onClick={() => setIsShellOpen(true)} />
      <ShellModal isOpen={isShellOpen} onClose={() => setIsShellOpen(false)} />
    </div>
  );
}
