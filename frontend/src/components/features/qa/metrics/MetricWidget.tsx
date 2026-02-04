/**
 * MetricWidget - Base metric display widget
 * Shows value, label, and trend
 */

import type { MetricData } from './types';
import './MetricWidget.css';

interface MetricWidgetProps {
  metric: MetricData;
}

const trendIcons = {
  up: '↑',
  down: '↓',
  stable: '→',
};

export function MetricWidget({ metric }: MetricWidgetProps) {
  const trendClass = `metric-widget-trend--${metric.trend}`;

  return (
    <article className="metric-widget">
      <span className="metric-widget-label">{metric.label}</span>
      <div className="metric-widget-value-row">
        <span className="metric-widget-value">{metric.value}</span>
        <span className="metric-widget-unit">{metric.unit}</span>
      </div>
      {metric.change !== undefined && (
        <span className={`metric-widget-trend ${trendClass}`}>
          {trendIcons[metric.trend]} {Math.abs(metric.change)}%
        </span>
      )}
    </article>
  );
}
