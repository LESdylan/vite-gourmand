import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';
import { Request } from 'express';

/**
 * Transform Interceptor
 * Wraps all successful responses in a consistent ApiResponse format
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Don't wrap if already wrapped
        if (data instanceof ApiResponse) {
          return data;
        }

        // Skip transform for file downloads or streams
        if (data && typeof data.pipe === 'function') {
          return data;
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message: 'Success',
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
