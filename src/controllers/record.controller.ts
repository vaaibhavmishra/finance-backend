import type { Response } from 'express';
import { RecordService } from '../services/record.service';
import type { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import type { ListRecordsQuery } from '../validators/record.validator';

/**
 * @swagger
 * tags:
 *   name: Financial Records
 *   description: CRUD operations for financial records
 */
export const RecordController = {
  /**
   * @swagger
   * /api/v1/records:
   *   post:
   *     summary: Create a new financial record
   *     tags: [Financial Records]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [amount, type]
   *             properties:
   *               amount:
   *                 type: number
   *                 example: 50000
   *               type:
   *                 type: string
   *                 enum: [INCOME, EXPENSE]
   *               category:
   *                 type: string
   *                 enum: [SALARY, FREELANCE, INVESTMENT, BUSINESS, RENTAL, FOOD, TRANSPORTATION, UTILITIES, ENTERTAINMENT, HEALTHCARE, EDUCATION, SHOPPING, TRAVEL, INSURANCE, TAXES, OTHER]
   *               date:
   *                 type: string
   *                 format: date-time
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Record created
   *       400:
   *         description: Validation error
   *       403:
   *         description: Forbidden (non-admin)
   */
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Not authenticated');
    const record = await RecordService.createRecord(req.body, req.user.id);
    res.status(201).json(ApiResponse.created(record, 'Financial record created'));
  }),

  /**
   * @swagger
   * /api/v1/records:
   *   get:
   *     summary: List financial records (paginated, filtered)
   *     tags: [Financial Records]
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
   *         name: type
   *         schema: { type: string, enum: [INCOME, EXPENSE] }
   *       - in: query
   *         name: category
   *         schema: { type: string }
   *       - in: query
   *         name: startDate
   *         schema: { type: string, format: date-time }
   *       - in: query
   *         name: endDate
   *         schema: { type: string, format: date-time }
   *       - in: query
   *         name: minAmount
   *         schema: { type: number }
   *       - in: query
   *         name: maxAmount
   *         schema: { type: number }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *       - in: query
   *         name: sortBy
   *         schema: { type: string, enum: [amount, date, type, category, createdAt] }
   *       - in: query
   *         name: sortOrder
   *         schema: { type: string, enum: [asc, desc] }
   *     responses:
   *       200:
   *         description: Records list with pagination
   */
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = req.query as unknown as ListRecordsQuery;
    const { records, total } = await RecordService.listRecords(query);
    const { page, limit } = query;
    res.status(200).json(ApiResponse.paginated(records, total, page, limit, 'Records retrieved'));
  }),

  /**
   * @swagger
   * /api/v1/records/{id}:
   *   get:
   *     summary: Get a specific financial record
   *     tags: [Financial Records]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Record details
   *       404:
   *         description: Not found
   */
  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const record = await RecordService.getRecordById(req.params.id as string);
    res.status(200).json(ApiResponse.ok(record, 'Record retrieved'));
  }),

  /**
   * @swagger
   * /api/v1/records/{id}:
   *   patch:
   *     summary: Update a financial record
   *     tags: [Financial Records]
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
   *             properties:
   *               amount: { type: number }
   *               type: { type: string, enum: [INCOME, EXPENSE] }
   *               category: { type: string }
   *               date: { type: string, format: date-time }
   *               description: { type: string }
   *     responses:
   *       200:
   *         description: Record updated
   */
  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const record = await RecordService.updateRecord(req.params.id as string, req.body);
    res.status(200).json(ApiResponse.ok(record, 'Record updated'));
  }),

  /**
   * @swagger
   * /api/v1/records/{id}:
   *   delete:
   *     summary: Soft delete a financial record
   *     tags: [Financial Records]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Record deleted
   */
  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    await RecordService.deleteRecord(req.params.id as string);
    res.status(200).json(ApiResponse.noContent('Record deleted successfully'));
  }),
};
