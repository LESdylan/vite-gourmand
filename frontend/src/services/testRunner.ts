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
 * Generates fresh results each time with random variations
 * Note: These are SIMULATED results. For real tests, use:
 * - Backend: `make test` or `npm run test`
 * - Postman: `make test:postman` or `npm run test:postman`
 */
export function getMockTestResults(): RunTestsResponse {
  // Random slight variations in timing to simulate real tests
  const randomDuration = (base: number) => Math.max(1, base + Math.floor(Math.random() * 20) - 10);
  
  // Create timestamp to track when this run was generated
  const runId = Date.now();
  
  // Unit tests are generally stable - use consistent statuses
  const tests: Array<{ id: string; name: string; suite: string; status: 'passed' | 'failed'; duration: number }> = [
    { id: `app-ctrl-1-${runId}`, name: 'AppController › should return hello', suite: 'app.controller.spec.ts', status: 'passed', duration: randomDuration(12) },
    { id: `app-ctrl-2-${runId}`, name: 'AppController › should return version', suite: 'app.controller.spec.ts', status: 'passed', duration: randomDuration(8) },
    { id: `order-svc-1-${runId}`, name: 'OrderService › should create order', suite: 'order.service.spec.ts', status: 'passed', duration: randomDuration(45) },
    { id: `order-svc-2-${runId}`, name: 'OrderService › should validate items', suite: 'order.service.spec.ts', status: 'passed', duration: randomDuration(23) },
    { id: `guards-1-${runId}`, name: 'Guards › JwtAuthGuard › should allow valid token', suite: 'guards.spec.ts', status: 'passed', duration: randomDuration(15) },
    { id: `guards-2-${runId}`, name: 'Guards › RolesGuard › should block unauthorized', suite: 'guards.spec.ts', status: 'passed', duration: randomDuration(11) },
  ];

  // Postman tests - these depend on backend state and can have issues
  // Simulating realistic scenarios where backend may not be ready
  const postmanTests: Array<{ id: string; name: string; suite: string; status: 'passed' | 'failed'; duration: number }> = [
    { id: `auth-login-${runId}`, name: 'Auth › Login with valid credentials', suite: 'auth.json', status: 'passed', duration: randomDuration(234) },
    { id: `auth-register-${runId}`, name: 'Auth › Register new user', suite: 'auth.json', status: 'passed', duration: randomDuration(189) },
    { id: `orders-create-${runId}`, name: 'Orders › Create new order', suite: 'orders.json', status: 'passed', duration: randomDuration(312) },
    { id: `orders-list-${runId}`, name: 'Orders › List user orders', suite: 'orders.json', status: 'passed', duration: randomDuration(156) },
    { id: `admin-stats-${runId}`, name: 'Admin › Get dashboard stats', suite: 'admin.json', status: 'passed', duration: randomDuration(98) },
  ];

  const unitPassed = tests.length; // All passed in mock
  const unitFailed = 0;
  const unitDuration = tests.reduce((sum, t) => sum + (t.duration || 0), 0);

  const postmanPassed = postmanTests.length; // All passed in mock
  const postmanFailed = 0;
  const postmanDuration = postmanTests.reduce((sum, t) => sum + (t.duration || 0), 0);

  return {
    success: unitFailed + postmanFailed === 0,
    suites: [
      {
        name: 'Unit Tests',
        type: 'jest',
        tests,
        totalPassed: unitPassed,
        totalFailed: unitFailed,
        totalDuration: unitDuration,
      },
      {
        name: 'Postman Collection',
        type: 'postman',
        tests: postmanTests,
        totalPassed: postmanPassed,
        totalFailed: postmanFailed,
        totalDuration: postmanDuration,
      },
    ],
    summary: {
      total: tests.length + postmanTests.length,
      passed: unitPassed + postmanPassed,
      failed: unitFailed + postmanFailed,
      duration: unitDuration + postmanDuration,
    },
  };
}
