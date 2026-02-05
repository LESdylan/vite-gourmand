/**
 * Suite Factory
 * Creates test suite structures for edge cases
 */
import { TestResult, TestSuite } from './types';

/**
 * Create placeholder suite from summary counts
 */
export function createPlaceholderSuite(
  name: string,
  type: string,
  passed: number,
  failed: number,
  duration: number,
): TestSuite {
  const tests: TestResult[] = [];
  const avgDuration = Math.round(duration / Math.max(1, passed + failed));

  for (let i = 0; i < passed; i++) {
    tests.push({
      id: `${type}-passed-${i}`,
      name: `Test ${i + 1} (passed)`,
      suite: name,
      status: 'passed',
      duration: avgDuration,
    });
  }
  for (let i = 0; i < failed; i++) {
    tests.push({
      id: `${type}-failed-${i}`,
      name: `Test ${i + 1} (failed)`,
      suite: name,
      status: 'failed',
      duration: avgDuration,
    });
  }

  return {
    name,
    type: 'jest',
    tests,
    totalPassed: passed,
    totalFailed: failed,
    totalDuration: duration,
  };
}

/**
 * Create suite when no tests found
 */
export function createNoTestsSuite(name: string, output: string): TestSuite {
  const hasError = output.includes('Cannot find module') || output.includes('Error:');

  if (hasError) {
    return createErrorSuite(name, 'Test execution failed - see backend logs');
  }

  return {
    name,
    type: 'jest',
    tests: [{ id: 'no-tests', name: 'No tests found', suite: name, status: 'passed', duration: 0 }],
    totalPassed: 1,
    totalFailed: 0,
    totalDuration: 0,
  };
}

/**
 * Create error suite when execution fails
 */
export function createErrorSuite(name: string, errorMessage: string): TestSuite {
  return {
    name,
    type: 'jest',
    tests: [{
      id: 'error',
      name: 'Test execution failed',
      suite: name,
      status: 'failed',
      duration: 0,
      error: errorMessage,
    }],
    totalPassed: 0,
    totalFailed: 1,
    totalDuration: 0,
  };
}
