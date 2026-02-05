/**
 * AutoTestRow - Single automatic test row
 * Expandable row with verbose output on click
 */

import { useState } from 'react';
import type { AutoTest } from './types';
import { InlineStatus } from '../../../helpers/InlineStatus';
import './AutoTestRow.css';

interface AutoTestRowProps {
  test: AutoTest;
  onRun?: () => void;
  isEven?: boolean;
}

export function AutoTestRow({ test, onRun, isEven }: AutoTestRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const statusMap = {
    idle: 'neutral',
    running: 'info',
    passed: 'success',
    failed: 'error',
  } as const;

  const isRunning = test.status === 'running';
  const hasDetails = test.output || test.error;

  return (
    <>
      <tr 
        className={`fly-table-row ${isEven ? 'fly-table-row--alt' : ''} ${hasDetails ? 'fly-table-row--expandable' : ''}`} 
        data-status={test.status}
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        role={hasDetails ? 'button' : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        onKeyDown={(e) => hasDetails && e.key === 'Enter' && setIsExpanded(!isExpanded)}
        aria-expanded={hasDetails ? isExpanded : undefined}
      >
        <td className="fly-table-cell fly-table-cell--name">
          <div className="fly-status-dot" data-status={test.status} />
          <div className="fly-test-info">
            <strong className="fly-test-name">
              {hasDetails && (
                <span className={`fly-expand-icon ${isExpanded ? 'fly-expand-icon--open' : ''}`}>
                  ▶
                </span>
              )}
              {test.name}
            </strong>
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
              onClick={(e) => { e.stopPropagation(); onRun(); }}
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
      {isExpanded && hasDetails && (
        <tr className="fly-table-row--detail">
          <td colSpan={5}>
            <div className="fly-test-detail">
              {test.error && (
                <div className="fly-test-error">
                  <span className="fly-test-detail-label">❌ Error</span>
                  <pre className="fly-test-detail-content fly-test-detail-content--error">{test.error}</pre>
                </div>
              )}
              {test.output && (
                <div className="fly-test-output">
                  <span className="fly-test-detail-label">📟 Output</span>
                  <pre className="fly-test-detail-content">{test.output}</pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
