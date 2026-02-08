/**
 * Test Runner Types
 * Shared interfaces for test execution
 */

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
  rawOutput?: string; // Verbose CLI output
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
  timestamp: string;
  rawOutput?: string; // Combined verbose output
}

export interface TestRunOptions {
  verbose?: boolean;
}

export type TestType = 'unit' | 'e2e' | 'orders';
