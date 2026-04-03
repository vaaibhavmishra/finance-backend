import type { Request } from 'express';
import type { Role, UserStatus } from '../generated/prisma/client';

/**
 * Authenticated user payload attached to request
 */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * JWT token payload
 */
export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  type: 'access' | 'refresh';
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Financial record filter parameters
 */
export interface RecordFilters {
  type?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

/**
 * Dashboard summary result
 */
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalRecords: number;
  incomeCount: number;
  expenseCount: number;
}

/**
 * Category breakdown result
 */
export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

/**
 * Trend data point
 */
export interface TrendDataPoint {
  period: string;
  income: number;
  expense: number;
  net: number;
}
