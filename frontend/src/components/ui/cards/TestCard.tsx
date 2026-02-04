/**
 * TestCard - Card for displaying test information
 * Used for both automatic and manual tests
 */

import { BaseCard } from './BaseCard';
import './TestCard.css';

export type TestStatus = 'idle' | 'running' | 'success' | 'failed';
export type TestType = 'automatic' | 'manual';

interface TestCardProps {
  name: string;
  description: string;
  type: TestType;
  status: TestStatus;
  onClick?: () => void;
}

export function TestCard({
  name,
  description,
  type,
  status,
  onClick,
}: TestCardProps) {
  return (
    <BaseCard onClick={onClick} className="test-card">
      <TestCardHeader name={name} status={status} />
      <TestCardBody description={description} />
      <TestCardFooter type={type} />
    </BaseCard>
  );
}

function TestCardHeader({ name, status }: { name: string; status: TestStatus }) {
  return (
    <div className="test-card-header">
      <h3 className="test-card-name">{name}</h3>
      <StatusIndicator status={status} />
    </div>
  );
}

function TestCardBody({ description }: { description: string }) {
  return <p className="test-card-description">{description}</p>;
}

function TestCardFooter({ type }: { type: TestType }) {
  const typeLabel = type === 'automatic' ? '⚡ Automatique' : '👤 Manuel';
  return (
    <div className="test-card-footer">
      <span className={`test-card-type test-card-type-${type}`}>{typeLabel}</span>
    </div>
  );
}

function StatusIndicator({ status }: { status: TestStatus }) {
  return <span className={`test-card-status test-card-status-${status}`} aria-label={`Status: ${status}`} />;
}
