/**
 * Test Runner
 * Orchestrates test execution and provides CLI interface
 */

import { Logger } from './utils/logger';
import {
  BaseTest,
  TestResult,
  FuzzyTestResult,
  EmailValidationTest,
  VerifyCreditCardTest,
  PasswordStrengthTest,
  FirstTimeRegistrationTest,
  ResetPasswordTest,
  QuickConnectionTest,
  DbMailConnectionTest,
} from './tests';

export interface RunOptions {
  verbose?: boolean;
  fuzzy?: boolean;
  fuzzyIterations?: number;
  parallel?: boolean;
  filter?: string[];
  category?: string;
}

export interface RunSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
  fuzzyResults?: FuzzyTestResult[];
}

export class TestRunner {
  private tests: Map<string, BaseTest> = new Map();
  private options: RunOptions;

  constructor(options?: RunOptions) {
    this.options = {
      verbose: false,
      fuzzy: false,
      fuzzyIterations: 100,
      parallel: false,
      ...options,
    };

    this.registerTests();
  }

  /**
   * Register all available tests
   */
  private registerTests(): void {
    const tests = [
      new EmailValidationTest(),
      new VerifyCreditCardTest(),
      new PasswordStrengthTest(),
      new FirstTimeRegistrationTest(),
      new ResetPasswordTest(),
      new QuickConnectionTest(),
      new DbMailConnectionTest(),
    ];

    for (const test of tests) {
      this.tests.set(test.name, test);
    }
  }

  /**
   * Get all registered tests
   */
  getTests(): BaseTest[] {
    return Array.from(this.tests.values());
  }

  /**
   * Get test by name
   */
  getTest(name: string): BaseTest | undefined {
    return this.tests.get(name);
  }

  /**
   * Get tests by category
   */
  getTestsByCategory(category: string): BaseTest[] {
    return this.getTests().filter((t) => t.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set(this.getTests().map((t) => t.category));
    return Array.from(categories);
  }

  /**
   * List all tests
   */
  listTests(): void {
    Logger.header('📋 Available Tests');

    const categories = this.getCategories();
    for (const category of categories) {
      Logger.subheader(`${category.toUpperCase()}`);
      const tests = this.getTestsByCategory(category);
      for (const test of tests) {
        console.log(`  • ${test.name}`);
        console.log(`    ${test.description}`);
      }
    }

    Logger.newline();
    Logger.info(`Total: ${this.tests.size} tests in ${categories.length} categories`);
  }

  /**
   * Run a single test
   */
  async runTest(name: string): Promise<TestResult | null> {
    const test = this.tests.get(name);
    if (!test) {
      Logger.error(`Test not found: ${name}`);
      return null;
    }

    Logger.subheader(`Running: ${test.name}`);
    Logger.info(test.description);

    const startTime = performance.now();
    try {
      const result = await test.run();
      result.duration = Math.round(performance.now() - startTime);

      Logger.testResult(result.name, result.passed, result.message);

      if (this.options.verbose && result.details) {
        Logger.table(result.details);
      }

      if (!result.passed && result.errors) {
        for (const error of result.errors.slice(0, 5)) {
          Logger.error(`  ${error}`);
        }
        if (result.errors.length > 5) {
          Logger.warn(`  ... and ${result.errors.length - 5} more errors`);
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Test threw exception: ${errorMessage}`);
      return {
        name: test.name,
        passed: false,
        message: `Exception: ${errorMessage}`,
        duration: Math.round(performance.now() - startTime),
        errors: [errorMessage],
      };
    }
  }

  /**
   * Run fuzzy tests for a single test
   */
  async runFuzzyTest(name: string, iterations?: number): Promise<FuzzyTestResult | null> {
    const test = this.tests.get(name);
    if (!test) {
      Logger.error(`Test not found: ${name}`);
      return null;
    }

    const iterCount = iterations || this.options.fuzzyIterations || 100;

    Logger.subheader(`Fuzzy Testing: ${test.name} (${iterCount} iterations)`);

    const startTime = performance.now();
    try {
      const result = await test.fuzzyRun(iterCount);
      const duration = Math.round(performance.now() - startTime);

      const passRate = ((result.passed / result.iterations) * 100).toFixed(1);
      Logger.info(`Pass rate: ${passRate}% (${result.passed}/${result.iterations})`);

      if (result.failed > 0 && this.options.verbose) {
        Logger.warn(`Failed cases:`);
        for (const failed of result.failedCases.slice(0, 5)) {
          Logger.error(`  ${failed.message}`);
        }
        if (result.failedCases.length > 5) {
          Logger.warn(`  ... and ${result.failedCases.length - 5} more failures`);
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Fuzzy test threw exception: ${errorMessage}`);
      return {
        iterations: iterCount,
        passed: 0,
        failed: iterCount,
        results: [],
        failedCases: [],
      };
    }
  }

  /**
   * Run all tests
   */
  async runAll(): Promise<RunSummary> {
    const startTime = performance.now();
    const results: TestResult[] = [];
    const fuzzyResults: FuzzyTestResult[] = [];

    Logger.header('🧪 Running All Tests');

    let testsToRun = this.getTests();

    // Apply filters
    if (this.options.filter && this.options.filter.length > 0) {
      testsToRun = testsToRun.filter((t) => this.options.filter!.includes(t.name));
    }
    if (this.options.category) {
      testsToRun = testsToRun.filter((t) => t.category === this.options.category);
    }

    Logger.info(`Running ${testsToRun.length} tests...`);
    Logger.newline();

    // Run tests
    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i];
      Logger.progress(i + 1, testsToRun.length, test.name);

      const result = await this.runTest(test.name);
      if (result) {
        results.push(result);
      }

      // Run fuzzy tests if enabled
      if (this.options.fuzzy) {
        const fuzzyResult = await this.runFuzzyTest(test.name);
        if (fuzzyResult) {
          fuzzyResults.push(fuzzyResult);
        }
      }
    }

    const duration = Math.round(performance.now() - startTime);
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    // Summary
    Logger.summary(passed, failed, duration);

    return {
      totalTests: testsToRun.length,
      passed,
      failed,
      skipped: this.tests.size - testsToRun.length,
      duration,
      results,
      fuzzyResults: fuzzyResults.length > 0 ? fuzzyResults : undefined,
    };
  }

  /**
   * Run tests by category
   */
  async runCategory(category: string): Promise<RunSummary> {
    this.options.category = category;
    return this.runAll();
  }

  /**
   * Interactive test selection
   */
  async interactive(): Promise<void> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
          resolve(answer.trim());
        });
      });
    };

    let running = true;

    while (running) {
      Logger.header('🧪 CLI Security Test Suite');

      Logger.menu([
        { key: '1', label: 'Run all tests' },
        { key: '2', label: 'Run all tests with fuzzing' },
        { key: '3', label: 'Run specific test' },
        { key: '4', label: 'Run by category' },
        { key: '5', label: 'List all tests' },
        { key: '6', label: 'Fuzzy test specific' },
        { key: 'q', label: 'Quit' },
      ]);

      const choice = await question('Select option: ');

      switch (choice) {
        case '1':
          await this.runAll();
          break;

        case '2':
          this.options.fuzzy = true;
          this.options.fuzzyIterations = 50;
          await this.runAll();
          this.options.fuzzy = false;
          break;

        case '3':
          this.listTests();
          const testName = await question('Enter test name: ');
          if (this.tests.has(testName)) {
            await this.runTest(testName);
          } else {
            Logger.error(`Test not found: ${testName}`);
          }
          break;

        case '4':
          Logger.info(`Categories: ${this.getCategories().join(', ')}`);
          const category = await question('Enter category: ');
          await this.runCategory(category);
          break;

        case '5':
          this.listTests();
          break;

        case '6':
          this.listTests();
          const fuzzyTestName = await question('Enter test name: ');
          const iterations = await question('Iterations (default 100): ');
          if (this.tests.has(fuzzyTestName)) {
            await this.runFuzzyTest(fuzzyTestName, parseInt(iterations) || 100);
          } else {
            Logger.error(`Test not found: ${fuzzyTestName}`);
          }
          break;

        case 'q':
        case 'Q':
          running = false;
          Logger.info('Goodbye!');
          break;

        default:
          Logger.error('Invalid option');
      }

      if (running) {
        await question('\nPress Enter to continue...');
      }
    }

    rl.close();
  }
}
