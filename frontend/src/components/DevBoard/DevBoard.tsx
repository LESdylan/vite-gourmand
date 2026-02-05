/**
 * DevBoard - Main QA Dashboard component
 * Full-screen layout with header, sidebar, and content
 */

import { useState, useEffect, useMemo } from 'react';
import { useDevBoard } from './useDevBoard';
import { DevBoardHeader } from './DevBoardHeader';
import { DevBoardSidebar } from './DevBoardSidebar';
import { DevBoardContent } from './DevBoardContent';
import { GradientBackground } from './GradientBackground';
import { SettingsModal } from '../features/qa/settings';
import { ShellFab, ShellModal } from '../cloud-terminal';
import { CATEGORIES } from './constants';
import { TestCountProvider } from './TestCountContext';
import { useTestRunner } from './useTestRunner';
import type { NavSection } from '../layout/Header/Header';
import './DevBoard.css';

export function DevBoard() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isShellOpen, setIsShellOpen] = useState(false);
  const testRunner = useTestRunner();
  const {
    activeCategory,
    isSidebarCollapsed,
    isSettingsOpen,
    selectCategory,
    toggleSidebar,
    closeSettings,
  } = useDevBoard();

  // Compute categories with dynamic test count
  const categories = useMemo(() => {
    return CATEGORIES.map(cat => 
      cat.id === 'test-automatics' 
        ? { ...cat, count: testRunner.metrics.total }
        : cat
    );
  }, [testRunner.metrics.total]);

  // Keyboard shortcut: Ctrl+` to open terminal (desktop only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`' && window.innerWidth > 768) {
        e.preventDefault();
        setIsShellOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TestCountProvider value={{ testCount: testRunner.metrics.total }}>
      <div className="devboard">
        <GradientBackground />
        <DevBoardHeader 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={selectCategory}
        />
        <section className="devboard-body">
          <DevBoardSidebar
            categories={categories}
            activeCategory={activeCategory}
            collapsed={isSidebarCollapsed}
            onSelectCategory={selectCategory}
            onToggleCollapse={toggleSidebar}
          />
          <DevBoardContent activeCategory={activeCategory} testRunner={testRunner} />
        </section>
        <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
        
        {/* Cloud Shell - Desktop only (beta feature) */}
        <ShellFab onClick={() => setIsShellOpen(true)} />
        <ShellModal isOpen={isShellOpen} onClose={() => setIsShellOpen(false)} />
      </div>
    </TestCountProvider>
  );
}
