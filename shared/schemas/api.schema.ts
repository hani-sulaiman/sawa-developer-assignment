import { z } from 'zod';

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.record(z.array(z.string())).optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export const createSuccessResponse = <T>(data: T) => ({
  success: true as const,
  data,
});

export const createErrorResponse = (error: string, details?: Record<string, string[]>) => ({
  success: false as const,
  error,
  details,
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof PaginationSchema>;
