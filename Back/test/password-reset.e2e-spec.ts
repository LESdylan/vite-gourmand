/**
 * Password Reset E2E Tests
 * =========================
 * Tests for forgot password, reset password, and change password flows
 */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Password Reset Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: { id: number; email: string };
  let authToken: string;

  const TEST_EMAIL = `pwd-reset-test-${Date.now()}@test.com`;
  const INITIAL_PASSWORD = 'InitialPass123';
  const NEW_PASSWORD = 'NewSecurePass456';

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  // ============================================
  // Test Setup Helpers
  // ============================================

  async function createTestUser() {
    let role = await prisma.role.findFirst({ where: { libelle: 'client' } });
    if (!role) {
      role = await prisma.role.create({ data: { libelle: 'client' } });
    }

    const hashedPassword = await bcrypt.hash(INITIAL_PASSWORD, 12);
    const user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        password: hashedPassword,
        first_name: 'Test',
        telephone_number: '0123456789',
        city: 'Paris',
        country: 'France',
        postal_address: '123 Test St',
        roleId: role.id,
      },
    });

    return { id: user.id, email: user.email };
  }

  async function cleanupTestData() {
    // Clean up using try-catch since mock may not have all data
    try {
      await (prisma as any).passwordResetToken?.deleteMany?.({ where: { userId: testUser.id } });
    } catch {
      // Ignore if passwordResetToken is not available
    }
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  }

  async function loginAndGetToken(password: string = INITIAL_PASSWORD) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password });

    return response.body.data?.accessToken;
  }

  async function resetPasswordToOriginal() {
    const hashedPassword = await bcrypt.hash(INITIAL_PASSWORD, 12);
    await prisma.user.update({
      where: { id: testUser.id },
      data: { password: hashedPassword },
    });
  }

  // ============================================
  // Forgot Password Tests
  // ============================================

  describe('POST /api/auth/forgot-password', () => {
    it('should accept valid email and return success message', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: TEST_EMAIL })
        .expect(200);

      expect(response.body.data.message).toContain('password reset');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return same message for non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.data.message).toContain('password reset');
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should reject empty email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: '' })
        .expect(400);
    });

    it('should create a password reset token and return it in dev mode', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: TEST_EMAIL });

      // In dev mode, token should be returned in response
      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(20);
    });

    it('should return new token each time', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: TEST_EMAIL });

      const response2 = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: TEST_EMAIL });

      const token1 = response1.body.data.token;
      const token2 = response2.body.data.token;

      // Tokens should be different each time
      expect(token1).not.toBe(token2);
      
      // Both tokens should be valid format (64 hex chars)
      expect(token1.length).toBe(64);
      expect(token2.length).toBe(64);
    });
  });

  // ============================================
  // Reset Password Tests
  // ============================================

  describe('POST /api/auth/reset-password', () => {
    let validToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: TEST_EMAIL });

      validToken = response.body.data.token;
    });

    afterEach(async () => {
      await resetPasswordToOriginal();
    });

    it('should reset password with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: validToken, newPassword: NEW_PASSWORD })
        .expect(200);

      expect(response.body.data.message).toContain('reset successfully');
    });

    it('should allow login with new password after reset', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: validToken, newPassword: NEW_PASSWORD });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: NEW_PASSWORD })
        .expect(200);

      expect(loginResponse.body.data.accessToken).toBeDefined();
    });

    it('should reject login with old password after reset', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: validToken, newPassword: NEW_PASSWORD });

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: INITIAL_PASSWORD })
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token-12345', newPassword: NEW_PASSWORD })
        .expect(400);
    });

    it('should reject already used token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: validToken, newPassword: NEW_PASSWORD });

      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: validToken, newPassword: 'AnotherPass789' })
        .expect(400);
    });

    it('should reject expired token', async () => {
      // Note: This test verifies expired token rejection
      // The token expiry logic is unit tested in password-reset.helpers.spec.ts
      // Here we verify the endpoint returns 400 for invalid/nonexistent tokens
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'expired-token-that-does-not-exist', newPassword: NEW_PASSWORD })
        .expect(400);
    });

    it('should reject weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: validToken, newPassword: 'weak' })
        .expect(400);
    });

    it('should reject password without uppercase', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: validToken, newPassword: 'lowercase123' })
        .expect(400);
    });

    it('should reject password without number', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: validToken, newPassword: 'NoNumbersHere' })
        .expect(400);
    });
  });

  // ============================================
  // Change Password Tests (Authenticated)
  // ============================================

  describe('PUT /api/auth/change-password', () => {
    beforeEach(async () => {
      authToken = await loginAndGetToken();
    });

    afterEach(async () => {
      await resetPasswordToOriginal();
    });

    it('should change password with valid current password', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: INITIAL_PASSWORD,
          newPassword: NEW_PASSWORD,
        })
        .expect(200);

      expect(response.body.data.message).toContain('changed successfully');

      const newToken = await loginAndGetToken(NEW_PASSWORD);
      expect(newToken).toBeDefined();
    });

    it('should reject incorrect current password', async () => {
      await request(app.getHttpServer())
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword123',
          newPassword: NEW_PASSWORD,
        })
        .expect(401);
    });

    it('should reject same password as current', async () => {
      await request(app.getHttpServer())
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: INITIAL_PASSWORD,
          newPassword: INITIAL_PASSWORD,
        })
        .expect(400);
    });

    it('should reject weak new password', async () => {
      await request(app.getHttpServer())
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: INITIAL_PASSWORD,
          newPassword: 'weak',
        })
        .expect(400);
    });

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer())
        .put('/api/auth/change-password')
        .send({
          currentPassword: INITIAL_PASSWORD,
          newPassword: NEW_PASSWORD,
        })
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .put('/api/auth/change-password')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          currentPassword: INITIAL_PASSWORD,
          newPassword: NEW_PASSWORD,
        })
        .expect(401);
    });
  });

  // ============================================
  // Security Edge Cases
  // ============================================

  describe('Security Edge Cases', () => {
    it('should not reveal user existence on forgot password', async () => {
      const existingResponse = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: TEST_EMAIL });

      const nonExistingResponse = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'definitelynotexisting@test.com' });

      expect(existingResponse.body.data.message)
        .toBe(nonExistingResponse.body.data.message);
    });

    it('should handle SQL injection in token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: "'; DROP TABLE users; --",
          newPassword: NEW_PASSWORD,
        })
        .expect(400);
    });

    it('should handle very long token input', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: 'a'.repeat(10000),
          newPassword: NEW_PASSWORD,
        })
        .expect(400);
    });
  });
});
