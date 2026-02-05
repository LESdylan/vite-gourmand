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
  const { autoTests, metrics, isRunning, runAll, rawOutput } = testRunner;
  const { logs, connected, clear } = useMockLogs();

  // Metrics dashboard only for test-automatics
  const showMetricsDashboard = activeCategory === 'test-automatics';
  // Run All button for test categories
  const showRunAllButton = activeCategory === 'test-automatics';
  // Show CLI output for test-automatics (always visible)
  const showCliOutput = activeCategory === 'test-automatics';

  return (
    <main className="devboard-content">
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
