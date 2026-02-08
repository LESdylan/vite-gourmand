import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api')
      .expect(200);
    
    // API wraps responses in standard format
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe('Hello World!');
  });
});
