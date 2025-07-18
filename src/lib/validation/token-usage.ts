import { z } from 'zod';

export const tokenUsageStatsSchema = z.object({
  period: z.enum(['all', 'today', 'week', 'month']).default('all'),
  model: z.string().optional(),
});

export const tokenUsageRecentSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type TokenUsageStatsRequest = z.infer<typeof tokenUsageStatsSchema>;
export type TokenUsageRecentRequest = z.infer<typeof tokenUsageRecentSchema>;
