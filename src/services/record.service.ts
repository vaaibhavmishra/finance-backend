import type { Prisma } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import type {
  CreateRecordInput,
  ListRecordsQuery,
  UpdateRecordInput,
} from '../validators/record.validator';

/**
 * Record Service — handles CRUD operations for financial records
 */
export const RecordService = {
  /**
   * Create a new financial record
   */
  async createRecord(data: CreateRecordInput, userId: string) {
    const record = await prisma.financialRecord.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category || 'OTHER',
        date: data.date || new Date(),
        description: data.description || null,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return record;
  },

  /**
   * List financial records with filtering, pagination, and search
   */
  async listRecords(query: ListRecordsQuery) {
    const {
      page,
      limit,
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.FinancialRecordWhereInput = {
      isDeleted: false,
    };

    if (type) where.type = type;
    if (category) where.category = category;

    // Date range filter
    if (startDate || endDate) {
      where.date = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {
        ...(minAmount !== undefined ? { gte: minAmount } : {}),
        ...(maxAmount !== undefined ? { lte: maxAmount } : {}),
      };
    }

    // Text search in description
    if (search) {
      where.description = { contains: search, mode: 'insensitive' };
    }

    // Execute count and find in parallel
    const [total, records] = await Promise.all([
      prisma.financialRecord.count({ where }),
      prisma.financialRecord.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return { records, total };
  },

  /**
   * Get a single record by ID
   */
  async getRecordById(id: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record) {
      throw ApiError.notFound('Financial record');
    }

    return record;
  },

  /**
   * Update a financial record
   */
  async updateRecord(id: string, data: UpdateRecordInput) {
    // Verify record exists and is not deleted
    const existing = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw ApiError.notFound('Financial record');
    }

    const updated = await prisma.financialRecord.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updated;
  },

  /**
   * Soft delete a financial record
   */
  async deleteRecord(id: string) {
    const existing = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw ApiError.notFound('Financial record');
    }

    await prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
