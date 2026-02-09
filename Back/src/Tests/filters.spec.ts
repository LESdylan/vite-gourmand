/**
 * Filters Unit Tests
 */
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';

describe('Filters', () => {
  describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;

    beforeEach(() => {
      filter = new HttpExceptionFilter();
    });

    it('should be defined', () => {
      expect(filter).toBeDefined();
    });

    it('should handle HttpException', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockHost = createMockArgumentsHost(mockStatus);

      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Not Found',
        }),
      );
    });

    it('should handle HttpException with custom message object', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockHost = createMockArgumentsHost(mockStatus);

      const exception = new HttpException(
        { message: 'Validation failed', errors: ['field required'] },
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;

    beforeEach(() => {
      filter = new AllExceptionsFilter();
    });

    it('should be defined', () => {
      expect(filter).toBeDefined();
    });

    it('should handle generic Error', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockHost = createMockArgumentsHost(mockStatus);

      const exception = new Error('Something went wrong');
      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
        }),
      );
    });

    it('should handle HttpException', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockHost = createMockArgumentsHost(mockStatus);

      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(403);
    });
  });
});

function createMockArgumentsHost(mockStatus: jest.Mock): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        url: '/test',
        method: 'GET',
      }),
      getResponse: () => ({
        status: mockStatus,
      }),
    }),
  } as unknown as ArgumentsHost;
}
