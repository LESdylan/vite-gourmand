/**
 * RunAllButton - Button to run all automatic tests
 * Shows count and loading state
 */

import { PrimaryButton } from '../../../ui/buttons/PrimaryButton';
import { Spinner } from '../../../ui/loaders/Spinner';
import './RunAllButton.css';

interface RunAllButtonProps {
  count: number;
  isRunning?: boolean;
  onRun?: () => void;
}

export function RunAllButton({ count, isRunning, onRun }: RunAllButtonProps) {
  return (
    <div className="run-all-button">
      <PrimaryButton onClick={onRun} disabled={isRunning || count === 0}>
        {isRunning ? (
          <>
            <Spinner size="sm" />
            <span>Running...</span>
          </>
        ) : (
          <span>▶ Run All ({count})</span>
        )}
      </PrimaryButton>
    </div>
  );
}
