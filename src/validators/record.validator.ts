import { z } from 'zod';

const categories = [
  'SALARY', 'FREELANCE', 'INVESTMENT', 'BUSINESS', 'RENTAL',
  'FOOD', 'TRANSPORTATION', 'UTILITIES', 'ENTERTAINMENT', 'HEALTHCARE',
  'EDUCATION', 'SHOPPING', 'TRAVEL', 'INSURANCE', 'TAXES', 'OTHER',
] as const;

export const createRecordSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(999999999, 'Amount exceeds maximum allowed value'),

  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be either INCOME or EXPENSE',
  }),

  category: z.enum(categories, {
    invalid_type_error: `Category must be one of: ${categories.join(', ')}`,
  }).optional().default('OTHER'),

  date: z
    .string()
    .datetime({ message: 'Date must be a valid ISO 8601 date string' })
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),

  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
});

export const updateRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(999999999, 'Amount exceeds maximum allowed value')
    .optional(),

  type: z.enum(['INCOME', 'EXPENSE'], {
    invalid_type_error: 'Type must be either INCOME or EXPENSE',
  }).optional(),

  category: z.enum(categories, {
    invalid_type_error: `Category must be one of: ${categories.join(', ')}`,
  }).optional(),

  date: z
    .string()
    .datetime({ message: 'Date must be a valid ISO 8601 date string' })
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),

  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const recordIdParamSchema = z.object({
  id: z.string().uuid('Invalid record ID format'),
});

export const listRecordsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.enum(categories).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(z.number().positive().optional()),
  maxAmount: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(z.number().positive().optional()),
  search: z.string().optional(),
  sortBy: z.enum(['amount', 'date', 'type', 'category', 'createdAt']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;
