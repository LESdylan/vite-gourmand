/**
 * Health Check Test
 * ==================
 * Tests backend connectivity and health endpoint
 */

import { useState } from 'react';
import { apiClient } from '../../services/api.client';
import { TestPanel, TestButton, TestResultDisplay } from '../common';
import type { TestResult } from '../common/TestResultDisplay';

const HEALTH_ENDPOINT = '/';

export function HealthCheckTest() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runHealthCheck() {
    setLoading(true);
    setResult(null);

    try {
      const startTime = Date.now();
      const response = await apiClient.get(HEALTH_ENDPOINT);
      const duration = Date.now() - startTime;

      setResult({
        status: 'success',
        message: `Backend is healthy! Response in ${duration}ms`,
        data: response.data,
      });
    } catch (error) {
      setResult(parseHealthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <TestPanel
      title="🏥 Health Check"
      description="Test backend connectivity and API availability"
    >
      <TestButton
        label="Check Backend Health"
        onClick={runHealthCheck}
        loading={loading}
      />
      <TestResultDisplay result={result} />
    </TestPanel>
  );
}

function parseHealthError(error: unknown): TestResult {
  if (error instanceof Error) {
    if (error.message.includes('Network Error')) {
      return {
        status: 'error',
        message: 'Cannot connect to backend. Is it running?',
        data: { hint: 'Run: make dev-backend' },
      };
    }
    return {
      status: 'error',
      message: error.message,
    };
  }
  return {
    status: 'error',
    message: 'Unknown error occurred',
  };
}
