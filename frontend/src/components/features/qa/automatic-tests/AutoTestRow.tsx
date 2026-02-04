/**
 * AutoTestRow - Single automatic test row
 * Displays test name, status, and run button
 */

import type { AutoTest } from './types';
import { InlineStatus } from '../../../helpers/InlineStatus';
import { IconButton } from '../../../helpers/IconButton';
import './AutoTestRow.css';

interface AutoTestRowProps {
  test: AutoTest;
  onRun?: () => void;
}

export function AutoTestRow({ test, onRun }: AutoTestRowProps) {
  const statusMap = {
    idle: 'neutral',
    running: 'info',
    passed: 'success',
    failed: 'error',
  } as const;

  const isRunning = test.status === 'running';

  return (
    <div className="auto-test-row">
      <span className="auto-test-row-name">{test.name}</span>
      <span className="auto-test-row-suite">{test.suite}</span>
      <InlineStatus type={statusMap[test.status]} text={test.status} />
      {test.duration && (
        <span className="auto-test-row-duration">{test.duration}ms</span>
      )}
      {onRun && (
        <IconButton
          icon={isRunning ? '⏳' : '▶'}
          ariaLabel="Run test"
          onClick={onRun}
          disabled={isRunning}
        />
      )}
    </div>
  );
}
