/**
 * Password Reset Helpers
 * =======================
 * Utility functions for password reset flow
 */

import { randomBytes, createHash } from 'crypto';

/**
 * Token expiration time in hours
 */
export const TOKEN_EXPIRY_HOURS = 1;

/**
 * Generate a secure random token
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash token for secure storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Calculate token expiration date
 */
export function calculateExpiryDate(hours: number = TOKEN_EXPIRY_HOURS): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hours);
  return expiresAt;
}

/**
 * Check if token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Check if token is valid (not expired and not used)
 */
export function isTokenValid(token: { expiresAt: Date; used: boolean }): boolean {
  return !token.used && !isTokenExpired(token.expiresAt);
}
