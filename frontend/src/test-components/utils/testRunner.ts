/**
 * Test Runner Utility
 * ====================
 * Manages test execution and result collection
 */

import type { TestCase, TestResult, TestSuiteResult, PartialTestResult } from '../types';

export async function runTest(test: TestCase): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const result: PartialTestResult = await test.run();
    return {
      ...result,
      duration: performance.now() - startTime,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: performance.now() - startTime,
      timestamp: new Date(),
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    };
  }
}

export async function runTestSuite(
  tests: TestCase[],
  onProgress?: (testId: string, result: TestResult) => void
): Promise<TestSuiteResult> {
  const startTime = performance.now();
  const results = new Map<string, TestResult>();
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const test of tests) {
    const result = await runTest(test);
    results.set(test.id, result);
    
    if (result.status === 'passed') passed++;
    else if (result.status === 'failed' || result.status === 'error') failed++;
    else skipped++;

    onProgress?.(test.id, result);
  }

  return {
    total: tests.length,
    passed,
    failed,
    skipped,
    duration: performance.now() - startTime,
    results,
  };
}

export function formatDuration(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getStatusColor(status: TestResult['status']): string {
  switch (status) {
    case 'passed': return '#22c55e';
    case 'failed': return '#ef4444';
    case 'error': return '#f97316';
    default: return '#6b7280';
  }
}

export function getStatusIcon(status: TestResult['status']): string {
  switch (status) {
    case 'passed': return '✓';
    case 'failed': return '✗';
    case 'error': return '⚠';
    default: return '○';
  }
}
