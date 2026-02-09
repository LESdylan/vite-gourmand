/**
 * Unicode and Encoding Security E2E Tests
 */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, testUtils } from '../test-utils';

describe('Unicode and Encoding Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Unicode Injection', () => {
    const unicodePayloads = [
      'test\u0000@test.com', // Null byte
      'test\u200B@test.com', // Zero-width space
      'test\uFEFF@test.com', // BOM
      'ａｄｍｉｎ@test.com', // Fullwidth
      'аdmin@test.com', // Cyrillic 'а'
      'test\u202E@test.com', // RTL override
    ];

    unicodePayloads.forEach((payload, i) => {
      it(`handles unicode injection #${i + 1}`, async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: payload, password: 'test' });

        expect([400, 401]).toContain(response.status);
      });
    });
  });

  describe('Emoji Handling', () => {
    it('handles emoji in firstName', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testUtils.uniqueEmail('emoji'),
          password: 'Test123!',
          firstName: 'Test 😀🎉',
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('handles emoji in search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/menus?search=🍕');

      // 200 = success (emoji allowed), 400 = validation rejects emoji
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Special Characters', () => {
    const specialChars = [
      'test+alias@test.com',
      'test.name@test.com',
      "o'brien@test.com",
      'test"quote@test.com',
      'test<>@test.com',
      'test;drop@test.com',
    ];

    specialChars.forEach((email, i) => {
      it(`handles special chars #${i + 1}: ${email.slice(0, 15)}`, async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password: 'test' });

        expect([400, 401]).toContain(response.status);
      });
    });
  });

  describe('Double Encoding', () => {
    it('handles double URL encoding', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/menus/%252e%252e%252f');

      expect([400, 404]).toContain(response.status);
    });

    it('handles triple URL encoding', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/menus/%25252e%25252e');

      expect([400, 404]).toContain(response.status);
    });
  });
});
