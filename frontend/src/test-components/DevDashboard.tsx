/**
 * Developer Testing Dashboard
 * ============================
 * Professional engineering-style dashboard for API testing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './DevDashboard.module.css';
import type { TestCase, TestResult, TestCategory, LogEntry } from './types';
import { allTests, getTestsByCategory } from './utils/testDefinitions';
import { runTest, formatDuration } from './utils/testRunner';
import { api, getAuthToken } from './utils/apiClient';

type ViewMode = 'tests' | 'manual' | 'logs';
type RightPanelTab = 'details' | 'request' | 'response';

interface TestState {
  status: 'idle' | 'running' | 'passed' | 'failed' | 'error';
  result?: TestResult;
}

const CATEGORIES: { id: TestCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Tests', icon: '📋' },
  { id: 'health', label: 'Health', icon: '💚' },
  { id: 'auth', label: 'Authentication', icon: '🔐' },
  { id: 'menu', label: 'Menu & Dishes', icon: '🍽️' },
  { id: 'order', label: 'Orders', icon: '📦' },
  { id: 'admin', label: 'Admin', icon: '👑' },
  { id: 'validation', label: 'Validation', icon: '✅' },
];

export function DevDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | 'all'>('all');
  const [testStates, setTestStates] = useState<Map<string, TestState>>(new Map());
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tests');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('details');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  
  // Manual API tester state
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET');
  const [apiEndpoint, setApiEndpoint] = useState('/');
  const [apiBody, setApiBody] = useState('');
  const [apiUseAuth, setApiUseAuth] = useState(false);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [apiLoading, setApiLoading] = useState(false);

  const logIdRef = useRef(0);

  // Add log entry
  const addLog = useCallback((level: LogEntry['level'], message: string, data?: unknown) => {
    const entry: LogEntry = {
      id: `log-${++logIdRef.current}`,
      timestamp: new Date(),
      level,
      message,
      data,
    };
    setLogs(prev => [entry, ...prev].slice(0, 500)); // Keep last 500 logs
  }, []);

  // Check API connection on mount
  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await api.get('/');
        setIsConnected(response.success);
        addLog('info', `API connection ${response.success ? 'established' : 'failed'}`, { 
          status: response.status 
        });
      } catch {
        setIsConnected(false);
        addLog('error', 'Failed to connect to API');
      }
    }
    checkConnection();
  }, [addLog]);

  // Get filtered tests
  const filteredTests = getTestsByCategory(selectedCategory);

  // Calculate stats
  const stats = {
    total: filteredTests.length,
    passed: Array.from(testStates.values()).filter(s => s.status === 'passed').length,
    failed: Array.from(testStates.values()).filter(s => s.status === 'failed' || s.status === 'error').length,
    pending: filteredTests.length - Array.from(testStates.values()).filter(s => s.status !== 'idle').length,
  };

  // Run single test
  const runSingleTest = async (test: TestCase) => {
    setTestStates(prev => new Map(prev).set(test.id, { status: 'running' }));
    addLog('info', `Running test: ${test.name}`);
    
    const result = await runTest(test);
    
    setTestStates(prev => new Map(prev).set(test.id, { 
      status: result.status,
      result,
    }));
    
    addLog(
      result.status === 'passed' ? 'info' : 'error',
      `Test ${result.status}: ${test.name} (${formatDuration(result.duration)})`,
      result.details
    );

    if (selectedTest?.id === test.id) {
      setSelectedTest(test);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningAll(true);
    addLog('info', `Starting test suite: ${filteredTests.length} tests`);
    
    for (const test of filteredTests) {
      await runSingleTest(test);
    }
    
    setIsRunningAll(false);
    addLog('info', `Test suite completed: ${stats.passed} passed, ${stats.failed} failed`);
  };

  // Clear all results
  const clearResults = () => {
    setTestStates(new Map());
    setSelectedTest(null);
    addLog('info', 'Test results cleared');
  };

  // Manual API request
  const sendManualRequest = async () => {
    setApiLoading(true);
    setApiResponse('');
    
    let body: Record<string, unknown> | undefined = undefined;
    if (apiBody.trim()) {
      try {
        body = JSON.parse(apiBody) as Record<string, unknown>;
      } catch {
        setApiResponse('Error: Invalid JSON in request body');
        setApiLoading(false);
        return;
      }
    }

    addLog('info', `Manual request: ${apiMethod} ${apiEndpoint}`);
    
    let response;
    if (apiMethod === 'GET' || apiMethod === 'DELETE') {
      response = await api[apiMethod.toLowerCase() as 'get' | 'delete'](
        apiEndpoint,
        { useAuth: apiUseAuth }
      );
    } else {
      response = await api[apiMethod.toLowerCase() as 'post' | 'put' | 'patch'](
        apiEndpoint,
        body,
        { useAuth: apiUseAuth }
      );
    }
    
    setApiResponse(JSON.stringify(response, null, 2));
    addLog(response.success ? 'info' : 'warn', `Response: ${response.status} ${response.statusText}`);
    setApiLoading(false);
  };

  // Get test state
  const getTestState = (testId: string): TestState => {
    return testStates.get(testId) || { status: 'idle' };
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span>🔧</span>
            <span>Vite Gourmand DevTools</span>
          </div>
          <span className={styles.version}>v1.0.0</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.statusIndicator}>
            <span 
              className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}
            />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {getAuthToken() && (
            <span className={styles.version}>🔑 Authenticated</span>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className={styles.mainLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Views</div>
            <div 
              className={`${styles.navItem} ${viewMode === 'tests' ? styles.active : ''}`}
              onClick={() => setViewMode('tests')}
            >
              <span className={styles.navIcon}>🧪</span>
              <span className={styles.navLabel}>Automated Tests</span>
            </div>
            <div 
              className={`${styles.navItem} ${viewMode === 'manual' ? styles.active : ''}`}
              onClick={() => setViewMode('manual')}
            >
              <span className={styles.navIcon}>🔌</span>
              <span className={styles.navLabel}>API Tester</span>
            </div>
            <div 
              className={`${styles.navItem} ${viewMode === 'logs' ? styles.active : ''}`}
              onClick={() => setViewMode('logs')}
            >
              <span className={styles.navIcon}>📜</span>
              <span className={styles.navLabel}>Logs</span>
              {logs.length > 0 && (
                <span className={styles.navBadge}>{logs.length}</span>
              )}
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Test Categories</div>
            {CATEGORIES.map(cat => {
              const catTests = cat.id === 'all' ? allTests : allTests.filter(t => t.category === cat.id);
              const catPassed = catTests.filter(t => getTestState(t.id).status === 'passed').length;
              const catFailed = catTests.filter(t => 
                getTestState(t.id).status === 'failed' || getTestState(t.id).status === 'error'
              ).length;
              
              return (
                <div 
                  key={cat.id}
                  className={`${styles.navItem} ${selectedCategory === cat.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className={styles.navIcon}>{cat.icon}</span>
                  <span className={styles.navLabel}>{cat.label}</span>
                  {catPassed > 0 && (
                    <span className={`${styles.navBadge} ${styles.passed}`}>{catPassed}</span>
                  )}
                  {catFailed > 0 && (
                    <span className={`${styles.navBadge} ${styles.failed}`}>{catFailed}</span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          {viewMode === 'tests' && (
            <>
              {/* Stats */}
              <div className={styles.statsBar}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Total</div>
                  <div className={`${styles.statValue} ${styles.total}`}>{stats.total}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Passed</div>
                  <div className={`${styles.statValue} ${styles.passed}`}>{stats.passed}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Failed</div>
                  <div className={`${styles.statValue} ${styles.failed}`}>{stats.failed}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Pending</div>
                  <div className={styles.statValue}>{stats.pending}</div>
                </div>
              </div>

              {/* Toolbar */}
              <div className={styles.toolbar}>
                <div className={styles.toolbarGroup}>
                  <button 
                    className={`${styles.btn} ${styles.btnSuccess}`}
                    onClick={runAllTests}
                    disabled={isRunningAll}
                  >
                    {isRunningAll ? (
                      <>
                        <span className={styles.spinner} /> Running...
                      </>
                    ) : (
                      '▶ Run All Tests'
                    )}
                  </button>
                  <button 
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={clearResults}
                  >
                    🗑 Clear Results
                  </button>
                </div>
                <div className={styles.toolbarDivider} />
                <div className={styles.toolbarGroup}>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>
                    Category: {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </span>
                </div>
              </div>

              {/* Test Table */}
              <table className={styles.testTable}>
                <thead>
                  <tr>
                    <th className={styles.statusCell}>Status</th>
                    <th>Test Name</th>
                    <th>Description</th>
                    <th className={styles.durationCell}>Duration</th>
                    <th className={styles.actionsCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map(test => {
                    const state = getTestState(test.id);
                    return (
                      <tr 
                        key={test.id}
                        onClick={() => setSelectedTest(test)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className={styles.statusCell}>
                          <span className={`${styles.statusBadge} ${styles[state.status]}`}>
                            {state.status === 'running' ? (
                              <span className={styles.spinner} />
                            ) : (
                              getStatusIcon(state.status)
                            )}
                            {state.status}
                          </span>
                        </td>
                        <td>
                          <strong>{test.name}</strong>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {test.id}
                          </div>
                        </td>
                        <td style={{ color: '#9ca3af' }}>{test.description}</td>
                        <td className={styles.durationCell}>
                          {state.result ? formatDuration(state.result.duration) : '-'}
                        </td>
                        <td className={styles.actionsCell}>
                          <button
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              runSingleTest(test);
                            }}
                            disabled={state.status === 'running'}
                          >
                            Run
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}

          {viewMode === 'manual' && (
            <div className={styles.apiTester}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>🔌 Manual API Tester</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Method</label>
                  <select 
                    className={styles.select}
                    value={apiMethod}
                    onChange={e => setApiMethod(e.target.value as typeof apiMethod)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Endpoint</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={apiEndpoint}
                    onChange={e => setApiEndpoint(e.target.value)}
                    placeholder="/auth/login"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Request Body (JSON)</label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  value={apiBody}
                  onChange={e => setApiBody(e.target.value)}
                  placeholder='{"email": "test@example.com", "password": "Test12345!"}'
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={apiUseAuth}
                    onChange={e => setApiUseAuth(e.target.checked)}
                  />
                  <span>Include Authorization Header</span>
                </label>
                {!getAuthToken() && apiUseAuth && (
                  <span style={{ color: '#f59e0b', fontSize: '12px' }}>
                    ⚠ No token available. Run login test first.
                  </span>
                )}
              </div>

              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={sendManualRequest}
                disabled={apiLoading}
              >
                {apiLoading ? 'Sending...' : '🚀 Send Request'}
              </button>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Response</label>
                <pre className={styles.responseViewer}>
                  {apiResponse || 'Response will appear here...'}
                </pre>
              </div>

              {/* Quick actions */}
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#9ca3af' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/');
                      setApiBody('');
                    }}
                  >
                    Health Check
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => {
                      setApiMethod('POST');
                      setApiEndpoint('/auth/login');
                      setApiBody(JSON.stringify({
                        email: 'testuser@example.com',
                        password: 'Test12345!'
                      }, null, 2));
                    }}
                  >
                    Login
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/menus');
                      setApiBody('');
                    }}
                  >
                    List Menus
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/dishes');
                      setApiBody('');
                    }}
                  >
                    List Dishes
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/auth/me');
                      setApiBody('');
                      setApiUseAuth(true);
                    }}
                  >
                    Get Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'logs' && (
            <div className={styles.logViewer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>📜 Activity Log</h2>
                <button
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                  onClick={() => setLogs([])}
                >
                  Clear Logs
                </button>
              </div>
              {logs.length === 0 ? (
                <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
                  No logs yet. Run some tests to see activity.
                </div>
              ) : (
                logs.map(entry => (
                  <div key={entry.id} className={styles.logEntry}>
                    <span className={styles.logTime}>
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`${styles.logLevel} ${styles[entry.level]}`}>
                      [{entry.level.toUpperCase()}]
                    </span>
                    <span>{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        {/* Right Panel - Test Details */}
        <aside className={styles.rightPanel}>
          <div className={styles.panelTabs}>
            <button
              className={`${styles.panelTab} ${rightPanelTab === 'details' ? styles.active : ''}`}
              onClick={() => setRightPanelTab('details')}
            >
              Details
            </button>
            <button
              className={`${styles.panelTab} ${rightPanelTab === 'request' ? styles.active : ''}`}
              onClick={() => setRightPanelTab('request')}
            >
              Request
            </button>
            <button
              className={`${styles.panelTab} ${rightPanelTab === 'response' ? styles.active : ''}`}
              onClick={() => setRightPanelTab('response')}
            >
              Response
            </button>
          </div>
          
          <div className={styles.panelContent}>
            {!selectedTest ? (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
                Select a test to view details
              </div>
            ) : (
              <div className={styles.testDetails}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>
                  {selectedTest.name}
                </h3>
                
                {rightPanelTab === 'details' && (
                  <>
                    <div className={styles.detailSection}>
                      <div className={styles.detailTitle}>Test ID</div>
                      <div className={styles.detailContent}>{selectedTest.id}</div>
                    </div>
                    <div className={styles.detailSection}>
                      <div className={styles.detailTitle}>Category</div>
                      <div className={styles.detailContent}>{selectedTest.category}</div>
                    </div>
                    <div className={styles.detailSection}>
                      <div className={styles.detailTitle}>Description</div>
                      <div className={styles.detailContent}>{selectedTest.description}</div>
                    </div>
                    {getTestState(selectedTest.id).result && (
                      <>
                        <div className={styles.detailSection}>
                          <div className={styles.detailTitle}>Status</div>
                          <div className={styles.detailContent}>
                            <span className={`${styles.statusBadge} ${styles[getTestState(selectedTest.id).status]}`}>
                              {getStatusIcon(getTestState(selectedTest.id).status)} {getTestState(selectedTest.id).status}
                            </span>
                          </div>
                        </div>
                        <div className={styles.detailSection}>
                          <div className={styles.detailTitle}>Message</div>
                          <div className={styles.detailContent}>
                            {getTestState(selectedTest.id).result?.message}
                          </div>
                        </div>
                        <div className={styles.detailSection}>
                          <div className={styles.detailTitle}>Duration</div>
                          <div className={styles.detailContent}>
                            {formatDuration(getTestState(selectedTest.id).result?.duration || 0)}
                          </div>
                        </div>
                        {getTestState(selectedTest.id).result?.details && (
                          <div className={styles.detailSection}>
                            <div className={styles.detailTitle}>Additional Details</div>
                            <pre className={styles.detailContent}>
                              {JSON.stringify(getTestState(selectedTest.id).result?.details, null, 2)}
                            </pre>
                          </div>
                        )}
                        {getTestState(selectedTest.id).result?.error && (
                          <div className={styles.detailSection}>
                            <div className={styles.detailTitle}>Error</div>
                            <pre className={styles.detailContent} style={{ color: '#fca5a5' }}>
                              {JSON.stringify(getTestState(selectedTest.id).result?.error, null, 2)}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {rightPanelTab === 'request' && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailTitle}>Request Details</div>
                    <pre className={styles.detailContent}>
                      {getTestState(selectedTest.id).result?.request 
                        ? JSON.stringify(getTestState(selectedTest.id).result?.request, null, 2)
                        : 'Run the test to see request details'}
                    </pre>
                  </div>
                )}

                {rightPanelTab === 'response' && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailTitle}>Response Details</div>
                    <pre className={styles.detailContent}>
                      {getTestState(selectedTest.id).result?.response 
                        ? JSON.stringify(getTestState(selectedTest.id).result?.response, null, 2)
                        : 'Run the test to see response details'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'passed': return '✓';
    case 'failed': return '✗';
    case 'error': return '⚠';
    case 'running': return '◌';
    default: return '○';
  }
}

export default DevDashboard;
