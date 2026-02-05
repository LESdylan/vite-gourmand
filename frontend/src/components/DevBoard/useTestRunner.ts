/**
 * useTestRunner Hook
 * Manages test execution state and results
 */

import { useState, useCallback, useEffect } from 'react';
import {
  runTests,
  runAllTests,
  getTestResults,
  getMockTestResults,
  TEST_CONFIGS,
  type TestConfigId,
  type RunTestsResponse,
} from '../../services/testRunner';
import type { AutoTest } from '../features/qa/automatic-tests';

interface UseTestRunnerReturn {
  // State
  isRunning: boolean;
  currentTest: string | null;
  results: RunTestsResponse | null;
  error: string | null;
  
  // Derived data
  autoTests: AutoTest[];
  metrics: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    duration: number;
  };
  
  // Actions
  runTest: (testId: TestConfigId) => Promise<void>;
  runAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Convert API results to AutoTest format for display
 */
function toAutoTests(results: RunTestsResponse | null): AutoTest[] {
  if (!results) return [];
  
  return results.suites.flatMap(suite => 
    suite.tests.map(test => ({
      id: test.id,
      name: test.name,
      suite: suite.name,
      status: test.status,
      duration: test.duration,
    }))
  );
}

/**
 * Calculate metrics from results
 */
function calculateMetrics(results: RunTestsResponse | null) {
  if (!results) {
    return { total: 0, passed: 0, failed: 0, passRate: 0, duration: 0 };
  }
  
  const { total, passed, failed, duration } = results.summary;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  
  return { total, passed, failed, passRate, duration };
}

export function useTestRunner(): UseTestRunnerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [results, setResults] = useState<RunTestsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial results (from cache or mock)
  useEffect(() => {
    const loadResults = async () => {
      try {
        const cached = await getTestResults();
        if (cached) {
          setResults(cached);
        } else {
          // Use mock data for development
          setResults(getMockTestResults());
        }
      } catch {
        // Use mock data as fallback
        setResults(getMockTestResults());
      }
    };
    
    loadResults();
  }, []);

  const runTest = useCallback(async (testId: TestConfigId) => {
    setIsRunning(true);
    setCurrentTest(TEST_CONFIGS[testId].name);
    setError(null);
    
    try {
      const response = await runTests(testId);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test run failed');
      // Keep previous results on error
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  }, []);

  const runAll = useCallback(async () => {
    setIsRunning(true);
    setCurrentTest('All Tests');
    setError(null);
    
    try {
      const response = await runAllTests();
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test run failed');
      // Simulate test run with delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      // Generate fresh mock results each run
      setResults(getMockTestResults());
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const cached = await getTestResults();
      if (cached) {
        setResults(cached);
      }
    } catch {
      // Ignore refresh errors
    }
  }, []);

  return {
    isRunning,
    currentTest,
    results,
    error,
    autoTests: toAutoTests(results),
    metrics: calculateMetrics(results),
    runTest,
    runAll,
    refresh,
  };
}
