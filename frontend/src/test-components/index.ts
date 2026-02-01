/**
 * Test Components Index
 * ======================
 * Main exports for the developer testing dashboard
 */

// Main Developer Dashboard
export { DevDashboard, default as TestDashboard } from './DevDashboard';

// Types
export type { 
  TestCase, 
  TestResult, 
  PartialTestResult,
  TestStatus, 
  TestCategory, 
  TestSuiteResult,
  LogEntry,
  ApiEndpoint 
} from './types';

// Utilities
export * from './utils';

// Legacy components (for backwards compatibility)
export * from './common';
export * from './health';
export * from './auth';
