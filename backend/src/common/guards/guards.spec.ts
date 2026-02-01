import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('Guards', () => {
  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;
    let jwtService: JwtService;
    let configService: ConfigService;

    beforeEach(() => {
      reflector = new Reflector();
      jwtService = { verifyAsync: jest.fn() } as unknown as JwtService;
      configService = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
      guard = new JwtAuthGuard(reflector, jwtService, configService);
    });

    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should allow public routes', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
      } as unknown as ExecutionContext;

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when no token', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should allow access when no roles required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: 'client' } }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: 'admin' } }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: 'client' } }),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
