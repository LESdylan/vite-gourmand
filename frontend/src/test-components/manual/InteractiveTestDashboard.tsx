/**
 * Interactive Test Dashboard
 * Full CRUD testing with experimental users and real database visualization
 */

import React, { useState, useCallback, useEffect } from 'react';
import styles from './InteractiveTestDashboard.module.css';

const API_BASE = 'http://localhost:3000/api';

// Types
interface User {
  id: number;
  email: string;
  firstName: string;
  telephoneNumber?: string;
  city?: string;
  country?: string;
  roleId: number;
  role?: { id: number; libelle: string };
}

interface ApiResponse {
  success: boolean;
  status: number;
  data: unknown;
  error?: string;
  duration: number;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'api' | 'db';
  message: string;
}

interface DatabaseSnapshot {
  table: string;
  data: Record<string, unknown>[];
  timestamp: Date;
}

// API Helper
const api = {
  token: null as string | null,
  currentUser: null as User | null,

  async request(method: string, endpoint: string, body?: unknown): Promise<ApiResponse> {
    const start = performance.now();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => null);
      return {
        success: res.ok,
        status: res.status,
        data,
        error: !res.ok ? (data?.message || res.statusText) : undefined,
        duration: Math.round(performance.now() - start),
      };
    } catch (e) {
      return {
        success: false,
        status: 0,
        data: null,
        error: e instanceof Error ? e.message : 'Network error',
        duration: Math.round(performance.now() - start),
      };
    }
  },

  setAuth(token: string, user: User) {
    this.token = token;
    this.currentUser = user;
  },

  clearAuth() {
    this.token = null;
    this.currentUser = null;
  },
};

// Action Categories
const actionCategories = [
  {
    id: 'auth',
    name: 'Authentication',
    icon: '🔐',
    actions: [
      { id: 'login', name: 'Login as User', method: 'POST', endpoint: '/auth/login' },
      { id: 'register', name: 'Register New', method: 'POST', endpoint: '/auth/register' },
      { id: 'me', name: 'Get Current User', method: 'GET', endpoint: '/auth/me' },
      { id: 'change-password', name: 'Change Password', method: 'PUT', endpoint: '/auth/change-password' },
      { id: 'logout', name: 'Logout', method: 'LOCAL', endpoint: '' },
    ],
  },
  {
    id: 'profile',
    name: 'User Profile',
    icon: '👤',
    actions: [
      { id: 'get-profile', name: 'Get My Profile', method: 'GET', endpoint: '/user/me' },
      { id: 'update-profile', name: 'Update Profile', method: 'PUT', endpoint: '/user/me' },
      { id: 'gdpr-consent', name: 'GDPR Consent', method: 'POST', endpoint: '/user/me/gdpr-consent' },
      { id: 'export-data', name: 'Export My Data', method: 'GET', endpoint: '/user/me/export' },
    ],
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: '🛒',
    actions: [
      { id: 'list-orders', name: 'List My Orders', method: 'GET', endpoint: '/orders' },
      { id: 'create-order', name: 'Create Order', method: 'POST', endpoint: '/orders' },
      { id: 'get-order', name: 'Get Order by ID', method: 'GET', endpoint: '/orders/:id' },
      { id: 'update-status', name: 'Update Order Status', method: 'PATCH', endpoint: '/orders/:id/status' },
      { id: 'delete-order', name: 'Cancel Order', method: 'DELETE', endpoint: '/orders/:id' },
    ],
  },
  {
    id: 'menu',
    name: 'Menu & Dishes',
    icon: '🍽️',
    actions: [
      { id: 'list-menus', name: 'List Menus', method: 'GET', endpoint: '/menus' },
      { id: 'get-menu', name: 'Get Menu by ID', method: 'GET', endpoint: '/menus/:id' },
      { id: 'list-dishes', name: 'List Dishes', method: 'GET', endpoint: '/dishes' },
      { id: 'get-dish', name: 'Get Dish by ID', method: 'GET', endpoint: '/dishes/:id' },
      { id: 'create-dish', name: 'Create Dish (Admin)', method: 'POST', endpoint: '/dishes' },
    ],
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: '⚙️',
    actions: [
      { id: 'admin-stats', name: 'Get Stats', method: 'GET', endpoint: '/admin/stats' },
      { id: 'admin-users', name: 'List All Users', method: 'GET', endpoint: '/admin/users' },
      { id: 'admin-orders', name: 'List All Orders', method: 'GET', endpoint: '/admin/orders' },
      { id: 'admin-roles', name: 'List Roles', method: 'GET', endpoint: '/admin/roles' },
    ],
  },
  {
    id: 'reviews',
    name: 'Reviews',
    icon: '⭐',
    actions: [
      { id: 'list-reviews', name: 'List Reviews', method: 'GET', endpoint: '/reviews' },
      { id: 'my-reviews', name: 'My Reviews', method: 'GET', endpoint: '/reviews/me' },
      { id: 'create-review', name: 'Create Review', method: 'POST', endpoint: '/reviews' },
    ],
  },
];

export const InteractiveTestDashboard: React.FC = () => {
  // State
  const [experimentalUsers, setExperimentalUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCategory, setActiveCategory] = useState('auth');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastResponse, setLastResponse] = useState<ApiResponse | null>(null);
  const [dbSnapshots, setDbSnapshots] = useState<DatabaseSnapshot[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rightTab, setRightTab] = useState<'response' | 'database' | 'diff'>('response');

  // Logging
  const log = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      type,
      message,
    }]);
  }, []);

  // Load experimental users on mount
  useEffect(() => {
    loadExperimentalUsers();
  }, []);

  const loadExperimentalUsers = async () => {
    log('info', 'Loading experimental users...');
    const res = await api.request('GET', '/admin/users');
    if (res.success && Array.isArray(res.data)) {
      const experimental = (res.data as User[]).filter(u => u.role?.libelle === 'experimental' || u.roleId === 4);
      setExperimentalUsers(experimental);
      log('success', `Found ${experimental.length} experimental users`);
    } else {
      // Fallback: try to get users without auth (will fail, but show message)
      log('error', 'Could not load users. Try logging in as admin first.');
    }
  };

  // Login as selected user
  const loginAsUser = async (user: User) => {
    log('api', `Attempting login as ${user.email}...`);
    // For experimental users, we use a known test password
    const res = await api.request('POST', '/auth/login', {
      email: user.email,
      password: 'password123', // Standard test password for experimental users
    });

    setLastResponse(res);

    if (res.success) {
      const data = res.data as { accessToken: string; user: User };
      api.setAuth(data.accessToken, data.user);
      setSelectedUser(data.user);
      setIsAuthenticated(true);
      log('success', `✓ Logged in as ${user.email} (${res.duration}ms)`);
      await captureDbSnapshot('User');
    } else {
      log('error', `✗ Login failed: ${res.error}`);
    }
  };

  // Logout
  const handleLogout = () => {
    api.clearAuth();
    setSelectedUser(null);
    setIsAuthenticated(false);
    log('info', 'Logged out');
  };

  // Capture database snapshot
  const captureDbSnapshot = async (table: string) => {
    log('db', `Capturing ${table} table snapshot...`);
    let endpoint = '';
    switch (table) {
      case 'User':
        endpoint = '/admin/users';
        break;
      case 'Order':
        endpoint = '/orders';
        break;
      case 'Menu':
        endpoint = '/menus';
        break;
      case 'Dish':
        endpoint = '/dishes';
        break;
      default:
        return;
    }

    const res = await api.request('GET', endpoint);
    if (res.success && Array.isArray(res.data)) {
      setDbSnapshots(prev => [...prev, {
        table,
        data: res.data as Record<string, unknown>[],
        timestamp: new Date(),
      }]);
      log('db', `✓ Captured ${(res.data as unknown[]).length} ${table} records`);
    }
  };

  // Execute action
  const executeAction = async (action: { id: string; name: string; method: string; endpoint: string }) => {
    if (action.method === 'LOCAL') {
      if (action.id === 'logout') {
        handleLogout();
      }
      return;
    }

    setIsLoading(true);
    
    // Capture "before" snapshot
    const relatedTable = getRelatedTable(action.endpoint);
    if (relatedTable) {
      await captureDbSnapshot(relatedTable);
    }

    // Build endpoint with ID if needed
    let endpoint = action.endpoint;
    if (endpoint.includes(':id') && formData.id) {
      endpoint = endpoint.replace(':id', formData.id);
    }

    log('api', `${action.method} ${endpoint}`);

    // Build request body
    let body: Record<string, unknown> | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(action.method)) {
      body = { ...formData };
      // Remove 'id' from body as it's in URL
      delete body.id;
      
      // Special handling for different actions
      if (action.id === 'create-order') {
        body = {
          items: formData.items ? JSON.parse(formData.items) : [{ dishId: 1, quantity: 1 }],
          notes: formData.notes || '',
        };
      }
    }

    const res = await api.request(action.method, endpoint, body);
    setLastResponse(res);

    if (res.success) {
      log('success', `✓ ${action.name} - ${res.status} (${res.duration}ms)`);
      
      // Handle auth responses
      if (action.id === 'login' || action.id === 'register') {
        const data = res.data as { accessToken?: string; user?: User };
        if (data.accessToken && data.user) {
          api.setAuth(data.accessToken, data.user);
          setSelectedUser(data.user);
          setIsAuthenticated(true);
        }
      }
      
      // Capture "after" snapshot
      if (relatedTable) {
        await captureDbSnapshot(relatedTable);
      }
    } else {
      const errorMsg = Array.isArray(res.error) ? res.error.join(', ') : res.error;
      log('error', `✗ ${action.name} - ${res.status}: ${errorMsg}`);
    }

    setIsLoading(false);
  };

  // Get related table for an endpoint
  const getRelatedTable = (endpoint: string): string | null => {
    if (endpoint.includes('/user') || endpoint.includes('/auth')) return 'User';
    if (endpoint.includes('/order')) return 'Order';
    if (endpoint.includes('/menu')) return 'Menu';
    if (endpoint.includes('/dish')) return 'Dish';
    return null;
  };

  // Get form fields for action
  const getFormFields = (actionId: string): Array<{ name: string; label: string; type: string; required?: boolean }> => {
    switch (actionId) {
      case 'login':
        return [
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
        ];
      case 'register':
        return [
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
        ];
      case 'update-profile':
        return [
          { name: 'firstName', label: 'First Name', type: 'text' },
          { name: 'telephoneNumber', label: 'Phone', type: 'text' },
          { name: 'city', label: 'City', type: 'text' },
          { name: 'country', label: 'Country', type: 'text' },
        ];
      case 'change-password':
        return [
          { name: 'currentPassword', label: 'Current Password', type: 'password', required: true },
          { name: 'newPassword', label: 'New Password', type: 'password', required: true },
        ];
      case 'get-order':
      case 'update-status':
      case 'delete-order':
        return [{ name: 'id', label: 'Order ID', type: 'number', required: true }];
      case 'create-order':
        return [
          { name: 'items', label: 'Items (JSON)', type: 'text' },
          { name: 'notes', label: 'Notes', type: 'text' },
        ];
      case 'get-menu':
        return [{ name: 'id', label: 'Menu ID', type: 'number', required: true }];
      case 'get-dish':
        return [{ name: 'id', label: 'Dish ID', type: 'number', required: true }];
      case 'create-dish':
        return [
          { name: 'name', label: 'Dish Name', type: 'text', required: true },
          { name: 'price', label: 'Price', type: 'number', required: true },
          { name: 'description', label: 'Description', type: 'text' },
        ];
      case 'create-review':
        return [
          { name: 'dishId', label: 'Dish ID', type: 'number', required: true },
          { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
          { name: 'comment', label: 'Comment', type: 'text' },
        ];
      default:
        return [];
    }
  };

  // Render log type class
  const getLogClass = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return styles.logSuccess;
      case 'error': return styles.logError;
      case 'api': return styles.logApi;
      case 'db': return styles.logDb;
      default: return styles.logInfo;
    }
  };

  const activeActions = actionCategories.find(c => c.id === activeCategory)?.actions || [];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>🧪 Interactive Test Lab</h1>
          <span className={styles.subtitle}>Full CRUD Testing with Database Visualization</span>
        </div>
        <div className={styles.headerRight}>
          <div className={`${styles.authStatus} ${isAuthenticated ? styles.authenticated : styles.unauthenticated}`}>
            <span className={`${styles.authDot} ${isAuthenticated ? styles.authenticated : styles.unauthenticated}`} />
            {isAuthenticated ? (
              <span>Logged in as: <strong>{selectedUser?.email}</strong></span>
            ) : (
              <span>Not authenticated</span>
            )}
          </div>
          {isAuthenticated && (
            <button className={`${styles.headerBtn} ${styles.danger}`} onClick={handleLogout}>
              Logout
            </button>
          )}
          <button className={styles.headerBtn} onClick={() => setLogs([])}>
            Clear Logs
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Left Sidebar - Users & Categories */}
        <aside className={styles.sidebar}>
          {/* Experimental Users Section */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sectionTitle}>🧑‍🔬 Experimental Users</h3>
            <div className={styles.userList}>
              {experimentalUsers.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No experimental users found</p>
                  <button 
                    className={styles.actionBtn}
                    onClick={loadExperimentalUsers}
                  >
                    Reload Users
                  </button>
                </div>
              ) : (
                experimentalUsers.map(user => (
                  <div 
                    key={user.id}
                    className={`${styles.userCard} ${selectedUser?.id === user.id ? styles.selected : ''}`}
                    onClick={() => loginAsUser(user)}
                  >
                    <div className={styles.userAvatar}>
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.firstName || 'User'}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                    {selectedUser?.id === user.id && (
                      <span className={styles.activeBadge}>Active</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Categories */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sectionTitle}>📋 Actions</h3>
            <div className={styles.categoryList}>
              {actionCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setFormData({});
                  }}
                >
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <span className={styles.categoryCount}>{cat.actions.length}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Panel - Actions & Forms */}
        <main className={styles.centerPanel}>
          <div className={styles.actionPanel}>
            <h2 className={styles.panelTitle}>
              {actionCategories.find(c => c.id === activeCategory)?.icon}{' '}
              {actionCategories.find(c => c.id === activeCategory)?.name}
            </h2>
            
            <div className={styles.actionGrid}>
              {activeActions.map(action => {
                const fields = getFormFields(action.id);
                const needsAuth = !['login', 'register', 'list-menus', 'list-dishes', 'get-menu', 'get-dish'].includes(action.id);
                const isDisabled = needsAuth && !isAuthenticated;

                return (
                  <div key={action.id} className={`${styles.actionCard} ${isDisabled ? styles.disabled : ''}`}>
                    <div className={styles.actionHeader}>
                      <span className={`${styles.methodBadge} ${styles[action.method.toLowerCase()]}`}>
                        {action.method}
                      </span>
                      <span className={styles.actionName}>{action.name}</span>
                    </div>
                    
                    <div className={styles.actionEndpoint}>{action.endpoint}</div>

                    {fields.length > 0 && (
                      <div className={styles.actionForm}>
                        {fields.map(field => (
                          <div key={field.name} className={styles.formField}>
                            <label className={styles.fieldLabel}>
                              {field.label}
                              {field.required && <span className={styles.required}>*</span>}
                            </label>
                            <input
                              type={field.type}
                              className={styles.fieldInput}
                              value={formData[field.name] || ''}
                              onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                              placeholder={field.label}
                              disabled={isDisabled}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      className={`${styles.executeBtn} ${isLoading ? styles.loading : ''}`}
                      onClick={() => executeAction(action)}
                      disabled={isDisabled || isLoading}
                    >
                      {isLoading ? 'Running...' : 'Execute'}
                    </button>

                    {isDisabled && (
                      <div className={styles.authRequired}>🔒 Login required</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div className={styles.logPanel}>
            <h3 className={styles.logTitle}>📜 Activity Log</h3>
            <div className={styles.logList}>
              {logs.slice(-20).reverse().map(entry => (
                <div key={entry.id} className={`${styles.logEntry} ${getLogClass(entry.type)}`}>
                  <span className={styles.logTime}>
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={styles.logType}>{entry.type}</span>
                  <span className={styles.logMessage}>{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Panel - Response & Database */}
        <aside className={styles.rightPanel}>
          <div className={styles.rightTabs}>
            <button
              className={`${styles.tabBtn} ${rightTab === 'response' ? styles.active : ''}`}
              onClick={() => setRightTab('response')}
            >
              📤 Response
            </button>
            <button
              className={`${styles.tabBtn} ${rightTab === 'database' ? styles.active : ''}`}
              onClick={() => setRightTab('database')}
            >
              🗄️ Database
            </button>
            <button
              className={`${styles.tabBtn} ${rightTab === 'diff' ? styles.active : ''}`}
              onClick={() => setRightTab('diff')}
            >
              📊 Diff
            </button>
          </div>

          <div className={styles.rightContent}>
            {rightTab === 'response' && (
              <div className={styles.responseView}>
                {lastResponse ? (
                  <>
                    <div className={`${styles.statusBanner} ${lastResponse.success ? styles.success : styles.error}`}>
                      <span className={styles.statusCode}>{lastResponse.status}</span>
                      <span className={styles.statusDuration}>{lastResponse.duration}ms</span>
                    </div>
                    <pre className={styles.jsonView}>
                      {JSON.stringify(lastResponse.data, null, 2)}
                    </pre>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <p>Execute an action to see the response</p>
                  </div>
                )}
              </div>
            )}

            {rightTab === 'database' && (
              <div className={styles.databaseView}>
                {dbSnapshots.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No database snapshots yet</p>
                    <p className={styles.hint}>Execute actions to capture snapshots</p>
                  </div>
                ) : (
                  <div className={styles.snapshotList}>
                    {dbSnapshots.slice(-5).reverse().map((snapshot, idx) => (
                      <div key={idx} className={styles.snapshotCard}>
                        <div className={styles.snapshotHeader}>
                          <span className={styles.snapshotTable}>📊 {snapshot.table}</span>
                          <span className={styles.snapshotTime}>
                            {snapshot.timestamp.toLocaleTimeString()}
                          </span>
                          <span className={styles.snapshotCount}>
                            {snapshot.data.length} records
                          </span>
                        </div>
                        <div className={styles.snapshotData}>
                          <table className={styles.dataTable}>
                            <thead>
                              <tr>
                                {snapshot.data[0] && Object.keys(snapshot.data[0]).slice(0, 4).map(key => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {snapshot.data.slice(0, 5).map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                  {Object.values(row).slice(0, 4).map((val, colIdx) => (
                                    <td key={colIdx}>
                                      {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {snapshot.data.length > 5 && (
                            <div className={styles.moreRows}>
                              +{snapshot.data.length - 5} more rows
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {rightTab === 'diff' && (
              <div className={styles.diffView}>
                {dbSnapshots.length < 2 ? (
                  <div className={styles.emptyState}>
                    <p>Need at least 2 snapshots to show diff</p>
                    <p className={styles.hint}>Execute actions to capture before/after states</p>
                  </div>
                ) : (
                  <div className={styles.diffContent}>
                    <h4>Before → After Comparison</h4>
                    {(() => {
                      const before = dbSnapshots[dbSnapshots.length - 2];
                      const after = dbSnapshots[dbSnapshots.length - 1];
                      const added = after.data.length - before.data.length;
                      return (
                        <div className={styles.diffSummary}>
                          <div className={styles.diffTable}>{after.table}</div>
                          <div className={`${styles.diffChange} ${added >= 0 ? styles.added : styles.removed}`}>
                            {added >= 0 ? `+${added}` : added} records
                          </div>
                          <div className={styles.diffTimes}>
                            {before.timestamp.toLocaleTimeString()} → {after.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default InteractiveTestDashboard;
