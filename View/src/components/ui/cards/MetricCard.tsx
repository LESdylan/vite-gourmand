/**
 * MetricCard - Card for displaying metrics/KPIs
 * Used for dashboard statistics
 */

import { BaseCard } from './BaseCard';
import './MetricCard.css';

export type MetricTrend = 'up' | 'down' | 'stable';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: MetricTrend;
  trendValue?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, unit, trend, trendValue, icon }: MetricCardProps) {
  return (
    <BaseCard className="metric-card">
      <MetricCardHeader label={label} icon={icon} />
      <MetricCardValue value={value} unit={unit} />
      {trend && trendValue && <MetricCardTrend trend={trend} value={trendValue} />}
    </BaseCard>
  );
}

function MetricCardHeader({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="metric-card-header">
      <span className="metric-card-label">{label}</span>
      {icon && <span className="metric-card-icon">{icon}</span>}
    </div>
  );
}

function MetricCardValue({ value, unit }: { value: string | number; unit?: string }) {
  return (
    <div className="metric-card-value-container">
      <span className="metric-card-value">{value}</span>
      {unit && <span className="metric-card-unit">{unit}</span>}
    </div>
  );
}

function MetricCardTrend({ trend, value }: { trend: MetricTrend; value: string }) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  return (
    <div className={`metric-card-trend metric-card-trend-${trend}`}>
      <span>{trendIcon}</span>
      <span>{value}</span>
    </div>
  );
}
