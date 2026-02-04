/**
 * DevBoardContent - Main content area
 * Renders metrics and category-specific content - Fly.io style
 */

import { MetricsDashboard } from '../features/qa/metrics';
import { TestCardGrid } from '../features/qa/test-cards';
import { AutoTestList, RunAllButton } from '../features/qa/automatic-tests';
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
  logs: 'Logs & Errors',
  metrics: 'Metrics',
  activity: 'Activity',
};

export function DevBoardContent({ activeCategory }: DevBoardContentProps) {
  const { tests } = useMockData(activeCategory);
  const { autoTests, metrics, isRunning, runAll } = useTestRunner();

  return (
    <main className="devboard-content">
      <section className="devboard-content-metrics">
        <MetricsDashboard 
          totalTests={metrics.total}
          passedTests={metrics.passed}
          failedTests={metrics.failed}
          passRate={metrics.passRate}
        />
      </section>

      <section className="devboard-content-main">
        <header className="devboard-content-header">
          <h2 className="devboard-content-title">
            {categoryLabels[activeCategory]}
          </h2>
          {activeCategory !== 'scenarios' && activeCategory !== 'settings' && (
            <RunAllButton 
              count={autoTests.length} 
              onRun={runAll}
              isRunning={isRunning}
            />
          )}
        </header>

        <div className="devboard-cards-container">
          {activeCategory === 'scenarios' ? (
            <TestCardGrid tests={tests} />
          ) : (
            <AutoTestList tests={autoTests} />
          )}
        </div>
      </section>
    </main>
  );
}
