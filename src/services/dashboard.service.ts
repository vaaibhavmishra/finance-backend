import { prisma } from '../config/database';
import { DashboardSummary, CategoryBreakdown, TrendDataPoint } from '../types';

/**
 * Dashboard Service — provides aggregated analytics and summary data
 */
export class DashboardService {
  /**
   * Get overall financial summary (totals, balance, counts)
   */
  static async getSummary(startDate?: string, endDate?: string): Promise<DashboardSummary> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [incomeResult, expenseResult] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: {
          type: 'INCOME',
          isDeleted: false,
          ...dateFilter,
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.financialRecord.aggregate({
        where: {
          type: 'EXPENSE',
          isDeleted: false,
          ...dateFilter,
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;
    const incomeCount = incomeResult._count.id;
    const expenseCount = expenseResult._count.id;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalRecords: incomeCount + expenseCount,
      incomeCount,
      expenseCount,
    };
  }

  /**
   * Get category-wise breakdown of income and expenses
   */
  static async getCategoryBreakdown(
    startDate?: string,
    endDate?: string,
  ): Promise<CategoryBreakdown[]> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const results = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where: {
        isDeleted: false,
        ...dateFilter,
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Calculate total for percentage computation
    const grandTotal = results.reduce((sum, r) => sum + (r._sum.amount || 0), 0);

    return results.map((r) => ({
      category: r.category,
      type: r.type,
      total: r._sum.amount || 0,
      count: r._count.id,
      percentage: grandTotal > 0 ? Number((((r._sum.amount || 0) / grandTotal) * 100).toFixed(2)) : 0,
    }));
  }

  /**
   * Get income/expense trends over time (monthly or weekly)
   */
  static async getTrends(
    period: 'weekly' | 'monthly' = 'monthly',
    months: number = 6,
  ): Promise<TrendDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Fetch all records in the date range
    const records = await prisma.financialRecord.findMany({
      where: {
        isDeleted: false,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group records by period
    const periodMap = new Map<string, { income: number; expense: number }>();

    for (const record of records) {
      const key = this.getPeriodKey(record.date, period);

      if (!periodMap.has(key)) {
        periodMap.set(key, { income: 0, expense: 0 });
      }

      const bucket = periodMap.get(key)!;
      if (record.type === 'INCOME') {
        bucket.income += record.amount;
      } else {
        bucket.expense += record.amount;
      }
    }

    // Generate all periods (including empty ones) for a continuous timeline
    const allPeriods = this.generatePeriodRange(startDate, endDate, period);

    return allPeriods.map((periodKey) => {
      const data = periodMap.get(periodKey) || { income: 0, expense: 0 };
      return {
        period: periodKey,
        income: Number(data.income.toFixed(2)),
        expense: Number(data.expense.toFixed(2)),
        net: Number((data.income - data.expense).toFixed(2)),
      };
    });
  }

  /**
   * Get recent financial activity
   */
  static async getRecentActivity(limit: number = 10) {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return records;
  }

  // --- Private helpers ---

  private static buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return {};

    const filter: { date?: { gte?: Date; lte?: Date } } = { date: {} };
    if (startDate) filter.date!.gte = new Date(startDate);
    if (endDate) filter.date!.lte = new Date(endDate);

    return filter;
  }

  private static getPeriodKey(date: Date, period: 'weekly' | 'monthly'): string {
    if (period === 'monthly') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    // Weekly: use ISO week number
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = Math.round(((d.getTime() - week1.getTime()) / 86400000 + week1.getDay() + 1) / 7);

    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  private static generatePeriodRange(
    start: Date,
    end: Date,
    period: 'weekly' | 'monthly',
  ): string[] {
    const periods: string[] = [];

    if (period === 'monthly') {
      const current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= endMonth) {
        periods.push(
          `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        );
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      // weekly periods
      const current = new Date(start);
      current.setDate(current.getDate() - current.getDay() + 1); // Start from Monday

      while (current <= end) {
        periods.push(this.getPeriodKey(current, 'weekly'));
        current.setDate(current.getDate() + 7);
      }
    }

    return periods;
  }
}
