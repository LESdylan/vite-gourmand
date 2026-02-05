/**
 * AutoTestList - List of automatic tests
 * Fly.io-style table with proper semantic markup
 */

import type { AutoTest } from './types';
import { AutoTestRow } from './AutoTestRow';
import './AutoTestList.css';

interface AutoTestListProps {
  tests: AutoTest[];
  onRunTest?: (id: string) => void;
}

export function AutoTestList({ tests, onRunTest }: AutoTestListProps) {
  // Show empty state when no tests available
  if (tests.length === 0) {
    return (
      <div className="fly-card">
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🧪</div>
          <h3 style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: 600, 
            marginBottom: 'var(--space-2)',
            color: 'var(--color-text-primary)'
          }}>
            No Test Results Yet
          </h3>
          <p style={{ 
            color: 'var(--color-text-secondary)', 
            marginBottom: 'var(--space-4)',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            Click the <strong>"Run All Tests"</strong> button above to execute your test suites. 
            Results will appear here showing pass/fail status for each test.
          </p>
          <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            💡 Tests are executed on the backend and results are cached for quick viewing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fly-card">
      <div className="fly-table-wrapper">
        <table className="fly-table">
          <thead className="fly-table-header">
            <tr>
              <th scope="col">Test Name</th>
              <th scope="col">Suite</th>
              <th scope="col">Status</th>
              <th scope="col">Duration</th>
              <th scope="col" className="fly-table-actions">Actions</th>
            </tr>
          </thead>
          <tbody className="fly-table-body">
            {tests.map((test, index) => (
              <AutoTestRow
                key={test.id}
                test={test}
                onRun={onRunTest ? () => onRunTest(test.id) : undefined}
                isEven={index % 2 === 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
