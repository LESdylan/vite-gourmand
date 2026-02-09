/**
 * Interceptors Unit Tests
 */
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { HttpLogInterceptor } from '../logging/http-log.interceptor';

describe('Interceptors', () => {
  describe('LoggingInterceptor', () => {
    let interceptor: LoggingInterceptor;

    beforeEach(() => {
      interceptor = new LoggingInterceptor();
    });

    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('should log request and response', (done) => {
      const mockContext = createMockExecutionContext();
      const mockHandler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(mockContext, mockHandler).subscribe({
        next: (value) => {
          expect(value).toEqual({ data: 'test' });
          done();
        },
      });
    });
  });

  describe('TransformInterceptor', () => {
    let interceptor: TransformInterceptor<any>;

    beforeEach(() => {
      interceptor = new TransformInterceptor();
    });

    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('should transform response', (done) => {
      const mockContext = createMockExecutionContext();
      const mockHandler: CallHandler = {
        handle: () => of({ name: 'test' }),
      };

      interceptor.intercept(mockContext, mockHandler).subscribe({
        next: (value) => {
          expect(value.data).toEqual({ name: 'test' });
          expect(value.timestamp).toBeDefined();
          done();
        },
      });
    });
  });

  describe('HttpLogInterceptor', () => {
    let interceptor: HttpLogInterceptor;

    beforeEach(() => {
      interceptor = new HttpLogInterceptor();
    });

    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('should log HTTP requests', (done) => {
      const mockContext = createMockExecutionContext();
      const mockHandler: CallHandler = {
        handle: () => of({ success: true }),
      };

      interceptor.intercept(mockContext, mockHandler).subscribe({
        next: (value) => {
          expect(value).toEqual({ success: true });
          done();
        },
      });
    });
  });
});

function createMockExecutionContext(): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        get: () => 'Mozilla/5.0',
      }),
      getResponse: () => ({
        statusCode: 200,
      }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}
