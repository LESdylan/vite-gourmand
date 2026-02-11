/**
 * Test Runner Service
 * Reads cached test results and can execute tests on demand
 * Parses Jest's native JSON reporter output format
 */
import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running' | 'idle';
  duration?: number;
  error?: string;
  output?: string;
}

export interface TestSuite {
  name: string;
  type: 'jest' | 'e2e' | 'postman';
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
  timestamp: string;
  rawOutput?: string;
}

/** Jest's native JSON reporter format */
interface JestResult {
  numFailedTestSuites: number;
  numFailedTests: number;
  numPassedTestSuites: number;
  numPassedTests: number;
  numTotalTestSuites: number;
  numTotalTests: number;
  success: boolean;
  startTime: number;
  testResults: JestTestFile[];
}

interface JestTestFile {
  name: string;
  status: 'passed' | 'failed';
  startTime: number;
  endTime: number;
  message: string;
  assertionResults: JestAssertion[];
}

interface JestAssertion {
  ancestorTitles: string[];
  fullName: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  title: string;
  duration: number;
  failureMessages: string[];
  failureDetails: unknown[];
}

@Injectable()
export class TestRunnerService {
  private readonly logger = new Logger(TestRunnerService.name);
  private isRunning = false;
  private currentTest: string | null = null;
  private cachedResults: RunTestsResponse | null = null;

  /** Get current execution status */
  getStatus(): { running: boolean; currentTest: string | null } {
    return { running: this.isRunning, currentTest: this.currentTest };
  }

  /** Get cached results (or load from file) */
  async getResults(): Promise<RunTestsResponse | null> {
    if (this.cachedResults) return this.cachedResults;
    
    // Try loading from Jest JSON files
    const [unitData, e2eData] = await Promise.all([
      this.readJestResultFile('test-results-unit.json'),
      this.readJestResultFile('test-results-e2e.json'),
    ]);

    const suites: TestSuite[] = [];
    if (unitData) suites.push(...this.parseJestResult(unitData, 'jest', 'Unit Tests'));
    if (e2eData) suites.push(...this.parseJestResult(e2eData, 'e2e', 'E2E Tests'));

    if (suites.length === 0) return null;

    const summary = this.calculateSummary(suites);
    this.cachedResults = {
      success: summary.failed === 0,
      suites,
      summary,
      timestamp: new Date().toISOString(),
    };

    return this.cachedResults;
  }

  /** Run all tests */
  async runAllTests(verbose = true): Promise<RunTestsResponse> {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }

    this.isRunning = true;
    this.currentTest = 'All Tests';
    const startTime = Date.now();
    const outputs: string[] = [];

    try {
      this.logger.log('🚀 Starting test execution...');
      
      // Run unit tests with JSON output
      this.currentTest = 'Unit Tests';
      this.logger.log('📦 Running Unit Tests...');
      const unitResult = await this.executeJest('unit', verbose);
      outputs.push(unitResult.output);

      // Run e2e tests with JSON output
      this.currentTest = 'E2E Tests';
      this.logger.log('🌐 Running E2E Tests...');
      const e2eResult = await this.executeJest('e2e', verbose);
      outputs.push(e2eResult.output);

      // Load fresh results from Jest JSON files
      const [unitData, e2eData] = await Promise.all([
        this.readJestResultFile('test-results-unit.json'),
        this.readJestResultFile('test-results-e2e.json'),
      ]);

      const suites: TestSuite[] = [];
      if (unitData) suites.push(...this.parseJestResult(unitData, 'jest', 'Unit Tests'));
      if (e2eData) suites.push(...this.parseJestResult(e2eData, 'e2e', 'E2E Tests'));

      const summary = this.calculateSummary(suites);
      summary.duration = Date.now() - startTime;

      // Log summary
      const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
      if (summary.failed === 0) {
        this.logger.log(`✅ All tests passed! ${summary.passed}/${summary.total} (${passRate}%) in ${summary.duration}ms`);
      } else {
        this.logger.warn(`⚠️ Some tests failed: ${summary.passed} passed, ${summary.failed} failed (${passRate}%) in ${summary.duration}ms`);
      }

      this.cachedResults = {
        success: summary.failed === 0,
        suites,
        summary,
        timestamp: new Date().toISOString(),
        rawOutput: outputs.join('\n\n---\n\n'),
      };

      return this.cachedResults;
    } catch (error) {
      this.logger.error(`❌ Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      this.isRunning = false;
      this.currentTest = null;
    }
  }

  /** Run a specific test type */
  async runTests(testId: string, verbose = true): Promise<RunTestsResponse> {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }

    const validTypes = ['unit', 'e2e', 'orders'];
    if (!validTypes.includes(testId)) {
      throw new Error(`Unknown test type: ${testId}`);
    }

    this.isRunning = true;
    this.currentTest = testId;
    const startTime = Date.now();

    try {
      this.logger.log(`🚀 Running ${testId} tests...`);
      const result = await this.executeJest(testId as 'unit' | 'e2e', verbose);
      
      // Load results from appropriate file
      const filename = testId === 'unit' ? 'test-results-unit.json' : 'test-results-e2e.json';
      const suiteType = testId === 'unit' ? 'jest' : 'e2e';
      const data = await this.readJestResultFile(filename);
      const suites = data ? this.parseJestResult(data, suiteType, `${testId} Tests`) : [];
      const summary = this.calculateSummary(suites);
      summary.duration = Date.now() - startTime;

      // Log summary
      const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
      if (summary.failed === 0) {
        this.logger.log(`✅ ${testId} tests passed! ${summary.passed}/${summary.total} (${passRate}%) in ${summary.duration}ms`);
      } else {
        this.logger.warn(`⚠️ ${testId} tests: ${summary.passed} passed, ${summary.failed} failed (${passRate}%)`);
      }

      this.cachedResults = {
        success: summary.failed === 0,
        suites,
        summary,
        timestamp: new Date().toISOString(),
        rawOutput: result.output,
      };

      return this.cachedResults;
    } catch (error) {
      this.logger.error(`❌ ${testId} test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      this.isRunning = false;
      this.currentTest = null;
    }
  }

  /** Execute Jest directly with JSON output */
  private executeJest(testType: 'unit' | 'e2e', streamOutput = true): Promise<{ code: number; output: string }> {
    return new Promise((resolve, reject) => {
      const outputFile = testType === 'unit' ? 'test-results-unit.json' : 'test-results-e2e.json';
      
      // Build full command as a string for shell execution
      // The --localstorage-file flag is a custom Node.js option that requires shell interpretation
      let command = `node --max-old-space-size=1024 --localstorage-file=/tmp/jest-localstorage node_modules/.bin/jest --runInBand --json --outputFile=${outputFile}`;
      
      if (testType === 'e2e') {
        command += ' --config ./src/test/e2e/jest-e2e.json';
      }

      this.logger.log(`🧪 Running ${testType} tests: ${command}`);

      const proc = spawn(command, [], {
        cwd: process.cwd(),
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' },
      });

      let output = '';
      
      proc.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;
        if (streamOutput) {
          this.streamTestOutput(text, false);
        }
      });

      proc.stderr?.on('data', (data) => {
        const text = data.toString();
        output += text;
        if (streamOutput) {
          this.streamTestOutput(text, true);
        }
      });

      proc.on('close', (code) => {
        // Jest exits with code 1 when tests fail - that's OK
        resolve({ code: code ?? 0, output });
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /** Execute npm script with streamed output parsing (legacy) */
  private executeNpm(script: string, streamOutput = true): Promise<{ code: number; output: string }> {
    return new Promise((resolve, reject) => {
      const proc = spawn('npm', ['run', script], {
        cwd: process.cwd(),
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' }, // Enable colors
      });

      let output = '';
      
      proc.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;
        if (streamOutput) {
          // Parse and colorize output
          this.streamTestOutput(text, false);
        }
      });

      proc.stderr?.on('data', (data) => {
        const text = data.toString();
        output += text;
        if (streamOutput) {
          // Stderr is often just Jest's verbose output, not errors
          this.streamTestOutput(text, true);
        }
      });

      proc.on('close', (code) => {
        resolve({ code: code ?? 0, output });
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /** Stream and parse test output with proper log levels */
  private streamTestOutput(text: string, isStderr: boolean): void {
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and noise
      if (!trimmed || trimmed.startsWith('>') || trimmed.includes('node_modules')) {
        continue;
      }
      
      // Detect test status from output
      if (trimmed.startsWith('PASS ')) {
        this.logger.log(`✅ ${trimmed}`);
      } else if (trimmed.startsWith('FAIL ')) {
        this.logger.error(`❌ ${trimmed}`);
      } else if (trimmed.includes('✓') || trimmed.includes('✔')) {
        this.logger.log(`   ${trimmed}`);
      } else if (trimmed.includes('✕') || trimmed.includes('✗')) {
        this.logger.error(`   ${trimmed}`);
      } else if (trimmed.startsWith('Test Suites:') || trimmed.startsWith('Tests:') || trimmed.startsWith('Time:')) {
        this.logger.log(trimmed);
      } else if (trimmed.includes('passed') && !trimmed.includes('failed')) {
        this.logger.log(trimmed);
      } else if (trimmed.includes('failed')) {
        this.logger.warn(trimmed);
      } else if (isStderr && (trimmed.includes('Error') || trimmed.includes('error'))) {
        this.logger.error(trimmed);
      } else {
        // Default: log at debug level for verbose output
        this.logger.debug(trimmed);
      }
    }
  }

  /** Read Jest JSON result file */
  private async readJestResultFile(filename: string): Promise<JestResult | null> {
    try {
      const filePath = path.join(process.cwd(), filename);
      if (!fs.existsSync(filePath)) {
        this.logger.debug(`Test results file not found: ${filename}`);
        return null;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as JestResult;
    } catch (error) {
      this.logger.error(`Failed to read ${filename}`, error);
      return null;
    }
  }

  /** Parse Jest result into our TestSuite format */
  private parseJestResult(data: JestResult, type: 'jest' | 'e2e' | 'postman', suiteName: string): TestSuite[] {
    const suites: TestSuite[] = [];
    
    for (const testFile of data.testResults) {
      const fileName = path.basename(testFile.name);
      const tests: TestResult[] = [];
      let passed = 0;
      let failed = 0;
      let totalDuration = 0;
      
      for (const assertion of testFile.assertionResults) {
        const status = this.mapAssertionStatus(assertion.status);
        
        if (status === 'passed') passed++;
        else if (status === 'failed') failed++;
        
        const duration = assertion.duration || 0;
        totalDuration += duration;
        
        tests.push({
          id: `${type}-${fileName}-${tests.length}`,
          name: assertion.fullName || assertion.title,
          status,
          duration,
          error: assertion.failureMessages.join('\n') || undefined,
        });
      }
      
      suites.push({
        name: fileName,
        type,
        tests,
        totalPassed: passed,
        totalFailed: failed,
        totalDuration,
      });
    }
    
    return suites;
  }

  /** Map Jest assertion status to our status type */
  private mapAssertionStatus(jestStatus: string): 'passed' | 'failed' | 'skipped' {
    if (jestStatus === 'passed') return 'passed';
    if (jestStatus === 'failed') return 'failed';
    return 'skipped';
  }

  /** Calculate summary from suites */
  private calculateSummary(suites: TestSuite[]): { total: number; passed: number; failed: number; duration: number } {
    let total = 0, passed = 0, failed = 0, duration = 0;
    for (const suite of suites) {
      total += suite.tests.length;
      passed += suite.totalPassed;
      failed += suite.totalFailed;
      duration += suite.totalDuration;
    }
    return { total, passed, failed, duration };
  }

  // Legacy methods for backward compatibility
  async getUnitTestResults(): Promise<LegacyTestSuite[]> {
    const data = await this.readJestResultFile('test-results-unit.json');
    return data ? this.convertJestToLegacy(data) : [];
  }

  async getE2eTestResults(): Promise<LegacyTestSuite[]> {
    const data = await this.readJestResultFile('test-results-e2e.json');
    return data ? this.convertJestToLegacy(data) : [];
  }

  async getSummary(): Promise<{ unit: LegacyTestSuite[]; e2e: LegacyTestSuite[] }> {
    const [unit, e2e] = await Promise.all([
      this.getUnitTestResults(),
      this.getE2eTestResults(),
    ]);
    return { unit, e2e };
  }

  /** Convert Jest result to legacy format */
  private convertJestToLegacy(data: JestResult): LegacyTestSuite[] {
    return data.testResults.map(file => ({
      name: path.basename(file.name),
      tests: file.assertionResults.map(a => ({
        name: a.fullName || a.title,
        status: this.mapAssertionStatus(a.status),
        duration: a.duration,
        error: a.failureMessages.join('\n') || undefined,
      })),
      passed: file.assertionResults.filter(a => a.status === 'passed').length,
      failed: file.assertionResults.filter(a => a.status === 'failed').length,
      skipped: file.assertionResults.filter(a => a.status === 'pending' || a.status === 'skipped').length,
    }));
  }
}

/** Legacy format for backward compatibility */
export interface LegacyTestSuite {
  name: string;
  tests: { name: string; status: 'passed' | 'failed' | 'skipped'; duration?: number; error?: string }[];
  passed: number;
  failed: number;
  skipped: number;
}
