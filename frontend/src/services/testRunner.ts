/**
 * Test Runner Service
 * API service to run and fetch backend test results
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface TestResult {
  id: string;
  name: string;
  suite: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  output?: string;
}

export interface TestSuite {
  name: string;
  type: 'jest' | 'postman' | 'e2e';
  tests: TestResult[];
  totalPassed: number;
  totalFailed: number;
  totalDuration: number;
}

export interface RunTestsResponse {
  success: boolean;
  suites: TestSuite[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

/**
 * Available test configurations
 */
export const TEST_CONFIGS = {
  unit: {
    id: 'unit',
    name: 'Unit Tests',
    command: 'npm test',
    description: 'Jest unit tests for services and controllers',
    type: 'jest' as const,
  },
  e2e: {
    id: 'e2e',
    name: 'E2E Tests',
    command: 'npm run test:e2e',
    description: 'End-to-end API tests',
    type: 'jest' as const,
  },
  orders: {
    id: 'orders',
    name: 'Orders API',
    command: 'npm run test:orders',
    description: 'Order flow integration tests',
    type: 'jest' as const,
  },
  postman: {
    id: 'postman',
    name: 'Postman Collection',
    command: 'newman run',
    description: 'Postman API collection tests',
    type: 'postman' as const,
  },
};

export type TestConfigId = keyof typeof TEST_CONFIGS;

/**
 * Run a specific test suite
 */
export async function runTests(testId: TestConfigId): Promise<RunTestsResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/tests/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testId }),
    });

    if (!response.ok) {
      throw new Error(`Test run failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to run tests:', error);
    throw error;
  }
}

/**
 * Run all test suites
 */
export async function runAllTests(): Promise<RunTestsResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/tests/run-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Test run failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to run all tests:', error);
    throw error;
  }
}

/**
 * Get latest test results from cache
 */
export async function getTestResults(): Promise<RunTestsResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/api/tests/results`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No cached results
      }
      throw new Error(`Failed to fetch results: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch test results:', error);
    return null;
  }
}

/**
 * Get test status (running/idle)
 */
export async function getTestStatus(): Promise<{ running: boolean; currentTest?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/tests/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch test status:', error);
    return { running: false };
  }
}

/**
 * Parse Jest output into structured results
 */
export function parseJestOutput(output: string): TestResult[] {
  const results: TestResult[] = [];
  const lines = output.split('\n');
  
  let currentSuite = '';
  
  for (const line of lines) {
    // Match test suite
    const suiteMatch = line.match(/^\s*(PASS|FAIL)\s+(.+\.spec\.ts)/);
    if (suiteMatch) {
      currentSuite = suiteMatch[2];
    }
    
    // Match individual test
    const testMatch = line.match(/^\s*(✓|✕|○)\s+(.+?)\s*(?:\((\d+)\s*ms\))?$/);
    if (testMatch) {
      const [, icon, name, duration] = testMatch;
      results.push({
        id: `${currentSuite}-${name}`.replace(/\s+/g, '-').toLowerCase(),
        name,
        suite: currentSuite,
        status: icon === '✓' ? 'passed' : icon === '✕' ? 'failed' : 'idle',
        duration: duration ? parseInt(duration, 10) : undefined,
      });
    }
  }
  
  return results;
}

/**
 * Mock test data for development (when backend is not available)
 */
export function getMockTestResults(): RunTestsResponse {
  return {
    success: true,
    suites: [
      {
        name: 'Unit Tests',
        type: 'jest',
        tests: [
          { id: 'app-controller-1', name: 'AppController › should return hello', suite: 'app.controller.spec.ts', status: 'passed', duration: 12 },
          { id: 'app-controller-2', name: 'AppController › should return version', suite: 'app.controller.spec.ts', status: 'passed', duration: 8 },
          { id: 'order-service-1', name: 'OrderService › should create order', suite: 'order.service.spec.ts', status: 'passed', duration: 45 },
          { id: 'order-service-2', name: 'OrderService › should validate items', suite: 'order.service.spec.ts', status: 'passed', duration: 23 },
          { id: 'guards-1', name: 'Guards › JwtAuthGuard › should allow valid token', suite: 'guards.spec.ts', status: 'passed', duration: 15 },
          { id: 'guards-2', name: 'Guards › RolesGuard › should block unauthorized', suite: 'guards.spec.ts', status: 'passed', duration: 11 },
        ],
        totalPassed: 6,
        totalFailed: 0,
        totalDuration: 114,
      },
      {
        name: 'Postman Collection',
        type: 'postman',
        tests: [
          { id: 'auth-login', name: 'Auth › Login with valid credentials', suite: 'auth.json', status: 'passed', duration: 234 },
          { id: 'auth-register', name: 'Auth › Register new user', suite: 'auth.json', status: 'passed', duration: 189 },
          { id: 'orders-create', name: 'Orders › Create new order', suite: 'orders.json', status: 'passed', duration: 312 },
          { id: 'orders-list', name: 'Orders › List user orders', suite: 'orders.json', status: 'passed', duration: 156 },
          { id: 'admin-stats', name: 'Admin › Get dashboard stats', suite: 'admin.json', status: 'idle' },
        ],
        totalPassed: 4,
        totalFailed: 0,
        totalDuration: 891,
      },
    ],
    summary: {
      total: 11,
      passed: 10,
      failed: 0,
      duration: 1005,
    },
  };
}
