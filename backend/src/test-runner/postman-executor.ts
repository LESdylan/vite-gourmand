/**
 * Postman/Newman Executor
 * Runs Postman collections via Newman CLI
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { TestResult, TestSuite } from './types';
import { tryReadNewmanResults, parseNewmanText } from './newman-parser';

const execAsync = promisify(exec);
const COLLECTIONS = ['auth.json', 'orders.json', 'admin.json'];

interface PostmanExecResult {
  suite: TestSuite;
  rawOutput: string;
}

/**
 * Execute all Postman collections
 */
export async function executePostmanTests(backendPath: string): Promise<PostmanExecResult> {
  const postmanPath = path.join(backendPath, 'postman');
  const results = await Promise.all(
    COLLECTIONS.map(c => runCollection(postmanPath, backendPath, c))
  );

  const tests = results.flatMap(r => r.tests);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const rawOutput = results.map(r => r.rawOutput).join('\n\n---\n\n');

  if (tests.length === 0) {
    return createNoTestsResult();
  }

  return {
    suite: { name: 'Postman Collection', type: 'postman', tests, totalPassed, totalFailed, totalDuration },
    rawOutput,
  };
}

/**
 * Run a single Postman collection
 */
async function runCollection(postmanPath: string, backendPath: string, collection: string) {
  const collectionPath = path.join(postmanPath, collection);
  const emptyResult = { tests: [] as TestResult[], passed: 0, failed: 0, duration: 0, rawOutput: '' };

  if (!fs.existsSync(collectionPath)) {
    return { ...emptyResult, rawOutput: `# ${collection}\nCollection not found` };
  }

  const cmd = `npx newman run "${collectionPath}" --reporters cli,json --reporter-json-export newman-results.json 2>&1 || true`;

  try {
    const { stdout } = await execAsync(cmd, { cwd: backendPath, timeout: 60000, env: { ...process.env, NODE_ENV: 'test' } });
    const rawOutput = `$ ${cmd}\n\n${stdout}`;
    const resultsPath = path.join(backendPath, 'newman-results.json');
    
    const parsed = tryReadNewmanResults(resultsPath, collection) || parseNewmanText(stdout, collection);
    return { ...parsed, rawOutput };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      tests: [createErrorTest(collection, message)],
      passed: 0,
      failed: 1,
      duration: 0,
      rawOutput: `$ ${cmd}\n\nERROR: ${message}`,
    };
  }
}

function createErrorTest(collection: string, errorMessage: string): TestResult {
  return { id: `postman-${collection}-error`, name: `${collection} (error)`, suite: collection, status: 'failed', duration: 0, error: errorMessage };
}

function createNoTestsResult(): PostmanExecResult {
  return {
    suite: {
      name: 'Postman Collection',
      type: 'postman',
      tests: [{ id: 'no-postman', name: 'No Postman tests available', suite: 'postman', status: 'failed', duration: 0 }],
      totalPassed: 0,
      totalFailed: 1,
      totalDuration: 0,
    },
    rawOutput: 'No Postman collections found or Newman not installed',
  };
}
