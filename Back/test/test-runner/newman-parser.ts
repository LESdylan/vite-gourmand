/**
 * Newman Output Parser
 * Parses Newman JSON and text output
 */
import * as fs from 'fs';
import { TestResult } from './types';

interface NewmanParseResult {
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

/**
 * Parse Newman JSON output
 */
export function parseNewmanJson(results: any, collection: string): NewmanParseResult {
  const tests: TestResult[] = [];
  let passed = 0, failed = 0, duration = 0;

  for (const execution of results.run?.executions || []) {
    const itemName = execution.item?.name || 'Unknown';
    const isPassed = execution.assertions?.every((a: any) => !a.error) ?? true;
    const respTime = execution.response?.responseTime || 0;

    tests.push({
      id: `postman-${collection}-${itemName}`.replace(/\s+/g, '-').toLowerCase(),
      name: itemName,
      suite: collection,
      status: isPassed ? 'passed' : 'failed',
      duration: respTime,
      error: isPassed ? undefined : execution.assertions?.find((a: any) => a.error)?.error?.message,
    });

    if (isPassed) passed++; else failed++;
    duration += respTime;
  }

  return { tests, passed, failed, duration };
}

/**
 * Parse Newman text output (fallback)
 */
export function parseNewmanText(stdout: string, collection: string): NewmanParseResult {
  const tests: TestResult[] = [];
  const passMatch = stdout.match(/(\d+) passing/);
  const failMatch = stdout.match(/(\d+) failing/);

  const passCount = passMatch ? parseInt(passMatch[1], 10) : 0;
  const failCount = failMatch ? parseInt(failMatch[1], 10) : 0;

  for (let i = 0; i < passCount; i++) {
    tests.push({
      id: `postman-${collection}-${i}`,
      name: `${collection} request ${i + 1}`,
      suite: collection,
      status: 'passed',
      duration: 100,
    });
  }
  for (let i = 0; i < failCount; i++) {
    tests.push({
      id: `postman-${collection}-fail-${i}`,
      name: `${collection} request (failed)`,
      suite: collection,
      status: 'failed',
      duration: 100,
    });
  }

  return { tests, passed: passCount, failed: failCount, duration: (passCount + failCount) * 100 };
}

/**
 * Try to read and parse Newman JSON results file
 */
export function tryReadNewmanResults(resultsPath: string, collection: string): NewmanParseResult | null {
  if (!fs.existsSync(resultsPath)) return null;
  
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  fs.unlinkSync(resultsPath);
  return parseNewmanJson(results, collection);
}
