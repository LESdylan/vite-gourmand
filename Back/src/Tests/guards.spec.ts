/**
 * Guards Unit Tests
 */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';

describe('Guards', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
      guard = new JwtAuthGuard(reflector);
    });

    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should allow public routes', () => {
      const mockContext = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;

    beforeEach(() => {
      guard = new RolesGuard(reflector);
    });

    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should allow when no roles required', () => {
      const mockContext = createMockExecutionContext({ role: 'CLIENT' });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow user with correct role', () => {
      const mockContext = createMockExecutionContext({ role: 'ADMIN' });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny user without correct role', () => {
      const mockContext = createMockExecutionContext({ role: 'CLIENT' });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });
  });

  describe('OptionalAuthGuard', () => {
    let guard: OptionalAuthGuard;

    beforeEach(() => {
      guard = new OptionalAuthGuard();
    });

    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should not throw on error', () => {
      const error = new UnauthorizedException();
      const result = guard.handleRequest(error, null);
      expect(result).toBeNull();
    });

    it('should return user when valid', () => {
      const user = { id: 'user-1', role: 'CLIENT' };
      const result = guard.handleRequest(null, user);
      expect(result).toEqual(user);
    });
  });
});

function createMockExecutionContext(user?: { role: string }): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}
