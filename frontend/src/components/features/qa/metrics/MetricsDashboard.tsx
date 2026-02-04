/**
 * MetricsDashboard - Grid of all metric widgets
 * Composes individual metrics into dashboard view
 */

import { ResponseTimeWidget } from './ResponseTimeWidget';
import { ErrorRateWidget } from './ErrorRateWidget';
import { DbLatencyWidget } from './DbLatencyWidget';
import { CoverageWidget } from './CoverageWidget';
import './MetricsDashboard.css';

interface MetricsDashboardProps {
  responseTime: { avgMs: number; trend: 'up' | 'down' | 'stable'; changePercent?: number };
  errorRate: { errorPercent: number; trend: 'up' | 'down' | 'stable'; changePercent?: number };
  dbLatency: { avgMs: number; trend: 'up' | 'down' | 'stable'; changePercent?: number };
  coverage: { coveragePercent: number; trend: 'up' | 'down' | 'stable'; changePercent?: number };
}

export function MetricsDashboard({ responseTime, errorRate, dbLatency, coverage }: MetricsDashboardProps) {
  return (
    <section className="metrics-dashboard">
      <ResponseTimeWidget {...responseTime} />
      <ErrorRateWidget {...errorRate} />
      <DbLatencyWidget {...dbLatency} />
      <CoverageWidget {...coverage} />
    </section>
  );
}
