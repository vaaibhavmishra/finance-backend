import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and summary endpoints
 */
export class DashboardController {
  /**
   * @swagger
   * /api/v1/dashboard/summary:
   *   get:
   *     summary: Get financial summary (totals, balance)
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema: { type: string, format: date-time }
   *       - in: query
   *         name: endDate
   *         schema: { type: string, format: date-time }
   *     responses:
   *       200:
   *         description: Financial summary
   */
  static summary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query as any;
    const summary = await DashboardService.getSummary(startDate, endDate);
    res.status(200).json(ApiResponse.ok(summary, 'Dashboard summary retrieved'));
  });

  /**
   * @swagger
   * /api/v1/dashboard/category-breakdown:
   *   get:
   *     summary: Get category-wise breakdown
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema: { type: string, format: date-time }
   *       - in: query
   *         name: endDate
   *         schema: { type: string, format: date-time }
   *     responses:
   *       200:
   *         description: Category breakdown
   */
  static categoryBreakdown = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query as any;
    const breakdown = await DashboardService.getCategoryBreakdown(startDate, endDate);
    res.status(200).json(ApiResponse.ok(breakdown, 'Category breakdown retrieved'));
  });

  /**
   * @swagger
   * /api/v1/dashboard/trends:
   *   get:
   *     summary: Get income/expense trends over time
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: period
   *         schema: { type: string, enum: [weekly, monthly], default: monthly }
   *       - in: query
   *         name: months
   *         schema: { type: integer, default: 6 }
   *     responses:
   *       200:
   *         description: Trend data
   */
  static trends = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { period, months } = req.query as any;
    const trends = await DashboardService.getTrends(period, months);
    res.status(200).json(ApiResponse.ok(trends, 'Trends retrieved'));
  });

  /**
   * @swagger
   * /api/v1/dashboard/recent-activity:
   *   get:
   *     summary: Get recent financial activity
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *     responses:
   *       200:
   *         description: Recent records
   */
  static recentActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const activity = await DashboardService.getRecentActivity(limit);
    res.status(200).json(ApiResponse.ok(activity, 'Recent activity retrieved'));
  });
}
