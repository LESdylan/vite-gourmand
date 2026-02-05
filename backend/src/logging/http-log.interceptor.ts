/**
 * HttpLogInterceptor - Structured HTTP request logging
 * Captures all requests for real-time streaming
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LogEmitter } from './log.emitter';
import type { LogLevel, LogMeta } from './types';

@Injectable()
export class HttpLogInterceptor implements NestInterceptor {
  constructor(private readonly logEmitter: LogEmitter) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.logRequest(request, response, start),
        error: (err) => this.logError(request, err, start),
      }),
    );
  }

  private logRequest(req: Request, res: Response, start: number): void {
    const meta = this.buildMeta(req, res.statusCode, start);
    const level = this.getLevel(res.statusCode);
    const msg = `${req.method} ${req.url} ${res.statusCode} ${meta.duration}ms`;
    this.logEmitter.emit(level, 'api', msg, meta);
  }

  private logError(req: Request, err: Error & { status?: number }, start: number): void {
    const status = err.status || 500;
    const meta = this.buildMeta(req, status, start);
    const msg = `${req.method} ${req.url} ${status} - ${err.message}`;
    this.logEmitter.error('api', msg, meta);
  }

  private buildMeta(req: Request, statusCode: number, start: number): LogMeta {
    return {
      method: req.method,
      path: req.url,
      statusCode,
      duration: Date.now() - start,
      userId: (req['user'] as { id?: string })?.id || 'anon',
    };
  }

  private getLevel(status: number): LogLevel {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warn';
    return 'info';
  }
}
