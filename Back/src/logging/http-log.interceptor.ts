/**
 * HTTP Log Interceptor
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class HttpLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const clientIp = ip || 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () =>
          this.logSuccess(
            method,
            url,
            response.statusCode,
            startTime,
            clientIp,
            userAgent,
          ),
        error: (error) =>
          this.logError(
            method,
            url,
            error.status || 500,
            startTime,
            clientIp,
            userAgent,
          ),
      }),
    );
  }

  private logSuccess(
    method: string,
    url: string,
    statusCode: number,
    startTime: number,
    ip: string,
    userAgent: string,
  ): void {
    const duration = Date.now() - startTime;
    this.logger.log(
      `${method} ${url} ${statusCode} ${duration}ms - ${ip} "${userAgent}"`,
    );
  }

  private logError(
    method: string,
    url: string,
    statusCode: number,
    startTime: number,
    ip: string,
    userAgent: string,
  ): void {
    const duration = Date.now() - startTime;
    this.logger.error(
      `${method} ${url} ${statusCode} ${duration}ms - ${ip} "${userAgent}"`,
    );
  }
}
