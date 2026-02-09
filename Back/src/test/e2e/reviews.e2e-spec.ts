/**
 * Reviews API E2E Tests
 */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, testUtils } from '../test-utils';

describe('Reviews API (e2e)', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    const email = testUtils.uniqueEmail('review');
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'TestPassword123!', firstName: 'Reviewer' });

    userToken = registerRes.body.data?.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/reviews', () => {
    it('should return approved reviews (public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reviews')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reviews?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/reviews', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .send({ note: 5, description: 'Great!' });

      expect(response.status).toBe(401);
    });
  });
});
