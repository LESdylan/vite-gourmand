/**
 * Test Runner Service
 */
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  skipped: number;
}

@Injectable()
export class TestRunnerService {
  private readonly logger = new Logger(TestRunnerService.name);

  async getUnitTestResults(): Promise<TestSuite[]> {
    return this.readResultFile('test-results-unit.json');
  }

  async getE2eTestResults(): Promise<TestSuite[]> {
    return this.readResultFile('test-results-e2e.json');
  }

  private async readResultFile(filename: string): Promise<TestSuite[]> {
    try {
      const filePath = path.join(process.cwd(), filename);
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`Test results file not found: ${filename}`);
        return [];
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Failed to read ${filename}`, error);
      return [];
    }
  }

  async getSummary(): Promise<{ unit: TestSuite[]; e2e: TestSuite[] }> {
    const [unit, e2e] = await Promise.all([
      this.getUnitTestResults(),
      this.getE2eTestResults(),
    ]);
    return { unit, e2e };
  }
}
