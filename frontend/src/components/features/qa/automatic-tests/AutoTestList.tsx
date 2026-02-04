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
