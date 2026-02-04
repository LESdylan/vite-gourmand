/**
 * CoverageWidget - Test coverage metric
 * Specialized metric for code coverage percentage
 */

import { MetricWidget } from './MetricWidget';
import type { MetricData } from './types';

interface CoverageWidgetProps {
  coveragePercent: number;
  trend: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export function CoverageWidget({ coveragePercent, trend, changePercent }: CoverageWidgetProps) {
  const metric: MetricData = {
    id: 'coverage',
    label: 'Test Coverage',
    value: coveragePercent,
    unit: '%',
    trend,
    change: changePercent,
  };

  return <MetricWidget metric={metric} />;
}
