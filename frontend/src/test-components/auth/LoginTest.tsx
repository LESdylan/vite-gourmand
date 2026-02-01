/**
 * Login Test
 * ===========
 * Tests authentication login flow
 */

import { useState } from 'react';
import { login } from '../../services/auth.service';
import { TestPanel, TestButton, TestResultDisplay } from '../common';
import type { TestResult } from '../common/TestResultDisplay';

// Use credentials that match a registered user in the database
const TEST_CREDENTIALS = {
  email: 'testuser@example.com',
  password: 'Test12345!',
};

export function LoginTest() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runLoginTest() {
    setLoading(true);
    setResult(null);

    try {
      const response = await login(TEST_CREDENTIALS);
      setResult({
        status: 'success',
        message: 'Login successful! Token received.',
        data: {
          accessToken: response.accessToken ? '✓ Present' : '✗ Missing',
          refreshToken: response.refreshToken ? '✓ Present' : '✗ Missing',
        },
      });
    } catch (error) {
      setResult(parseLoginError(error));
    } finally {
      setLoading(false);
    }
  }

  async function runInvalidLoginTest() {
    setLoading(true);
    setResult(null);

    try {
      await login({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
      setResult({
        status: 'error',
        message: 'Test failed: Login should have been rejected',
      });
    } catch {
      setResult({
        status: 'success',
        message: 'Invalid credentials correctly rejected! ✓',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <TestPanel
      title="🔐 Login Test"
      description="Test authentication with valid and invalid credentials"
    >
      <TestButton
        label="Test Valid Login"
        onClick={runLoginTest}
        loading={loading}
      />
      <TestButton
        label="Test Invalid Login"
        onClick={runInvalidLoginTest}
        loading={loading}
        variant="secondary"
      />
      <TestResultDisplay result={result} />
    </TestPanel>
  );
}

function parseLoginError(error: unknown): TestResult {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      return {
        status: 'error',
        message: 'Invalid credentials. User may not exist.',
        data: { hint: 'Run seed script to create test users' },
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
