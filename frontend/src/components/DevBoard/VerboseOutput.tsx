/**
 * Verbose Output Panel
 * Displays raw CLI output from test execution
 */
import React from 'react';
import './VerboseOutput.css';

interface VerboseOutputProps {
  output: string | null;
  isVisible: boolean;
}

export const VerboseOutput: React.FC<VerboseOutputProps> = ({ output, isVisible }) => {
  if (!isVisible || !output) return null;

  return (
    <div className="verbose-output">
      <div className="verbose-output__header">
        <span className="verbose-output__title">📟 Raw CLI Output</span>
        <span className="verbose-output__badge">REAL BACKEND OUTPUT</span>
      </div>
      <pre className="verbose-output__content">{output}</pre>
    </div>
  );
};
