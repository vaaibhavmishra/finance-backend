import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

/**
 * Global error handling middleware.
 * Catches all errors, normalizes them, and returns consistent JSON responses.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error: ApiError;

  // --- Handle known error types ---

  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = ApiError.badRequest('Invalid data provided to database operation');
  } else if (err instanceof SyntaxError && 'body' in err) {
    error = ApiError.badRequest('Invalid JSON in request body');
  } else {
    // Unknown error
    error = ApiError.internal('An unexpected error occurred');
  }

  // --- Log the error ---
  if (error.statusCode >= 500) {
    logger.error(`${error.statusCode} — ${req.method} ${req.originalUrl}`, {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
  } else {
    logger.warn(`${error.statusCode} — ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  // --- Send response ---
  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(Object.keys(error.errors).length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && error.statusCode >= 500 && { stack: err.stack }),
  });
};

/**
 * Handle Prisma-specific errors with meaningful messages
 */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): ApiError {
  switch (err.code) {
    case 'P2002': {
      const fields = (err.meta?.target as string[]) || ['field'];
      return ApiError.conflict(`A record with this ${fields.join(', ')} already exists`);
    }
    case 'P2025':
      return ApiError.notFound('Record');
    case 'P2003':
      return ApiError.badRequest('Referenced record does not exist');
    case 'P2014':
      return ApiError.badRequest('Operation would violate a required relation');
    default:
      return ApiError.internal(`Database error: ${err.code}`);
  }
}

/**
 * Catch-all for unmatched routes
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl}`));
};
