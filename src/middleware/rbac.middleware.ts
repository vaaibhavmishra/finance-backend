import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../types';

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
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        ),
      );
    }

    next();
  };
};
