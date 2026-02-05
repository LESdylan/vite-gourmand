/**
 * Jest Text Parser
 * Parses Jest CLI text output when JSON is unavailable
 */
import * as path from 'path';
import { TestResult, TestSuite } from './types';
import { createPlaceholderSuite, createNoTestsSuite } from './suite-factory';

/**
 * Parse Jest text output (fallback when JSON unavailable)
 */
export function parseJestText(output: string, suiteName: string, type: string): TestSuite {
  const { tests, totalPassed, totalFailed, totalDuration } = extractTestsFromOutput(output, type);

  if (tests.length === 0 && (totalPassed > 0 || totalFailed > 0)) {
    return createPlaceholderSuite(suiteName, type, totalPassed, totalFailed, totalDuration);
  }

  if (tests.length === 0) {
    return createNoTestsSuite(suiteName, output);
  }

  return { name: suiteName, type: 'jest', tests, totalPassed, totalFailed, totalDuration };
}

/**
 * Extract tests and summary from output lines
 */
function extractTestsFromOutput(output: string, type: string) {
  const tests: TestResult[] = [];
  let totalPassed = 0, totalFailed = 0, totalDuration = 0;
  let currentSuiteFile = '';

  for (const line of output.split('\n')) {
    const fileResult = parseFileLine(line);
    if (fileResult) { currentSuiteFile = fileResult; continue; }

    const testResult = parseTestLine(line, currentSuiteFile, type);
    if (testResult) {
      tests.push(testResult);
      if (testResult.status === 'passed') totalPassed++;
      if (testResult.status === 'failed') totalFailed++;
      totalDuration += testResult.duration || 0;
    }

    const summary = parseSummaryLine(line);
    if (summary.passed !== null) totalPassed = summary.passed;
    if (summary.failed !== null) totalFailed = summary.failed;

    const time = parseTimeLine(line);
    if (time !== null) totalDuration = time;
  }

  return { tests, totalPassed, totalFailed, totalDuration };
}

/** Parse file header line: PASS/FAIL src/file.spec.ts */
function parseFileLine(line: string): string | null {
  const match = line.match(/^\s*(PASS|FAIL)\s+(.+\.spec\.ts)/);
  return match ? path.basename(match[2]) : null;
}

/** Parse individual test line: ✓ test name (123 ms) */
function parseTestLine(line: string, suiteFile: string, type: string): TestResult | null {
  const match = line.match(/^\s*(✓|✕|○)\s+(.+?)(?:\s*\((\d+)\s*ms\))?$/);
  if (!match) return null;

  const [, icon, name, duration] = match;
  return {
    id: `${suiteFile || type}-${name}`.replace(/\s+/g, '-').toLowerCase().substring(0, 100),
    name,
    suite: suiteFile || type,
    status: icon === '✓' ? 'passed' : icon === '✕' ? 'failed' : 'idle',
    duration: duration ? parseInt(duration, 10) : 0,
  };
}

/** Parse summary line: Tests: X passed, Y failed, Z total */
function parseSummaryLine(line: string): { passed: number | null; failed: number | null } {
  const match = line.match(/Tests:\s+(?:(\d+)\s+passed)?[,\s]*(?:(\d+)\s+failed)?/);
  return {
    passed: match?.[1] ? parseInt(match[1], 10) : null,
    failed: match?.[2] ? parseInt(match[2], 10) : null,
  };
}

/** Parse time line: Time: 1.234 s */
function parseTimeLine(line: string): number | null {
  const match = line.match(/Time:\s+([\d.]+)\s*s/);
  return match ? Math.round(parseFloat(match[1]) * 1000) : null;
}
