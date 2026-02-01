/**
 * Test Dashboard Types
 * ====================
 * Type definitions for the developer testing dashboard
 */

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'skipped';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: TestCategory;
  run: () => Promise<PartialTestResult>;
}

export interface PartialTestResult {
  status: 'passed' | 'failed' | 'error';
  message: string;
  details?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    statusCode?: number;
  };
  request?: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response?: {
    status: number;
    statusText: string;
    data: unknown;
    headers?: Record<string, string>;
  };
}

export interface TestResult extends PartialTestResult {
  duration: number;
  timestamp: Date;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: Map<string, TestResult>;
}

export type TestCategory = 
  | 'health'
  | 'auth'
  | 'user'
  | 'menu'
  | 'order'
  | 'admin'
  | 'validation';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  category: TestCategory;
  sampleBody?: Record<string, unknown>;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
}
