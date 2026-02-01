import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Error Handling Routine (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Consistent Error Format', () => {
    it('should return consistent error format for 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('statusCode', 401);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return consistent error format for 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return consistent error format for 404', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/nonexistent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Security - Error Response', () => {
    it('should not expose stack traces in errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({});

      expect(response.body.stack).toBeUndefined();
    });

    it('should not expose internal values in validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid',
          password: '123',
          firstName: 'A',
        });

      // Should not contain target or value (security)
      expect(response.body.target).toBeUndefined();
      expect(response.body.value).toBeUndefined();
    });
  });
});
