/**
 * DevBoardHeader - Top header of DevBoard
 * Title and global actions with refresh/settings
 */

import { Header } from '../layout/Header';
import { IconButton } from '../helpers/IconButton';

interface DevBoardHeaderProps {
  onRefresh?: () => void;
  onSettings?: () => void;
  isRefreshing?: boolean;
}

export function DevBoardHeader({ onRefresh, onSettings, isRefreshing }: DevBoardHeaderProps) {
  return (
    <Header
      title="DevBoard"
      subtitle="QA Dashboard"
      actions={
        <>
          <IconButton 
            icon={isRefreshing ? "⏳" : "🔄"} 
            ariaLabel="Refresh" 
            onClick={onRefresh ?? (() => {})} 
            variant="subtle"
            disabled={isRefreshing}
          />
          <IconButton 
            icon="⚙️" 
            ariaLabel="Settings" 
            onClick={onSettings ?? (() => {})} 
            variant="subtle" 
          />
        </>
      }
    />
  );
}
