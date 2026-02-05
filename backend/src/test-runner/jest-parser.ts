/**
 * Jest Output Parser
 * Parses Jest JSON and text output into structured results
 */
import * as path from 'path';
import { TestResult, TestSuite } from './types';

/**
 * Parse Jest JSON results format
 */
export function parseJestJson(jestResults: any, suiteName: string): TestSuite {
  const tests: TestResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;
  let totalDuration = 0;

  if (jestResults.testResults) {
    for (const testFile of jestResults.testResults) {
      const fileName = path.basename(testFile.name);
      const fileTests = parseTestFile(testFile, fileName);
      tests.push(...fileTests.tests);
      totalPassed += fileTests.passed;
      totalFailed += fileTests.failed;
      totalDuration += fileTests.duration;
    }
  }

  // Fallback: create from summary if no individual tests
  if (tests.length === 0 && jestResults.numTotalTests > 0) {
    return createSuiteFromSummary(jestResults, suiteName);
  }

  return { name: suiteName, type: 'jest', tests, totalPassed, totalFailed, totalDuration };
}

/**
 * Parse individual test file assertions
 */
function parseTestFile(testFile: any, fileName: string) {
  const tests: TestResult[] = [];
  let passed = 0, failed = 0, duration = 0;

  for (const assertion of testFile.assertionResults || []) {
    const status = assertion.status === 'passed' ? 'passed' : 
                  assertion.status === 'failed' ? 'failed' : 'idle';
    
    const testResult: TestResult = {
      id: `${fileName}-${assertion.title}`.replace(/\s+/g, '-').toLowerCase(),
      name: formatTestName(assertion),
      suite: fileName,
      status,
      duration: assertion.duration || 0,
    };

    if (assertion.failureMessages?.length > 0) {
      testResult.error = assertion.failureMessages.join('\n');
    }

    tests.push(testResult);
    if (status === 'passed') passed++;
    if (status === 'failed') failed++;
    duration += assertion.duration || 0;
  }

  return { tests, passed, failed, duration };
}

/**
 * Format test name with ancestors
 */
function formatTestName(assertion: any): string {
  return assertion.ancestorTitles?.length > 0 
    ? `${assertion.ancestorTitles.join(' › ')} › ${assertion.title}`
    : assertion.title;
}

/**
 * Create suite from Jest summary when no individual tests
 */
function createSuiteFromSummary(jestResults: any, suiteName: string): TestSuite {
  const tests: TestResult[] = [];
  const totalPassed = jestResults.numPassedTests || 0;
  const totalFailed = jestResults.numFailedTests || 0;
  const avgDuration = 10;

  for (let i = 0; i < totalPassed; i++) {
    tests.push({
      id: `${suiteName.toLowerCase()}-test-${i}`,
      name: `Test ${i + 1}`,
      suite: suiteName,
      status: 'passed',
      duration: avgDuration,
    });
  }

  return { name: suiteName, type: 'jest', tests, totalPassed, totalFailed, totalDuration: avgDuration * tests.length };
}
