import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { prisma } from '../lib/prisma';
import type { AuthRequest, TokenPayload } from '../types';
import { ApiError } from '../utils/ApiError';

/**
 * Authentication middleware — verifies JWT token and attaches user to request.
 * Rejects inactive users even if token is valid.
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized(
        'Access token is required. Provide: Authorization: Bearer <token>',
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Malformed authorization header');
    }

    // 2. Verify token
    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Access token has expired. Please refresh your token.');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.unauthorized('Invalid access token');
      }
      throw error;
    }

    // 3. Ensure it's an access token, not a refresh token
    if (decoded.type !== 'access') {
      throw ApiError.unauthorized('Invalid token type. Use an access token.');
    }

    // 4. Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    if (user.status === 'INACTIVE') {
      throw ApiError.forbidden('Your account has been deactivated. Contact an administrator.');
    }

    // 5. Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};
