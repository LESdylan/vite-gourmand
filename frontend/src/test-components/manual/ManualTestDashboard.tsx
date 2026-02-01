/**
 * Manual Test Dashboard
 * Interactive testing interface with database visualization
 */

import React, { useState, useCallback, useEffect } from 'react';
import styles from './ManualTestDashboard.module.css';
import { categories, getScenariosByCategory } from './scenarios';
import { apiService, type ApiResponse } from './apiService';
import type { 
  ManualTestScenario, 
  TestStep, 
  StepResult, 
  FormField,
  DatabaseState,
  SelectOption
} from './types';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warn' | 'error' | 'api';
  message: string;
}

export const ManualTestDashboard: React.FC = () => {
  // State
  const [activeCategory, setActiveCategory] = useState<string>('auth');
  const [activeScenario, setActiveScenario] = useState<ManualTestScenario | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState<Map<string, StepResult>>(new Map());
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [rightPanelTab, setRightPanelTab] = useState<'database' | 'response'>('response');
  const [lastResponse, setLastResponse] = useState<ApiResponse | null>(null);
  const [databaseStates, setDatabaseStates] = useState<DatabaseState[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, Array<{value: string; label: string}>>>({});
  const [authVersion, setAuthVersion] = useState(0); // Triggers re-render on auth changes

  // Auth state from API service (re-computed when authVersion changes)
  const authState = React.useMemo(() => apiService.getAuthState(), [authVersion]);

  // Function to refresh auth state (call after login/logout)
  const refreshAuthState = useCallback(() => {
    setAuthVersion(v => v + 1);
  }, []);

  // Add log entry
  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  // Initialize form with default values when scenario/step changes
  useEffect(() => {
    if (!activeScenario) return;
    
    const step = activeScenario.steps[currentStepIndex];
    if (step?.type === 'form' && step.config.fields) {
      const defaults: Record<string, string> = {};
      step.config.fields.forEach(field => {
        if (field.defaultValue) {
          defaults[field.name] = field.defaultValue;
        }
      });
      setFormData(prev => ({ ...prev, ...defaults }));
    }
  }, [activeScenario, currentStepIndex]);

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveScenario(null);
    setCurrentStepIndex(0);
    setStepResults(new Map());
    setFormData({});
  };

  // Handle scenario click
  const handleScenarioClick = (scenario: ManualTestScenario) => {
    setActiveScenario(scenario);
    setCurrentStepIndex(0);
    setStepResults(new Map());
    setFormData({});
    setSelectedItems(new Set());
    setSliderValues({});
    setSelectValues({});
    addLog('info', `Started scenario: ${scenario.name}`);
  };

  // Handle form input change
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle toggle change
  const handleToggleChange = (item: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  // Handle slider change
  const handleSliderChange = (name: string, value: number) => {
    setSliderValues(prev => ({ ...prev, [name]: value }));
  };

  // Handle select change
  const handleSelectChange = (stepId: string, value: string) => {
    setSelectValues(prev => ({ ...prev, [stepId]: value }));
  };

  // Execute a step
  const executeStep = async (step: TestStep) => {
    setIsRunning(true);
    
    // Mark step as running
    setStepResults(prev => new Map(prev).set(step.id, {
      stepId: step.id,
      status: 'running',
      timestamp: new Date()
    }));

    addLog('api', `Executing step: ${step.name}`);

    try {
      let response: ApiResponse | null = null;
      let stepData: unknown = null;

      switch (step.type) {
        case 'api-call': {
          const endpoint = step.config.endpoint || '';
          const method = step.config.method || 'GET';
          
          // Build request body from form data
          let body: Record<string, unknown> | undefined;
          
          if (method !== 'GET') {
            body = { ...formData };
            
            // Add selected items if any
            if (selectedItems.size > 0) {
              body.items = Array.from(selectedItems);
            }
            
            // Add slider values
            Object.entries(sliderValues).forEach(([key, value]) => {
              body![key] = value;
            });
          }

          addLog('api', `${method} ${endpoint}`);
          
          // Determine if auth should be used
          const useAuth = endpoint !== '/auth/login' && endpoint !== '/auth/register';
          
          response = await apiService.request(method, endpoint, body, useAuth);
          setLastResponse(response);

          if (response.success) {
            addLog('success', `✓ ${method} ${endpoint} - ${response.status} (${response.duration}ms)`);
            
            // Update dynamic options for select steps (e.g., after loading orders)
            if (Array.isArray(response.data)) {
              const options = (response.data as Array<{id: string; name?: string}>).map(item => ({
                value: item.id,
                label: item.name || item.id
              }));
              setDynamicOptions(prev => ({ ...prev, [step.id]: options }));
            }
            
            // Simulate database state update
            simulateDatabaseUpdate(endpoint, method, response.data);
            
            // Refresh auth state if login/register endpoint
            if (endpoint === '/auth/login' || endpoint === '/auth/register') {
              refreshAuthState();
              addLog('success', '🔐 Authentication successful!');
            }
          } else {
            // Extract detailed error message from response
            let errorDetails = response.error || response.statusText;
            const responseData = response.data as Record<string, unknown> | null;
            if (responseData) {
              if (Array.isArray(responseData.message)) {
                errorDetails = responseData.message.join(', ');
              } else if (typeof responseData.message === 'string') {
                errorDetails = responseData.message;
              } else if (Array.isArray(responseData)) {
                errorDetails = (responseData as string[]).join(', ');
              }
            }
            addLog('error', `✗ ${method} ${endpoint} - ${response.status}: ${errorDetails}`);
            
            // Log the full response for debugging
            console.error('API Error Response:', response);
          }

          stepData = response.data;
          break;
        }

        case 'form': {
          // Form steps are just data collection, mark as success immediately
          addLog('success', 'Form data collected');
          stepData = formData;
          response = { success: true } as ApiResponse;
          break;
        }

        case 'select': {
          const selectedValue = selectValues[step.id];
          if (!selectedValue) {
            response = { success: false, error: 'No option selected' } as ApiResponse;
            addLog('warn', 'Please select an option');
          } else {
            response = { success: true } as ApiResponse;
            addLog('success', `Selected: ${selectedValue}`);
            
            // For edge case testing, update form data based on selection
            if (step.id === 'edge-case-select') {
              applyEdgeCaseData(selectedValue);
            }
          }
          break;
        }

        case 'toggle':
        case 'slider':
        case 'display': {
          // These are interactive UI elements, mark as success
          response = { success: true } as ApiResponse;
          break;
        }

        case 'button': {
          // Handle button actions
          if (step.config.buttonAction === 'retry-login') {
            response = await apiService.post('/auth/login', {
              email: formData.email || authState.userEmail,
              password: formData.newPassword
            }, false);
            setLastResponse(response);
            
            if (response.success) {
              addLog('success', 'Login with new password successful!');
            } else {
              addLog('error', 'Login with new password failed');
            }
          } else {
            response = { success: true } as ApiResponse;
          }
          break;
        }
      }

      // Update step result
      const result: StepResult = {
        stepId: step.id,
        status: response?.success ? 'success' : 'error',
        message: response?.success ? 'Step completed successfully' : (response?.error || 'Step failed'),
        data: stepData,
        duration: (response as ApiResponse)?.duration,
        timestamp: new Date()
      };

      setStepResults(prev => new Map(prev).set(step.id, result));

      // If successful, move to next step
      if (response?.success && activeScenario && currentStepIndex < activeScenario.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }

    } catch (error) {
      addLog('error', `Step failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setStepResults(prev => new Map(prev).set(step.id, {
        stepId: step.id,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }));
    }

    setIsRunning(false);
  };

  // Apply edge case test data
  const applyEdgeCaseData = (testCase: string) => {
    switch (testCase) {
      case 'wrong-password':
        setFormData({ email: 'testuser@example.com', password: 'wrongpassword123' });
        break;
      case 'wrong-email':
        setFormData({ email: 'nonexistent@example.com', password: 'password123' });
        break;
      case 'empty-password':
        setFormData({ email: 'testuser@example.com', password: '' });
        break;
      case 'empty-email':
        setFormData({ email: '', password: 'password123' });
        break;
      case 'sql-injection':
        setFormData({ email: "'; DROP TABLE users; --", password: 'password123' });
        break;
      case 'xss-attempt':
        setFormData({ email: '<script>alert("xss")</script>@test.com', password: 'password123' });
        break;
    }
  };

  // Simulate database state update (for visualization)
  const simulateDatabaseUpdate = (endpoint: string, method: string, data: unknown) => {
    if (!data) return;

    let table = '';
    let changeType: 'insert' | 'update' | 'delete' = 'update';

    if (endpoint.includes('/auth/register') || endpoint.includes('/users')) {
      table = 'users';
      if (method === 'POST') changeType = 'insert';
    } else if (endpoint.includes('/orders')) {
      table = 'orders';
      if (method === 'POST') changeType = 'insert';
    } else if (endpoint.includes('/dishes')) {
      table = 'dishes';
      if (method === 'POST') changeType = 'insert';
    } else if (endpoint.includes('/menus')) {
      table = 'menus';
    }

    if (table && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>;
      const columns = Object.keys(dataObj).filter(k => 
        !['password', 'accessToken', 'refreshToken'].includes(k)
      );
      
      const dbState: DatabaseState = {
        table,
        columns: columns.slice(0, 6), // Limit columns
        rows: [dataObj],
        lastUpdated: new Date(),
        changeType,
        changedRowIds: [dataObj.id as string || 'new']
      };

      setDatabaseStates(prev => {
        const existing = prev.findIndex(s => s.table === table);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = dbState;
          return updated;
        }
        return [...prev, dbState];
      });
    }
  };

  // Reset scenario
  const resetScenario = () => {
    if (activeScenario) {
      setCurrentStepIndex(0);
      setStepResults(new Map());
      setFormData({});
      setSelectedItems(new Set());
      setSliderValues({});
      setSelectValues({});
      addLog('info', 'Scenario reset');
    }
  };

  // Logout
  const handleLogout = () => {
    apiService.clearAuth();
    refreshAuthState();
    addLog('info', 'Logged out');
    setDatabaseStates([]);
    setLastResponse(null);
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Render form field
  const renderFormField = (field: FormField): React.JSX.Element => {
    const value = formData[field.name] || '';
    
    if (field.type === 'textarea') {
      return (
        <textarea
          className={`${styles.formInput} ${styles.formTextarea}`}
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          placeholder={field.placeholder}
        />
      );
    }

    return (
      <input
        type={field.type}
        className={styles.formInput}
        value={value}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        placeholder={field.placeholder}
      />
    );
  };

  // Get status class helper
  const getStatusClassName = (status: string): string => {
    switch (status) {
      case 'success': return styles.success;
      case 'error': return styles.error;
      case 'running': return styles.running;
      default: return styles.pending;
    }
  };

  // Render select dropdown
  const renderSelectDropdown = (step: TestStep): React.JSX.Element => {
    const selectOptions: SelectOption[] = dynamicOptions[step.id] || step.config.options || [];
    return (
      <div className={styles.formGroup}>
        <select
          className={`${styles.formInput} ${styles.formSelect}`}
          value={selectValues[step.id] || ''}
          onChange={(e) => handleSelectChange(step.id, e.target.value)}
        >
          <option value="">Select an option...</option>
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  };

  // Render step content based on type
  const renderStepContent = (step: TestStep, index: number): React.JSX.Element => {
    const result = stepResults.get(step.id);
    const isActive = index === currentStepIndex;
    const isPast = index < currentStepIndex;
    const status = result?.status || 'pending';

    return (
      <div key={step.id} className={styles.stepCard}>
        <div className={styles.stepCardHeader}>
          <div className={styles.stepName}>
            <span>{index + 1}.</span>
            {step.name}
          </div>
          <span className={`${styles.stepStatus} ${getStatusClassName(status)}`}>
            {status}
          </span>
        </div>
        
        <div className={styles.stepCardContent}>
          <div className={styles.stepDescription}>{step.description}</div>

          {/* Form fields */}
          {step.type === 'form' && step.config.fields && (isActive || isPast) && (
            <div>
              {step.config.fields.map(field => (
                <div key={field.name} className={styles.formGroup}>
                  <label className={`${styles.formLabel} ${field.required ? styles.required : ''}`}>
                    {field.label}
                  </label>
                  {renderFormField(field)}
                </div>
              ))}
            </div>
          )}

          {step.type === 'select' && (isActive || isPast) ? renderSelectDropdown(step) : null}

          {/* Toggle items */}
          {step.type === 'toggle' && lastResponse?.data && isActive ? (
            <div className={styles.toggleGroup}>
              {Array.isArray(lastResponse.data) && (lastResponse.data as Array<{id: string; name: string}>).map((item) => (
                <label key={item.id} className={`${styles.toggleItem} ${selectedItems.has(item.id) ? styles.active : ''}`}>
                  <input
                    type="checkbox"
                    className={styles.toggleCheckbox}
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleToggleChange(item.id)}
                  />
                  <span className={styles.toggleLabel}>{item.name}</span>
                </label>
              ))}
            </div>
          ) : null}

          {/* Slider */}
          {step.type === 'slider' && isActive && (
            <div className={styles.sliderGroup}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Quantity</span>
                <span className={styles.sliderValue}>{sliderValues.quantity || 1}</span>
              </div>
              <input
                type="range"
                className={styles.slider}
                min="1"
                max="10"
                value={sliderValues.quantity || 1}
                onChange={(e) => handleSliderChange('quantity', parseInt(e.target.value))}
              />
            </div>
          )}

          {/* Button action */}
          {step.type === 'button' && isActive && (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => executeStep(step)}
              disabled={isRunning}
            >
              {isRunning && <span className={styles.spinner} />}
              {step.config.buttonText}
            </button>
          )}

          {/* Execute button for API and form steps */}
          {(step.type === 'api-call' || step.type === 'form' || step.type === 'select') && isActive && (
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => executeStep(step)}
                disabled={isRunning}
              >
                {isRunning && <span className={styles.spinner} />}
                {step.type === 'api-call' ? 'Execute Request' : 'Continue'}
              </button>
            </div>
          )}

          {/* Show result if error */}
          {result?.status === 'error' && result.message && (
            <div className={`${styles.resultBody} ${styles.error}`} style={{ marginTop: '12px' }}>
              <pre>Error: {result.message}</pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get scenarios for active category
  const categoryScenarios = getScenariosByCategory(activeCategory);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>
            🧪 Manual Testing Dashboard
          </div>
          <div className={`${styles.authStatus} ${authState.isAuthenticated ? styles.authenticated : styles.unauthenticated}`}>
            <span className={`${styles.authDot} ${authState.isAuthenticated ? styles.authenticated : styles.unauthenticated}`} />
            {authState.isAuthenticated ? (
              <span>Logged in as {authState.userEmail}</span>
            ) : (
              <span>Not authenticated</span>
            )}
          </div>
        </div>
        <div className={styles.headerActions}>
          {authState.isAuthenticated && (
            <button className={`${styles.headerBtn} ${styles.danger}`} onClick={handleLogout}>
              Logout
            </button>
          )}
          <button className={styles.headerBtn} onClick={clearLogs}>
            Clear Logs
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.categoryTitle}>Test Categories</div>
          {categories.map(cat => (
            <React.Fragment key={cat.id}>
              <div
                className={`${styles.categoryItem} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
              </div>
              {activeCategory === cat.id && (
                <div className={styles.scenarioList}>
                  {categoryScenarios.map(scenario => (
                    <div
                      key={scenario.id}
                      className={`${styles.scenarioItem} ${activeScenario?.id === scenario.id ? styles.active : ''}`}
                      onClick={() => handleScenarioClick(scenario)}
                    >
                      <span>{scenario.icon}</span>
                      <span>{scenario.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </aside>

        {/* Center Panel */}
        <main className={styles.centerPanel}>
          {activeScenario ? (
            <>
              <div className={styles.workspaceHeader}>
                <div>
                  <div className={styles.workspaceTitle}>
                    {activeScenario.icon} {activeScenario.name}
                  </div>
                  <div className={styles.workspaceDescription}>
                    {activeScenario.description}
                  </div>
                </div>
                <div className={styles.stepIndicator}>
                  {activeScenario.steps.map((step, idx) => {
                    const result = stepResults.get(step.id);
                    let dotClass = '';
                    if (result?.status === 'success') dotClass = styles.completed;
                    else if (result?.status === 'error') dotClass = styles.error;
                    else if (idx === currentStepIndex) dotClass = styles.active;

                    return (
                      <React.Fragment key={step.id}>
                        <div className={`${styles.stepDot} ${dotClass}`}>
                          {result?.status === 'success' ? '✓' : 
                           result?.status === 'error' ? '✗' : idx + 1}
                        </div>
                        {idx < activeScenario.steps.length - 1 && (
                          <div className={`${styles.stepConnector} ${result?.status === 'success' ? styles.completed : ''}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              <div className={styles.workspaceContent}>
                {activeScenario.steps.map((step, idx) => renderStepContent(step, idx))}
                
                <div className={styles.buttonGroup}>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetScenario}>
                    Reset Scenario
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🧪</div>
              <div className={styles.emptyText}>Select a test scenario to begin</div>
              <div className={styles.emptyHint}>Choose a category from the sidebar, then select a scenario</div>
            </div>
          )}
        </main>

        {/* Right Panel */}
        <aside className={styles.rightPanel}>
          <div className={styles.panelTabs}>
            <button
              className={`${styles.panelTab} ${rightPanelTab === 'response' ? styles.active : ''}`}
              onClick={() => setRightPanelTab('response')}
            >
              API Response
            </button>
            <button
              className={`${styles.panelTab} ${rightPanelTab === 'database' ? styles.active : ''}`}
              onClick={() => setRightPanelTab('database')}
            >
              Database State
            </button>
          </div>
          
          <div className={styles.panelContent}>
            {rightPanelTab === 'response' && (
              <>
                {lastResponse ? (
                  <>
                    <div className={styles.resultSection}>
                      <div className={styles.resultHeader}>
                        <span className={styles.resultTitle}>
                          {lastResponse.success ? '✓' : '✗'} {lastResponse.request.method} {lastResponse.request.url.replace('http://localhost:3000/api', '')}
                        </span>
                        <span className={styles.resultMeta}>
                          {lastResponse.status} • {lastResponse.duration}ms
                        </span>
                      </div>
                      <div className={`${styles.resultBody} ${lastResponse.success ? styles.success : styles.error}`}>
                        <pre>{JSON.stringify(lastResponse.data, null, 2)}</pre>
                      </div>
                    </div>
                    
                    {lastResponse.request.body && (
                      <div className={styles.resultSection}>
                        <div className={styles.resultHeader}>
                          <span className={styles.resultTitle}>Request Body</span>
                        </div>
                        <div className={styles.resultBody}>
                          <pre>{JSON.stringify(lastResponse.request.body, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📡</div>
                    <div className={styles.emptyText}>No API response yet</div>
                    <div className={styles.emptyHint}>Execute a test step to see results</div>
                  </div>
                )}
              </>
            )}

            {rightPanelTab === 'database' && (
              <>
                {databaseStates.length > 0 ? (
                  databaseStates.map(dbState => {
                    const getChangeTypeClass = () => {
                      switch (dbState.changeType) {
                        case 'insert': return styles.insert;
                        case 'update': return styles.update;
                        case 'delete': return styles.delete;
                        default: return '';
                      }
                    };
                    return (
                    <div key={dbState.table} className={styles.dbSection}>
                      <div className={styles.dbTableHeader}>
                        <span className={styles.dbTableName}>
                          📊 {dbState.table}
                        </span>
                        {dbState.changeType && dbState.changeType !== 'none' && (
                          <span className={`${styles.dbChangeIndicator} ${getChangeTypeClass()}`}>
                            {dbState.changeType}
                          </span>
                        )}
                      </div>
                      <table className={styles.dbTable}>
                        <thead>
                          <tr>
                            {dbState.columns.map(col => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dbState.rows.map((row, idx) => (
                            <tr 
                              key={idx} 
                              className={dbState.changeType === 'insert' ? styles.new : 
                                        dbState.changeType === 'update' ? styles.changed : ''}
                            >
                              {dbState.columns.map(col => (
                                <td key={col} title={String(row[col] || '')}>
                                  {String(row[col] || '-').substring(0, 20)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );})
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🗄️</div>
                    <div className={styles.emptyText}>No database changes yet</div>
                    <div className={styles.emptyHint}>Execute mutations to see data changes</div>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Logs Panel */}
      <div className={styles.logsPanel}>
        <div className={styles.logsPanelHeader}>
          <div className={styles.logsPanelTitle}>
            📋 Activity Log
            <span className={styles.logCount}>{logs.length}</span>
          </div>
        </div>
        <div className={styles.logsContent}>
          {logs.slice(-20).map(log => {
            const getLogTypeClass = () => {
              switch (log.type) {
                case 'success': return styles.success;
                case 'error': return styles.error;
                case 'warn': return styles.warn;
                case 'api': return styles.api;
                default: return styles.info;
              }
            };
            return (
            <div key={log.id} className={styles.logEntry}>
              <span className={styles.logTime}>
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span className={`${styles.logType} ${getLogTypeClass()}`}>
                {log.type}
              </span>
              <span className={styles.logMessage}>{log.message}</span>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
};

export default ManualTestDashboard;
