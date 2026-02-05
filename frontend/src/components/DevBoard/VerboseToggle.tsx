/**
 * Verbose Toggle Button
 * Toggle switch for verbose CLI output mode
 */
import React from 'react';
import './VerboseToggle.css';

interface VerboseToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export const VerboseToggle: React.FC<VerboseToggleProps> = ({ isActive, onToggle }) => {
  return (
    <button
      className={`verbose-toggle ${isActive ? 'verbose-toggle--active' : ''}`}
      onClick={onToggle}
      title={isActive ? 'Hide raw CLI output' : 'Show raw CLI output (proves tests are real)'}
    >
      <span className="verbose-toggle__icon">📟</span>
      <span className="verbose-toggle__label">Verbose</span>
      <span className={`verbose-toggle__indicator ${isActive ? 'verbose-toggle__indicator--on' : ''}`}>
        {isActive ? 'ON' : 'OFF'}
      </span>
    </button>
  );
};
