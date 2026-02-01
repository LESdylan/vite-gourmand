/**
 * Password Reset Helpers Unit Tests
 * ===================================
 * Tests for token generation and validation utilities
 */

import {
  generateResetToken,
  hashToken,
  calculateExpiryDate,
  isTokenExpired,
  isTokenValid,
  TOKEN_EXPIRY_HOURS,
} from './password-reset.helpers';

describe('Password Reset Helpers', () => {
  describe('generateResetToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateResetToken();
      expect(token.length).toBe(64);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens each time', () => {
      const tokens = new Set(Array(100).fill(null).map(() => generateResetToken()));
      expect(tokens.size).toBe(100);
    });
  });

  describe('hashToken', () => {
    it('should return a 64-character hex string', () => {
      const hashed = hashToken('test-token');
      expect(hashed.length).toBe(64);
      expect(/^[a-f0-9]+$/.test(hashed)).toBe(true);
    });

    it('should produce same hash for same input', () => {
      const hash1 = hashToken('test-token');
      const hash2 = hashToken('test-token');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = hashToken('token-1');
      const hash2 = hashToken('token-2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('calculateExpiryDate', () => {
    it('should return a date in the future', () => {
      const expiry = calculateExpiryDate();
      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });

    it('should use default TOKEN_EXPIRY_HOURS', () => {
      const now = Date.now();
      const expiry = calculateExpiryDate();
      const expectedMs = TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
      
      // Allow 1 second tolerance
      expect(expiry.getTime() - now).toBeGreaterThan(expectedMs - 1000);
      expect(expiry.getTime() - now).toBeLessThan(expectedMs + 1000);
    });

    it('should accept custom hours', () => {
      const now = Date.now();
      const expiry = calculateExpiryDate(2);
      const expectedMs = 2 * 60 * 60 * 1000;
      
      expect(expiry.getTime() - now).toBeGreaterThan(expectedMs - 1000);
      expect(expiry.getTime() - now).toBeLessThan(expectedMs + 1000);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for future date', () => {
      const future = new Date(Date.now() + 3600000);
      expect(isTokenExpired(future)).toBe(false);
    });

    it('should return true for past date', () => {
      const past = new Date(Date.now() - 3600000);
      expect(isTokenExpired(past)).toBe(true);
    });

    it('should return true for date slightly in the past', () => {
      const slightlyPast = new Date(Date.now() - 1);
      expect(isTokenExpired(slightlyPast)).toBe(true);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for unused token with future expiry', () => {
      const token = {
        expiresAt: new Date(Date.now() + 3600000),
        used: false,
      };
      expect(isTokenValid(token)).toBe(true);
    });

    it('should return false for used token', () => {
      const token = {
        expiresAt: new Date(Date.now() + 3600000),
        used: true,
      };
      expect(isTokenValid(token)).toBe(false);
    });

    it('should return false for expired token', () => {
      const token = {
        expiresAt: new Date(Date.now() - 3600000),
        used: false,
      };
      expect(isTokenValid(token)).toBe(false);
    });

    it('should return false for used and expired token', () => {
      const token = {
        expiresAt: new Date(Date.now() - 3600000),
        used: true,
      };
      expect(isTokenValid(token)).toBe(false);
    });
  });
});
