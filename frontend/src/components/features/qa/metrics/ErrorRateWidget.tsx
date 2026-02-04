/**
 * ErrorRateWidget - API error rate metric
 * Specialized metric for error percentages
 */

import { MetricWidget } from './MetricWidget';
import type { MetricData } from './types';

interface ErrorRateWidgetProps {
  errorPercent: number;
  trend: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export function ErrorRateWidget({ errorPercent, trend, changePercent }: ErrorRateWidgetProps) {
  const metric: MetricData = {
    id: 'error-rate',
    label: 'Error Rate',
    value: errorPercent,
    unit: '%',
    trend,
    change: changePercent,
  };

  return <MetricWidget metric={metric} />;
}
