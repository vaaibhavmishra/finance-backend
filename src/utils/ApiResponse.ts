/**
 * Standardized API Response wrapper
 */
export class ApiResponse<T = unknown> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: T;
  public meta?: Record<string, unknown>;

  constructor(statusCode: number, message: string, data: T, meta?: Record<string, unknown>) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  // --- Factory methods ---

  static ok<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse(200, message, data);
  }

  static created<T>(data: T, message = 'Created successfully'): ApiResponse<T> {
    return new ApiResponse(201, message, data);
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success',
  ): ApiResponse<T[]> {
    return new ApiResponse(200, message, data, {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  }

  static noContent(message = 'Deleted successfully'): ApiResponse<null> {
    return new ApiResponse(200, message, null);
  }
}
