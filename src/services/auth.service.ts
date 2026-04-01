import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/environment';
import { ApiError } from '../utils/ApiError';
import { TokenPayload } from '../types';
import { RegisterInput, LoginInput } from '../validators/auth.validator';


/**
 * Auth Service — handles registration, login, and token management
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw ApiError.conflict('A user with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'VIEWER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    return { user, ...tokens };
  }

  /**
   * Login with email and password
   */
  static async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (user.status === 'INACTIVE') {
      throw ApiError.forbidden('Your account has been deactivated. Contact an administrator.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token using a refresh token
   */
  static async refreshToken(refreshToken: string) {
    let decoded: TokenPayload;

    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw ApiError.unauthorized('Invalid token type');
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (user.status === 'INACTIVE') {
      throw ApiError.forbidden('Account has been deactivated');
    }

    // Generate new tokens
    return this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { records: { where: { isDeleted: false } } } },
      },
    });

    if (!user) {
      throw ApiError.notFound('User');
    }

    return {
      ...user,
      totalRecords: user._count.records,
      _count: undefined,
    };
  }

  /**
   * Generate access and refresh token pair
   */
  private static generateTokens(payload: Omit<TokenPayload, 'type'>) {
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions,
    );

    return { accessToken, refreshToken };
  }

}
