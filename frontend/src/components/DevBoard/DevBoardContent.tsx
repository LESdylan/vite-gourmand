/**
 * DevBoardContent - Main content area
 * Renders role-specific content based on current view
 */

import { MetricsDashboard } from '../features/qa/metrics';
import { TestCardGrid } from '../features/qa/test-cards';
import { AutoTestList, RunAllButton } from '../features/qa/automatic-tests';
import { Overview } from '../features/qa/overview';
import { Activity } from '../features/qa/activity';
import { LogViewer, useMockLogs } from '../features/logs';
import { DatabaseViewer } from '../database';
import type { TestCategory } from '../features/qa/sidebar';
import type { RoleView } from './constants';
import { useMockData } from './useMockData';
import type { useTestRunner } from './useTestRunner';
import { VerboseOutput } from './VerboseOutput';
// Admin widgets
import { AdminOverview, AdminOrders, AdminMenu, AdminStats, AdminSettings } from '../admin';
// Employee widgets
import { EmployeeOverview, EmployeeOrders, EmployeeTasks, EmployeeProfile } from '../employee';
import './DevBoardContent.css';

interface DevBoardContentProps {
  activeCategory: TestCategory;
  testRunner: ReturnType<typeof useTestRunner>;
  roleView?: RoleView;
}

const devLabels: Record<TestCategory, string> = {
  overview: 'Overview',
  'test-automatics': 'Tests Automatiques',
  scenarios: 'Scénarios',
  database: 'Database',
  settings: 'Settings',
  logs: 'Live Logs',
  metrics: 'Metrics',
  activity: 'Activity',
};

const adminLabels: Record<TestCategory, string> = {
  overview: 'Tableau de bord',
  'test-automatics': 'Tests',
  scenarios: 'Scénarios',
  database: 'Gestion Menu',
  settings: 'Paramètres',
  logs: 'Logs',
  metrics: 'Statistiques',
  activity: 'Commandes',
};

const employeeLabels: Record<TestCategory, string> = {
  overview: 'Mon Espace',
  'test-automatics': 'Tests',
  scenarios: 'Tâches',
  database: 'Database',
  settings: 'Profil',
  logs: 'Logs',
  metrics: 'Metrics',
  activity: 'Commandes',
};

function getLabels(roleView: RoleView): Record<TestCategory, string> {
  switch (roleView) {
    case 'admin': return adminLabels;
    case 'employee': return employeeLabels;
    default: return devLabels;
  }
}

export function DevBoardContent({ activeCategory, testRunner, roleView = 'dev' }: DevBoardContentProps) {
  const { tests } = useMockData(activeCategory);
  const { autoTests, metrics, isRunning, runAll, rawOutput, error } = testRunner;
  const { logs, connected, clear } = useMockLogs();

  const labels = getLabels(roleView);
  
  // Dev view specific features
  const isDev = roleView === 'dev';
  const showMetricsDashboard = isDev && activeCategory === 'test-automatics';
  const showRunAllButton = isDev && activeCategory === 'test-automatics';
  const showCliOutput = isDev && activeCategory === 'test-automatics';

  return (
    <main className="devboard-content">
      {/* Error banner for backend connectivity issues (dev view only) */}
      {error && isDev && activeCategory === 'test-automatics' && (
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
            passRate={Math.max(0, metrics.passRate)}
          />
        </section>
      )}

      <section className="devboard-content-main">
        <header className="devboard-content-header">
          <h2 className="devboard-content-title">
            {labels[activeCategory]}
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
          {renderContent(roleView, activeCategory, tests, autoTests, logs, connected, clear, metrics, isRunning)}
        </div>

        {showCliOutput && (
          <VerboseOutput output={rawOutput} isVisible={true} />
        )}
      </section>
    </main>
  );
}

function renderContent(
  roleView: RoleView,
  category: TestCategory,
  tests: ReturnType<typeof useMockData>['tests'],
  autoTests: ReturnType<typeof useTestRunner>['autoTests'],
  logs: ReturnType<typeof useMockLogs>['logs'],
  connected: boolean,
  clear: () => void,
  metrics: ReturnType<typeof useTestRunner>['metrics'],
  isRunning: boolean
) {
  // Route to role-specific content
  switch (roleView) {
    case 'admin':
      return renderAdminContent(category);
    case 'employee':
      return renderEmployeeContent(category);
    default:
      return renderDevContent(category, tests, autoTests, logs, connected, clear, metrics, isRunning);
  }
}

function renderDevContent(
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

function renderAdminContent(category: TestCategory) {
  switch (category) {
    case 'overview':
      return <AdminOverview />;
    case 'activity':
      return <AdminOrders />;
    case 'database':
      return <AdminMenu />;
    case 'metrics':
      return <AdminStats />;
    case 'settings':
      return <AdminSettings />;
    default:
      return <AdminOverview />;
  }
}

function renderEmployeeContent(category: TestCategory) {
  switch (category) {
    case 'overview':
      return <EmployeeOverview />;
    case 'activity':
      return <EmployeeOrders />;
    case 'scenarios':
      return <EmployeeTasks />;
    case 'settings':
      return <EmployeeProfile />;
    default:
      return <EmployeeOverview />;
  }
}
