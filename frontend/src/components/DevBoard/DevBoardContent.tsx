/**
 * DevBoardContent - Main content area
 * Renders metrics and category-specific content - Fly.io style
 */

import { MetricsDashboard } from '../features/qa/metrics';
import { TestCardGrid } from '../features/qa/test-cards';
import { AutoTestList, RunAllButton } from '../features/qa/automatic-tests';
import { Overview } from '../features/qa/overview';
import { LogViewer, useMockLogs } from '../features/logs';
import type { TestCategory } from '../features/qa/sidebar';
import { useMockData } from './useMockData';
import { useTestRunner } from './useTestRunner';
import './DevBoardContent.css';

interface DevBoardContentProps {
  activeCategory: TestCategory;
}

const categoryLabels: Record<TestCategory, string> = {
  overview: 'Overview',
  'test-automatics': 'Tests Automatiques',
  scenarios: 'Scénarios',
  settings: 'Settings',
  logs: 'Live Logs',
  metrics: 'Metrics',
  activity: 'Activity',
};

export function DevBoardContent({ activeCategory }: DevBoardContentProps) {
  const { tests } = useMockData(activeCategory);
  const { autoTests, metrics, isRunning, runAll } = useTestRunner();
  const { logs, connected, clear } = useMockLogs();

  // Overview doesn't show the metrics dashboard (it has its own)
  const showMetricsDashboard = activeCategory !== 'overview';
  // Only show Run All button for test categories
  const showRunAllButton = activeCategory === 'test-automatics' || activeCategory === 'metrics' || activeCategory === 'activity';

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
          {showRunAllButton && (
            <RunAllButton 
              count={autoTests.length} 
              onRun={runAll}
              isRunning={isRunning}
            />
          )}
        </header>

        <div className="devboard-cards-container">
          {renderContent(activeCategory, tests, autoTests, logs, connected, clear, metrics, isRunning)}
        </div>
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
    case 'logs':
      return <LogViewer logs={logs} connected={connected} onClear={clear} />;
    default:
      return <AutoTestList tests={autoTests} />;
  }
}
