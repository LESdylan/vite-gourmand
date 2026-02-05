/**
 * Test Runner Service
 * Orchestrates test execution - delegates to specialized executors
 */
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { RunTestsResponse, TestRunOptions, TestType } from './types';
import { executeJestTests } from './jest-executor';
import { executePostmanTests } from './postman-executor';

@Injectable()
export class TestRunnerService {
  private readonly logger = new Logger(TestRunnerService.name);
  private isRunning = false;
  private currentTest: string | null = null;
  private cachedResults: RunTestsResponse | null = null;
  private readonly backendPath: string;

  constructor() {
    this.backendPath = path.resolve(__dirname, '..', '..');
  }

  getStatus(): { running: boolean; currentTest?: string } {
    return { running: this.isRunning, currentTest: this.currentTest || undefined };
  }

  getCachedResults(): RunTestsResponse | null {
    return this.cachedResults;
  }

  async runTest(testId: string, options: TestRunOptions = {}): Promise<RunTestsResponse> {
    this.assertNotRunning();
    this.isRunning = true;
    this.currentTest = testId;

    try {
      const result = await this.executeTest(testId, options);
      this.cachedResults = result;
      return result;
    } finally {
      this.resetState();
    }
  }

  async runAllTests(options: TestRunOptions = {}): Promise<RunTestsResponse> {
    this.assertNotRunning();
    this.isRunning = true;

    try {
      const result = await this.executeAllTests(options);
      this.cachedResults = result;
      return result;
    } finally {
      this.resetState();
    }
  }

  private assertNotRunning(): void {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }
  }

  private resetState(): void {
    this.isRunning = false;
    this.currentTest = null;
  }

  private async executeTest(testId: string, options: TestRunOptions): Promise<RunTestsResponse> {
    const validTypes: TestType[] = ['unit', 'e2e', 'orders'];
    
    if (testId === 'postman') {
      const { suite, rawOutput } = await executePostmanTests(this.backendPath);
      return this.buildResponse([suite], options.verbose ? rawOutput : undefined);
    }

    if (!validTypes.includes(testId as TestType)) {
      throw new Error(`Unknown test id: ${testId}`);
    }

    const { suite, rawOutput } = await executeJestTests(this.backendPath, testId as TestType);
    return this.buildResponse([suite], options.verbose ? rawOutput : undefined);
  }

  private async executeAllTests(options: TestRunOptions): Promise<RunTestsResponse> {
    const rawOutputParts: string[] = [];
    const suites = [];

    // Run unit tests
    this.currentTest = 'unit';
    this.logger.log('Running unit tests...');
    const unitResult = await this.safeExecuteJest('unit', 'Unit Tests');
    suites.push(unitResult.suite);
    rawOutputParts.push(unitResult.rawOutput);

    // Run E2E tests
    this.currentTest = 'e2e';
    this.logger.log('Running E2E tests...');
    const e2eResult = await this.safeExecuteJest('e2e', 'E2E Tests');
    if (e2eResult.suite.tests.length > 0) {
      suites.push(e2eResult.suite);
      rawOutputParts.push(e2eResult.rawOutput);
    }

    const rawOutput = options.verbose ? rawOutputParts.join('\n\n========================================\n\n') : undefined;
    return this.buildResponse(suites, rawOutput);
  }

  private async safeExecuteJest(type: TestType, name: string) {
    try {
      return await executeJestTests(this.backendPath, type);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`${name} failed:`, message);
      return {
        suite: { name, type: 'jest' as const, tests: [], totalPassed: 0, totalFailed: 0, totalDuration: 0 },
        rawOutput: `ERROR: ${message}`,
      };
    }
  }

  private buildResponse(suites: any[], rawOutput?: string): RunTestsResponse {
    // If verbose, add rawOutput to each test for individual expandable details
    if (rawOutput) {
      for (const suite of suites) {
        const suiteOutput = suite.rawOutput || rawOutput;
        for (const test of suite.tests) {
          // Add suite output to each test so it can be displayed when expanded
          if (!test.output) {
            test.output = suiteOutput;
          }
        }
      }
    }

    const total = suites.reduce((sum, s) => sum + s.tests.length, 0);
    const passed = suites.reduce((sum, s) => sum + s.totalPassed, 0);
    const failed = suites.reduce((sum, s) => sum + s.totalFailed, 0);
    const duration = suites.reduce((sum, s) => sum + s.totalDuration, 0);

    return {
      success: failed === 0,
      suites,
      summary: { total, passed, failed, duration },
      timestamp: new Date().toISOString(),
      rawOutput,
    };
  }
}
