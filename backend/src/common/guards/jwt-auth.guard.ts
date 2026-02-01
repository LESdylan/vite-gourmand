import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserPayload } from '../decorators/current-user.decorator';
import { MESSAGES } from '../constants';

/**
 * JWT Authentication Guard
 * Validates JWT tokens on all routes except those marked with @Public()
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }

    try {
      const payload = await this.jwtService.verifyAsync<UserPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach user to request
      request['user'] = payload;
    } catch (error) {
      const err = error as { name?: string; message?: string };
      if (err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(MESSAGES.TOKEN_EXPIRED);
      }
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
