/**
 * DevBoardContent - Main content area
 * Renders metrics and category-specific content - Fly.io style
 */

import { MetricsDashboard } from '../features/qa/metrics';
import { TestCardGrid } from '../features/qa/test-cards';
import { AutoTestList, RunAllButton } from '../features/qa/automatic-tests';
import { Overview } from '../features/qa/overview';
import { Activity } from '../features/qa/activity';
import { LogViewer, useMockLogs } from '../features/logs';
import { DatabaseViewer } from '../database';
import type { TestCategory } from '../features/qa/sidebar';
import { useMockData } from './useMockData';
import type { useTestRunner } from './useTestRunner';
import { VerboseOutput } from './VerboseOutput';
import './DevBoardContent.css';

interface DevBoardContentProps {
  activeCategory: TestCategory;
  testRunner: ReturnType<typeof useTestRunner>;
}

const categoryLabels: Record<TestCategory, string> = {
  overview: 'Overview',
  'test-automatics': 'Tests Automatiques',
  scenarios: 'Scénarios',
  database: 'Database',
  settings: 'Settings',
  logs: 'Live Logs',
  metrics: 'Metrics',
  activity: 'Activity',
};

export function DevBoardContent({ activeCategory, testRunner }: DevBoardContentProps) {
  const { tests } = useMockData(activeCategory);
  const { autoTests, metrics, isRunning, runAll, rawOutput, error } = testRunner;
  const { logs, connected, clear } = useMockLogs();

  // Metrics dashboard only for test-automatics
  const showMetricsDashboard = activeCategory === 'test-automatics';
  // Run All button for test categories
  const showRunAllButton = activeCategory === 'test-automatics';
  // Show CLI output for test-automatics (always visible)
  const showCliOutput = activeCategory === 'test-automatics';

  return (
    <main className="devboard-content">
      {/* Error banner for backend connectivity issues */}
      {error && activeCategory === 'test-automatics' && (
        <div style={{
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          background: 'var(--color-error-bg)',
          border: '1px solid var(--color-error-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error-text)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <strong>Error: </strong>{error}
            {error.includes('Backend') && (
              <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
                Run: <code style={{ 
                  background: 'rgba(0,0,0,0.1)', 
                  padding: '2px 6px', 
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace'
                }}>cd backend && npm run start:dev</code>
              </div>
            )}
          </div>
        </div>
      )}

      {showMetricsDashboard && (
        <section className="devboard-content-metrics">
          <MetricsDashboard 
            totalTests={metrics.total}
            passedTests={metrics.passed}
            failedTests={metrics.failed}
            passRate={metrics.passRate}
          />
        </section>
      )}

      <section className="devboard-content-main">
        <header className="devboard-content-header">
          <h2 className="devboard-content-title">
            {categoryLabels[activeCategory]}
          </h2>
          <div className="devboard-content-actions">
            {showRunAllButton && (
              <RunAllButton 
                count={autoTests.length} 
                onRun={runAll}
                isRunning={isRunning}
              />
            )}
          </div>
        </header>

        <div className="devboard-cards-container">
          {renderContent(activeCategory, tests, autoTests, logs, connected, clear, metrics, isRunning)}
        </div>

        {showCliOutput && (
          <VerboseOutput output={rawOutput} isVisible={true} />
        )}
      </section>
    </main>
  );
}

function renderContent(
  category: TestCategory,
  tests: ReturnType<typeof useMockData>['tests'],
  autoTests: ReturnType<typeof useTestRunner>['autoTests'],
  logs: ReturnType<typeof useMockLogs>['logs'],
  connected: boolean,
  clear: () => void,
  metrics: ReturnType<typeof useTestRunner>['metrics'],
  isRunning: boolean
) {
  switch (category) {
    case 'overview':
      return <Overview metrics={metrics} isRunning={isRunning} />;
    case 'scenarios':
      return <TestCardGrid tests={tests} />;
    case 'database':
      return <DatabaseViewer />;
    case 'logs':
      return <LogViewer logs={logs} connected={connected} onClear={clear} />;
    case 'activity':
      return <Activity />;
    default:
      return <AutoTestList tests={autoTests} />;
  }
}
