/**
 * Password Reset Test
 * =====================
 * Tests password reset flow (forgot + reset)
 */

import { useState } from 'react';
import { forgotPassword, resetPassword } from '../../services/auth.service';
import { TestPanel, TestButton, TestResultDisplay } from '../common';
import type { TestResult } from '../common/TestResultDisplay';

const TEST_EMAIL = 'test@example.com';

export function PasswordResetTest() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  async function runForgotPasswordTest() {
    setLoading(true);
    setResult(null);

    try {
      const message = await forgotPassword({ email: TEST_EMAIL });
      setResetToken(null); // In real app, token would come via email
      setResult({
        status: 'success',
        message: message,
        data: { note: 'In production, a reset link is sent via email' },
      });
    } catch (error) {
      setResult(parseResetError(error));
    } finally {
      setLoading(false);
    }
  }

  async function runInvalidTokenTest() {
    setLoading(true);
    setResult(null);

    try {
      await resetPassword({
        token: 'invalid-token-12345',
        newPassword: 'NewPassword123!',
      });
      setResult({
        status: 'error',
        message: 'Test failed: Invalid token should be rejected',
      });
    } catch {
      setResult({
        status: 'success',
        message: 'Invalid token correctly rejected! ✓',
      });
    } finally {
      setLoading(false);
    }
  }

  async function runResetWithTokenTest() {
    if (!resetToken) {
      setResult({
        status: 'error',
        message: 'No reset token available. Request forgot password first.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const message = await resetPassword({
        token: resetToken,
        newPassword: 'NewSecurePassword123!',
      });
      setResult({
        status: 'success',
        message: message,
      });
    } catch (error) {
      setResult(parseResetError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <TestPanel
      title="🔑 Password Reset Test"
      description="Test forgot password and reset password flows"
    >
      <TestButton
        label="Test Forgot Password"
        onClick={runForgotPasswordTest}
        loading={loading}
      />
      <TestButton
        label="Test Invalid Token"
        onClick={runInvalidTokenTest}
        loading={loading}
        variant="secondary"
      />
      <TestButton
        label="Test Reset (with token)"
        onClick={runResetWithTokenTest}
        loading={loading}
        disabled={!resetToken}
      />
      <TestResultDisplay result={result} />
    </TestPanel>
  );
}

function parseResetError(error: unknown): TestResult {
  if (error instanceof Error) {
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
