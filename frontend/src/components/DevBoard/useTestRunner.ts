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
  rawOutput: string | null;
  
  // Derived data
  autoTests: AutoTest[];
  metrics: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    duration: number;
    lastRun: Date | null;
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
    // No data yet — return -1 passRate to distinguish from actual 0% failure
    return { total: 0, passed: 0, failed: 0, passRate: -1, duration: 0, lastRun: null };
  }
  
  const { total = 0, passed = 0, failed = 0, duration = 0 } = results.summary;
  // -1 signals 'no data / pending' to the UI so it doesn't show 'critical'
  const passRate = total > 0 ? Math.round((passed / total) * 100) : -1;
  const lastRun = results.timestamp ? new Date(results.timestamp) : null;
  
  return { total, passed, failed, passRate, duration, lastRun };
}
export function useTestRunner(): UseTestRunnerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [results, setResults] = useState<RunTestsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  // Load cached results from backend on mount — auto-run if cache is empty
  useEffect(() => {
    let isMounted = true;
    
    const loadCachedResults = async () => {
      try {
        const cached = await getTestResults();
        if (!isMounted) return;

        if (cached?.suites?.length) {
          // Cache has data — use it
          setResults(cached);
          if (cached.rawOutput) setRawOutput(cached.rawOutput);
        } else {
          // Cache is empty (server restarted) — auto-run all tests
          console.log('No cached test results — auto-running all tests…');
          setIsRunning(true);
          setCurrentTest('All Tests (auto)');
          try {
            const response = await runAllTests({ verbose: true });
            if (isMounted) {
              setResults(response);
              if (response.rawOutput) setRawOutput(response.rawOutput);
            }
          } catch (err) {
            if (isMounted) {
              setError(err instanceof Error ? err.message : 'Auto-run failed');
            }
          } finally {
            if (isMounted) {
              setIsRunning(false);
              setCurrentTest(null);
            }
          }
        }
      } catch {
        // Backend not available
        if (isMounted) {
          console.log('Test results API not available - backend may not be running');
        }
      }
    };
    
    loadCachedResults();
    
    return () => { isMounted = false; };
  }, []);

  const runTest = useCallback(async (testId: TestConfigId) => {
    setIsRunning(true);
    setCurrentTest(TEST_CONFIGS[testId].name);
    setError(null);
    
    try {
      // Always request verbose output to show CLI results
      const response = await runTests(testId, { verbose: true });
      setResults(response);
      if (response.rawOutput) setRawOutput(response.rawOutput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test run failed');
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
      // Always request verbose output to show CLI results
      const response = await runAllTests({ verbose: true });
      setResults(response);
      if (response.rawOutput) setRawOutput(response.rawOutput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test run failed - is the backend running?');
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
        if (cached.rawOutput) setRawOutput(cached.rawOutput);
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
    rawOutput,
    autoTests: toAutoTests(results),
    metrics: calculateMetrics(results),
    runTest,
    runAll,
    refresh,
  };
}
