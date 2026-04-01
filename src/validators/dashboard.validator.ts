import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const trendQuerySchema = z.object({
  period: z.enum(['weekly', 'monthly']).optional().default('monthly'),
  months: z.string().optional().default('6').transform(Number).pipe(z.number().int().min(1).max(24)),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
export type TrendQuery = z.infer<typeof trendQuerySchema>;
