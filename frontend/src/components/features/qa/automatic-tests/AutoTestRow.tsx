/**
 * AutoTestRow - Single automatic test row
 * Clean table row with status indicators and run button
 */

import type { AutoTest } from './types';
import { InlineStatus } from '../../../helpers/InlineStatus';
import './AutoTestRow.css';

interface AutoTestRowProps {
  test: AutoTest;
  onRun?: () => void;
  isEven?: boolean;
}

export function AutoTestRow({ test, onRun, isEven }: AutoTestRowProps) {
  const statusMap = {
    idle: 'neutral',
    running: 'info',
    passed: 'success',
    failed: 'error',
  } as const;

  const isRunning = test.status === 'running';

  return (
    <tr className={`fly-table-row ${isEven ? 'fly-table-row--alt' : ''}`} data-status={test.status}>
      <td className="fly-table-cell fly-table-cell--name">
        <div className="fly-status-dot" data-status={test.status} />
        <div className="fly-test-info">
          <strong className="fly-test-name">{test.name}</strong>
          <span className="fly-test-id">{test.id}</span>
        </div>
      </td>
      <td className="fly-table-cell fly-table-cell--suite">
        <span className="fly-badge-region">{test.suite}</span>
      </td>
      <td className="fly-table-cell fly-table-cell--status">
        <InlineStatus type={statusMap[test.status]} text={test.status} />
      </td>
      <td className="fly-table-cell fly-table-cell--duration">
        {test.duration ? `${test.duration}ms` : '-'}
      </td>
      <td className="fly-table-cell fly-table-cell--actions">
        {onRun && (
          <button
            className="run-test-btn"
            onClick={onRun}
            disabled={isRunning}
            aria-label="Run test"
            title="Run this test"
          >
            {isRunning ? (
              <svg className="run-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg className="run-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}
      </td>
    </tr>
  );
}
