import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

/**
 * Global HTTP Exception Filter
 * Catches all HttpExceptions and formats them consistently
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract message from exception
    let message: string | string[];
    let error: string;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, unknown>;
      message = (responseObj.message as string | string[]) || exception.message;
      error = (responseObj.error as string) || exception.name;
    } else {
      message = exception.message;
      error = exception.name;
    }

    // Log error (for debugging and RGPD traceability)
    this.logger.warn(
      `HTTP ${status} - ${request.method} ${request.url} - ${JSON.stringify(message)}`,
    );

    const errorResponse: ApiResponse<null> = {
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
