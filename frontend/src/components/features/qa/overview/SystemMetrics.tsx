/**
 * SystemMetrics - Key system metrics grid
 * Shows important KPIs for application health
 */

import { ChartIcon, TargetIcon, PerformanceIcon, ClockIcon } from '../../../icons/FlyIcons';
import './SystemMetrics.css';

interface SystemMetricsProps {
  testCount: number;
  passRate: number;
  avgDuration: number;
  lastRun: Date | null;
}

export function SystemMetrics({ testCount, passRate, avgDuration, lastRun }: SystemMetricsProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const metrics = [
    {
      label: 'Test Coverage',
      value: `${testCount}`,
      unit: 'tests',
      status: testCount >= 10 ? 'good' : 'warning',
      Icon: ChartIcon,
    },
    {
      label: 'Reliability',
      value: `${passRate}`,
      unit: '%',
      status: passRate >= 95 ? 'good' : passRate >= 80 ? 'warning' : 'critical',
      Icon: TargetIcon,
    },
    {
      label: 'Performance',
      value: `${avgDuration}`,
      unit: 'ms avg',
      status: avgDuration < 100 ? 'good' : avgDuration < 300 ? 'warning' : 'critical',
      Icon: PerformanceIcon,
    },
    {
      label: 'Last Run',
      value: formatTime(lastRun),
      unit: '',
      status: 'neutral',
      Icon: ClockIcon,
    },
  ];

  return (
    <div className="system-metrics">
      <h4 className="system-metrics-title">System Metrics</h4>
      
      <div className="system-metrics-grid">
        {metrics.map(metric => (
          <div 
            key={metric.label} 
            className={`system-metric-card system-metric-card--${metric.status}`}
          >
            <span className="system-metric-icon">
              <metric.Icon size={20} />
            </span>
            <div className="system-metric-content">
              <span className="system-metric-label">{metric.label}</span>
              <div className="system-metric-value-row">
                <span className="system-metric-value">{metric.value}</span>
                {metric.unit && <span className="system-metric-unit">{metric.unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
