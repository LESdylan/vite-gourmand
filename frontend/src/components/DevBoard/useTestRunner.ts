/**
 * useTestRunner Hook
 * Manages test execution state and results
 */

import { useState, useCallback, useEffect } from 'react';
import {
  runTests,
  runAllTests,
  getTestResults,
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
  verboseMode: boolean;
  rawOutput: string | null;
  
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
  toggleVerbose: () => void;
}

/**
 * Convert API results to AutoTest format for display
 */
function toAutoTests(results: RunTestsResponse | null): AutoTest[] {
  if (!results?.suites?.length) return [];
  
  return results.suites.flatMap(suite => 
    (suite.tests || []).map(test => ({
      id: test.id,
      name: test.name,
      suite: suite.name,
      status: test.status,
      duration: test.duration,
      output: test.output,
      error: test.error,
    }))
  );
}

/**
 * Calculate metrics from results
 */
function calculateMetrics(results: RunTestsResponse | null) {
  if (!results?.summary) {
    return { total: 0, passed: 0, failed: 0, passRate: 0, duration: 0 };
  }
  
  const { total = 0, passed = 0, failed = 0, duration = 0 } = results.summary;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  
  return { total, passed, failed, passRate, duration };
}

export function useTestRunner(): UseTestRunnerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [results, setResults] = useState<RunTestsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verboseMode, setVerboseMode] = useState(false);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  // Load cached results from backend on mount
  useEffect(() => {
    const loadCachedResults = async () => {
      try {
        const cached = await getTestResults();
        if (cached?.suites?.length) {
          setResults(cached);
          if (cached.rawOutput) setRawOutput(cached.rawOutput);
        }
      } catch {
        // API not available - leave results null until user runs tests
      }
    };
    
    loadCachedResults();
  }, []);

  const runTest = useCallback(async (testId: TestConfigId) => {
    setIsRunning(true);
    setCurrentTest(TEST_CONFIGS[testId].name);
    setError(null);
    
    try {
      const response = await runTests(testId, { verbose: verboseMode });
      setResults(response);
      if (response.rawOutput) setRawOutput(response.rawOutput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test run failed');
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  }, [verboseMode]);

  const runAll = useCallback(async () => {
    setIsRunning(true);
    setCurrentTest('All Tests');
    setError(null);
    
    try {
      const response = await runAllTests({ verbose: verboseMode });
      setResults(response);
      if (response.rawOutput) setRawOutput(response.rawOutput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test run failed - is the backend running?');
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  }, [verboseMode]);

  const refresh = useCallback(async () => {
    try {
      const cached = await getTestResults();
      if (cached) {
        setResults(cached);
        if (cached.rawOutput) setRawOutput(cached.rawOutput);
      }
    } catch {
      // Ignore refresh errors
    }
  }, []);

  const toggleVerbose = useCallback(() => {
    setVerboseMode(prev => !prev);
  }, []);

  return {
    isRunning,
    currentTest,
    results,
    error,
    verboseMode,
    rawOutput,
    autoTests: toAutoTests(results),
    metrics: calculateMetrics(results),
    runTest,
    runAll,
    refresh,
    toggleVerbose,
  };
}
