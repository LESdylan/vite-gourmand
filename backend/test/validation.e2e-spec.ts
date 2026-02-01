import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Validation Routine (e2e)', () => {
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

  describe('Request Validation', () => {
    it('should reject request with missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject request with extra fields (whitelisting)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          firstName: 'Test',
          hackerField: 'malicious data',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should provide clear validation error messages', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid',
          password: '123',
          firstName: 'A',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
      // Should contain multiple validation messages
      expect(typeof response.body.message).toBe('string');
    });
  });
});
