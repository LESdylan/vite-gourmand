/**
 * ResponseTimeWidget - API response time metric
 * Specialized metric for response times
 */

import { MetricWidget } from './MetricWidget';
import type { MetricData } from './types';

interface ResponseTimeWidgetProps {
  avgMs: number;
  trend: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export function ResponseTimeWidget({ avgMs, trend, changePercent }: ResponseTimeWidgetProps) {
  const metric: MetricData = {
    id: 'response-time',
    label: 'Avg Response Time',
    value: avgMs,
    unit: 'ms',
    trend,
    change: changePercent,
  };

  return <MetricWidget metric={metric} />;
}
