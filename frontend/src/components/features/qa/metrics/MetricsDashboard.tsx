/**
 * MetricsDashboard - Grid of all metric widgets
 * Shows test results and performance metrics
 */

import { MetricWidget } from './MetricWidget';
import './MetricsDashboard.css';

interface MetricsDashboardProps {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
}

export function MetricsDashboard({ totalTests, passedTests, failedTests, passRate }: MetricsDashboardProps) {
  return (
    <section className="metrics-dashboard">
      <MetricWidget 
        label="Total Tests" 
        value={totalTests} 
        trend="stable"
      />
      <MetricWidget 
        label="Passed" 
        value={passedTests} 
        trend={passedTests > 0 ? 'down' : 'stable'}
        unit="✓"
      />
      <MetricWidget 
        label="Failed" 
        value={failedTests} 
        trend={failedTests > 0 ? 'up' : 'stable'}
        unit="✕"
      />
      <MetricWidget 
        label="Pass Rate" 
        value={passRate} 
        unit="%"
        trend={passRate >= 90 ? 'down' : passRate >= 70 ? 'stable' : 'up'}
      />
    </section>
  );
}
