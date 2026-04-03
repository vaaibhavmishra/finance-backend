import type { Role } from '@prisma/client';
import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';

/**
 * Role-Based Access Control middleware factory.
 * Returns middleware that checks if the authenticated user has one of the allowed roles.
 *
 * @example
 * router.get('/admin-only', authenticate, authorize('ADMIN'), controller);
 * router.get('/analysts-and-admins', authenticate, authorize('ANALYST', 'ADMIN'), controller);
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        ),
      );
      return;
    }

    next();
  };
};
