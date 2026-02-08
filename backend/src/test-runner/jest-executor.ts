/**
 * Jest Executor
 * Runs Jest tests and captures output
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { TestSuite, TestType } from './types';
import { parseJestJson } from './jest-parser';
import { parseJestText } from './jest-text-parser';
import { createErrorSuite } from './suite-factory';

const execAsync = promisify(exec);

interface JestExecResult {
  suite: TestSuite;
  rawOutput: string;
}

/**
 * Execute Jest tests and return parsed results
 */
export async function executeJestTests(
  backendPath: string,
  type: TestType,
): Promise<JestExecResult> {
  const { command, suiteName } = getJestCommand(type);
  const startTime = Date.now();

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: backendPath,
      timeout: 180000,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, NODE_ENV: 'test', FORCE_COLOR: '0' },
    });

    const rawOutput = formatRawOutput(command, stdout, stderr);
    const suite = await parseJestResults(backendPath, stdout + stderr, suiteName, type);
    suite.rawOutput = rawOutput;

    return { suite, rawOutput };
  } catch (error: unknown) {
    return handleJestError(error, backendPath, suiteName, type, command);
  }
}

/**
 * Get Jest command configuration
 * Uses node directly with --localstorage-file (required by Jest 30's jest-environment-node)
 * instead of npm run scripts to avoid shell indirection issues in Docker
 */
function getJestCommand(type: TestType): { command: string; suiteName: string } {
  const nodeFlags = 'node --max-old-space-size=512 --localstorage-file=/tmp/jest-localstorage';
  const jestBin = 'node_modules/.bin/jest';

  const commands: Record<TestType, { command: string; suiteName: string }> = {
    unit: {
      command: `${nodeFlags} ${jestBin} --runInBand --json --outputFile=test-results.json --forceExit 2>&1 || true`,
      suiteName: 'Unit Tests',
    },
    e2e: {
      command: `${nodeFlags} ${jestBin} --config ./test/jest-e2e.json --runInBand --json --outputFile=test-results.json --forceExit 2>&1 || true`,
      suiteName: 'E2E Tests',
    },
    orders: {
      command: `${nodeFlags} ${jestBin} --config ./test/jest-e2e.json --testPathPattern=order --runInBand --json --outputFile=test-results.json --forceExit 2>&1 || true`,
      suiteName: 'Orders Tests',
    },
  };
  return commands[type];
}

/**
 * Parse Jest results from JSON file or text output
 */
async function parseJestResults(
  backendPath: string,
  output: string,
  suiteName: string,
  type: TestType,
): Promise<TestSuite> {
  const jsonPath = path.join(backendPath, 'test-results.json');

  if (fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, 'utf-8');
      const jestResults = JSON.parse(content);
      fs.unlinkSync(jsonPath);
      
      // Parse JSON results with proper test names
      const suite = parseJestJson(jestResults, suiteName);
      
      // Attach raw output to each test for verbose mode
      for (const test of suite.tests) {
        test.output = output;
      }
      
      return suite;
    } catch (e) {
      console.error('Failed to parse Jest JSON:', e);
    }
  }

  return parseJestText(output, suiteName, type);
}

/**
 * Handle Jest execution errors
 */
function handleJestError(
  error: unknown,
  backendPath: string,
  suiteName: string,
  type: TestType,
  command: string,
): JestExecResult {
  const execError = error as { stdout?: string; stderr?: string; message?: string };
  const output = (execError.stdout || '') + (execError.stderr || '');
  const rawOutput = formatRawOutput(command, output, execError.message || '');

  if (output) {
    const suite = parseJestText(output, suiteName, type);
    suite.rawOutput = rawOutput;
    return { suite, rawOutput };
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  return {
    suite: createErrorSuite(suiteName, message),
    rawOutput: `$ ${command}\n\nERROR: ${message}`,
  };
}

/**
 * Format raw CLI output for display
 */
function formatRawOutput(command: string, stdout: string, stderr: string): string {
  const parts = [`$ ${command}`, ''];
  if (stdout) parts.push(stdout);
  if (stderr) parts.push(`STDERR:\n${stderr}`);
  return parts.join('\n').trim();
}
