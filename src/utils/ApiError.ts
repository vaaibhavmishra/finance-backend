/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors: Record<string, string[]> = {},
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // --- Factory methods for common errors ---

  static badRequest(message = 'Bad Request', errors: Record<string, string[]> = {}): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden — insufficient permissions'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError(404, `${resource} not found`);
  }

  static conflict(message = 'Conflict'): ApiError {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = 'Too many requests, please try again later'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, {}, false);
  }
}
