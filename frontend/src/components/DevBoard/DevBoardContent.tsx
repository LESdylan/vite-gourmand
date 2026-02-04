/**
 * DevBoardContent - Main content area
 * Renders metrics and category-specific content
 */

import { MetricsDashboard } from '../features/qa/metrics';
import { TestCardGrid } from '../features/qa/test-cards';
import { AutoTestList, RunAllButton } from '../features/qa/automatic-tests';
import type { TestCategory } from '../features/qa/sidebar';
import { DEFAULT_METRICS } from './constants';
import { useMockData } from './useMockData';
import './DevBoardContent.css';

interface DevBoardContentProps {
  activeCategory: TestCategory;
}

const categoryLabels: Record<TestCategory, string> = {
  performance: '⚡ Performance',
  api: '🔌 API',
  database: '🗄️ Database',
  security: '🔒 Security',
  regression: '🔄 Regression',
  manual: '✋ Manual Validation',
};

export function DevBoardContent({ activeCategory }: DevBoardContentProps) {
  const { tests, autoTests } = useMockData(activeCategory);

  return (
    <main className="devboard-content">
      <section className="devboard-content-metrics">
        <MetricsDashboard {...DEFAULT_METRICS} />
      </section>

      <section className="devboard-content-main">
        <header className="devboard-content-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 className="devboard-content-title">
              {categoryLabels[activeCategory]} Tests
            </h2>
            <span className="devboard-live-badge">Live</span>
          </div>
          {activeCategory !== 'manual' && (
            <RunAllButton count={autoTests.length} />
          )}
        </header>

        {activeCategory === 'manual' ? (
          <TestCardGrid tests={tests} />
        ) : (
          <AutoTestList tests={autoTests} />
        )}
      </section>
    </main>
  );
}
