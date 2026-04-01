import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and token management
 */
export class AuthController {
  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, password]
   *             properties:
   *               name:
   *                 type: string
   *                 example: "John Doe"
   *               email:
   *                 type: string
   *                 example: "john@example.com"
   *               password:
   *                 type: string
   *                 example: "Password123!"
   *               role:
   *                 type: string
   *                 enum: [VIEWER, ANALYST, ADMIN]
   *                 default: VIEWER
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Validation error
   *       409:
   *         description: Email already exists
   */
  static register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(ApiResponse.created(result, 'User registered successfully'));
  });

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Login with email and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *                 example: "admin@finance.app"
   *               password:
   *                 type: string
   *                 example: "Password123!"
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  static login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await AuthService.login(req.body);
    res.status(200).json(ApiResponse.ok(result, 'Login successful'));
  });

  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [refreshToken]
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed
   *       401:
   *         description: Invalid refresh token
   */
  static refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await AuthService.refreshToken(req.body.refreshToken);
    res.status(200).json(ApiResponse.ok(result, 'Token refreshed successfully'));
  });

  /**
   * @swagger
   * /api/v1/auth/me:
   *   get:
   *     summary: Get current user profile
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current user profile
   *       401:
   *         description: Not authenticated
   */
  static me = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await AuthService.getProfile(req.user!.id);
    res.status(200).json(ApiResponse.ok(user, 'Profile retrieved'));
  });
}
