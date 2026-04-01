import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler to catch errors and forward them
 * to Express error-handling middleware automatically.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
