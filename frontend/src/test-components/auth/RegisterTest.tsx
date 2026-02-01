/**
 * Register Test
 * ==============
 * Tests user registration flow
 */

import { useState } from 'react';
import { register } from '../../services/auth.service';
import { TestPanel, TestButton, TestResultDisplay } from '../common';
import type { TestResult } from '../common/TestResultDisplay';

function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `testuser${timestamp}@example.com`,
    password: 'Test123!@#',
    firstName: 'TestUser',
  };
}

export function RegisterTest() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runRegisterTest() {
    setLoading(true);
    setResult(null);

    const testUser = generateTestUser();

    try {
      const response = await register(testUser);
      setResult({
        status: 'success',
        message: `Registration successful for ${testUser.email}`,
        data: {
          email: testUser.email,
          accessToken: response.accessToken ? '✓ Present' : '✗ Missing',
          user: response.user ? '✓ Created' : '✗ Missing',
        },
      });
    } catch (error) {
      setResult(parseRegisterError(error));
    } finally {
      setLoading(false);
    }
  }

  async function runDuplicateEmailTest() {
    setLoading(true);
    setResult(null);

    const fixedUser = {
      email: 'duplicate-test@example.com',
      password: 'Test123!@#',
      firstName: 'Duplicate',
      lastName: 'Test',
    };

    try {
      // First registration
      await register(fixedUser);
      // Second registration should fail
      await register(fixedUser);
      setResult({
        status: 'error',
        message: 'Test failed: Duplicate email should be rejected',
      });
    } catch {
      setResult({
        status: 'success',
        message: 'Duplicate email correctly rejected! ✓',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <TestPanel
      title="📝 Register Test"
      description="Test user registration and duplicate email handling"
    >
      <TestButton
        label="Test New Registration"
        onClick={runRegisterTest}
        loading={loading}
      />
      <TestButton
        label="Test Duplicate Email"
        onClick={runDuplicateEmailTest}
        loading={loading}
        variant="secondary"
      />
      <TestResultDisplay result={result} />
    </TestPanel>
  );
}

function parseRegisterError(error: unknown): TestResult {
  if (error instanceof Error) {
    if (error.message.includes('409') || error.message.includes('exists')) {
      return {
        status: 'error',
        message: 'Email already registered',
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
