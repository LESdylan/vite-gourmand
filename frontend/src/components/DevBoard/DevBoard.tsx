/**
 * DevBoard - Main QA Dashboard component
 * Composes header, sidebar, and content
 */

import { useDevBoard } from './useDevBoard';
import { DevBoardHeader } from './DevBoardHeader';
import { DevBoardSidebar } from './DevBoardSidebar';
import { DevBoardContent } from './DevBoardContent';
import { SettingsModal } from '../features/qa/settings';
import { CATEGORIES } from './constants';
import './DevBoard.css';

export function DevBoard() {
  const {
    activeCategory,
    isSidebarCollapsed,
    isSettingsOpen,
    isRefreshing,
    selectCategory,
    toggleSidebar,
    openSettings,
    closeSettings,
    refresh,
  } = useDevBoard();

  return (
    <div className="devboard">
      <DevBoardHeader 
        onRefresh={refresh} 
        onSettings={openSettings}
        isRefreshing={isRefreshing}
      />
      <div className="devboard-body">
        <DevBoardSidebar
          categories={CATEGORIES}
          activeCategory={activeCategory}
          collapsed={isSidebarCollapsed}
          onSelectCategory={selectCategory}
          onToggleCollapse={toggleSidebar}
        />
        <DevBoardContent activeCategory={activeCategory} />
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
}
