/**
 * Spinner - Circular loading indicator
 * Used for inline and overlay loading states
 */

import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label = 'Chargement...' }: SpinnerProps) {
  const classes = buildClasses(size);
  
  return (
    <div className={classes} role="status" aria-label={label}>
      <svg className="spinner-svg" viewBox="0 0 24 24" fill="none">
        <circle
          className="spinner-track"
          cx="12"
          cy="12"
          r="10"
          strokeWidth="3"
        />
        <circle
          className="spinner-progress"
          cx="12"
          cy="12"
          r="10"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function buildClasses(size: string): string {
  return ['spinner', `spinner-${size}`].join(' ');
}
