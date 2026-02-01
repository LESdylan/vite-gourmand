import { HttpExceptionFilter } from './http-exception.filter';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('Exception Filters', () => {
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
  const mockGetRequest = jest.fn().mockReturnValue({
    url: '/test',
    method: 'GET',
  });

  const mockArgumentsHost: ArgumentsHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    }),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;

    beforeEach(() => {
      filter = new HttpExceptionFilter();
    });

    it('should be defined', () => {
      expect(filter).toBeDefined();
    });

    it('should catch HttpException and return proper format', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 400,
          message: 'Test error',
          path: '/test',
        }),
      );
    });

    it('should include timestamp in response', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
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

    it('should catch regular Error and return 500', () => {
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 500,
          message: 'Internal server error',
        }),
      );
    });

    it('should handle HttpException properly', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
