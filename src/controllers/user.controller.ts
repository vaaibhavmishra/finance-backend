import { Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */
export class UserController {
  /**
   * @swagger
   * /api/v1/users:
   *   get:
   *     summary: List all users (paginated)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *       - in: query
   *         name: role
   *         schema: { type: string, enum: [VIEWER, ANALYST, ADMIN] }
   *       - in: query
   *         name: status
   *         schema: { type: string, enum: [ACTIVE, INACTIVE] }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Users list
   *       403:
   *         description: Forbidden
   */
  static list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { users, total } = await UserService.listUsers(req.query as any);
    const { page, limit } = req.query as any;
    res.status(200).json(ApiResponse.paginated(users, total, page, limit, 'Users retrieved'));
  });

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   get:
   *     summary: Get a specific user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: User details
   *       404:
   *         description: User not found
   */
  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json(ApiResponse.ok(user, 'User retrieved'));
  });

  /**
   * @swagger
   * /api/v1/users/{id}/role:
   *   patch:
   *     summary: Update user role
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [role]
   *             properties:
   *               role:
   *                 type: string
   *                 enum: [VIEWER, ANALYST, ADMIN]
   *     responses:
   *       200:
   *         description: Role updated
   */
  static updateRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserService.updateRole(req.params.id, req.body, req.user!.id);
    res.status(200).json(ApiResponse.ok(user, 'User role updated'));
  });

  /**
   * @swagger
   * /api/v1/users/{id}/status:
   *   patch:
   *     summary: Activate or deactivate a user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [status]
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [ACTIVE, INACTIVE]
   *     responses:
   *       200:
   *         description: Status updated
   */
  static updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserService.updateStatus(req.params.id, req.body, req.user!.id);
    res.status(200).json(ApiResponse.ok(user, 'User status updated'));
  });

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   delete:
   *     summary: Delete a user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: User deleted
   */
  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await UserService.deleteUser(req.params.id, req.user!.id);
    res.status(200).json(ApiResponse.noContent('User deleted successfully'));
  });
}
