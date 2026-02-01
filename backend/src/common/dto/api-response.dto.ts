/**
 * Standard API Response DTO
 * All API responses follow this format for consistency
 */
export class ApiResponse<T> {
  success!: boolean;
  statusCode!: number;
  message!: string;
  data?: T;
  error?: string;
  timestamp!: string;
  path?: string;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
  }

  static success<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return new ApiResponse({
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static created<T>(data: T, message = 'Created'): ApiResponse<T> {
    return ApiResponse.success(data, message, 201);
  }

  static error(message: string, statusCode = 400, error?: string): ApiResponse<null> {
    return new ApiResponse({
      success: false,
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

/**
 * Pagination query DTO
 */
export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
}
