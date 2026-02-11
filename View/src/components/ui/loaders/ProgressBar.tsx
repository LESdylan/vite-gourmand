/**
 * ProgressBar - Linear progress indicator
 * Used for showing completion progress
 */

import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  variant = 'default',
}: ProgressBarProps) {
  const percentage = calculatePercentage(value, max);
  const classes = buildClasses(variant);

  return (
    <div className="progress-bar-container">
      <div
        className={classes}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <span className="progress-bar-label">{percentage}%</span>}
    </div>
  );
}

function calculatePercentage(value: number, max: number): number {
  return Math.min(Math.round((value / max) * 100), 100);
}

function buildClasses(variant: string): string {
  return ['progress-bar', `progress-bar-${variant}`].join(' ');
}
