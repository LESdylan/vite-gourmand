/**
 * Test Module Configuration
 * ==========================
 * 
 * Provides a test-friendly AppModule with:
 * - Disabled rate limiting
 * - Mocked Prisma client
 * - Faster timeouts
 */

import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext, CanActivate } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppModule } from '../src/app.module';

/**
 * Mock ThrottlerGuard that always allows requests
 */
const mockThrottlerGuard: CanActivate = {
  canActivate: () => true,
};

/**
 * Creates a test application with throttling disabled
 */
export async function createTestApp(): Promise<INestApplication> {
  const builder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  // Override throttler guard
  builder.overrideGuard(ThrottlerGuard).useValue(mockThrottlerGuard);

  const moduleFixture: TestingModule = await builder.compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.enableCors(); // Enable CORS for tests
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  await app.init();
  return app;
}

/**
 * Test utilities
 */
export const testUtils = {
  /**
   * Generate unique email for test user
   */
  uniqueEmail: (prefix = 'test') => `${prefix}-${Date.now()}@test.com`,

  /**
   * Wait for a condition (useful for async operations)
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Test credentials
   */
  credentials: {
    admin: { email: 'admin@vitegourmand.fr', password: 'Admin123!' },
    manager: { email: 'manager@vitegourmand.fr', password: 'Manager123!' },
    client: { email: 'alice.dupont@email.fr', password: 'Client123!' },
    test: { email: 'test@test.com', password: 'Test123!' },
  },
};
