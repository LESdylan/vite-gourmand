/**
 * AutoTestList - List of automatic tests
 * Renders all automatic test rows with header
 */

import type { AutoTest } from './types';
import { AutoTestRow } from './AutoTestRow';
import './AutoTestList.css';

interface AutoTestListProps {
  tests: AutoTest[];
  onRunTest?: (id: string) => void;
}

export function AutoTestList({ tests, onRunTest }: AutoTestListProps) {
  return (
    <div className="auto-test-list">
      <header className="auto-test-list-header">
        <span>Test Name</span>
        <span>Suite</span>
        <span>Status</span>
        <span>Duration</span>
        <span>Action</span>
      </header>
      <div className="auto-test-list-body">
        {tests.map((test) => (
          <AutoTestRow
            key={test.id}
            test={test}
            onRun={onRunTest ? () => onRunTest(test.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
