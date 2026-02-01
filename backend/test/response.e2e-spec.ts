import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API Response Routine (e2e)', () => {
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

  describe('Consistent Success Response Format', () => {
    it('should wrap successful responses in standard format', async () => {
      // Use public endpoint
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `response-test-${Date.now()}@example.com`,
          password: 'SecurePassword123!',
          firstName: 'Response Test',
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('success', true);
      expect(registerResponse.body).toHaveProperty('statusCode', 201);
      expect(registerResponse.body).toHaveProperty('message');
      expect(registerResponse.body).toHaveProperty('data');
      expect(registerResponse.body).toHaveProperty('timestamp');
    });

    it('should include path in response', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `path-test-${Date.now()}@example.com`,
          password: 'SecurePassword123!',
          firstName: 'Path Test',
        });

      expect(response.body).toHaveProperty('path');
      expect(response.body.path).toContain('/api/auth/register');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:5173');

      // CORS should be enabled
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
