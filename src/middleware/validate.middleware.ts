import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validation middleware factory — validates request data against a Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate ('body' | 'query' | 'params')
 *
 * @example
 * router.post('/users', validate(createUserSchema, 'body'), controller);
 * router.get('/records', validate(filterSchema, 'query'), controller);
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // Replace the source with parsed (and transformed) data
      // Using Object.defineProperty to support Express 5 where req.query has only a getter
      Object.defineProperty(req, source, {
        value: parsed,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};

        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'unknown';
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        }

        next(ApiError.badRequest('Validation failed', fieldErrors));
        return;
      }

      next(error);
    }
  };
};
