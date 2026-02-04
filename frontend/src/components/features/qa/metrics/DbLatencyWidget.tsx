/**
 * DbLatencyWidget - Database latency metric
 * Specialized metric for DB query times
 */

import { MetricWidget } from './MetricWidget';
import type { MetricData } from './types';

interface DbLatencyWidgetProps {
  avgMs: number;
  trend: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export function DbLatencyWidget({ avgMs, trend, changePercent }: DbLatencyWidgetProps) {
  const metric: MetricData = {
    id: 'db-latency',
    label: 'DB Latency',
    value: avgMs,
    unit: 'ms',
    trend,
    change: changePercent,
  };

  return <MetricWidget metric={metric} />;
}
