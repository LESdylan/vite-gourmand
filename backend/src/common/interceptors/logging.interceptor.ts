import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Logging Interceptor
 * Logs all incoming requests and their response times
 * Essential for debugging and RGPD traceability
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = (request['user'] as { id?: number })?.id || 'anonymous';

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `${method} ${url} ${response.statusCode} - ${responseTime}ms - User: ${userId} - IP: ${ip} - UA: ${userAgent}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const status = error.status || 500;
          
          // Skip logging expected client errors (4xx) in test mode
          const isTestEnv = process.env.NODE_ENV === 'test';
          const isClientError = status >= 400 && status < 500;
          
          if (!isTestEnv || !isClientError) {
            this.logger.error(
              `${method} ${url} ${status} - ${responseTime}ms - User: ${userId} - IP: ${ip} - Error: ${error.message}`,
            );
          }
        },
      }),
    );
  }
}
