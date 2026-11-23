import { z } from 'zod';

export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  service: z.string().min(1),
  version: z.string().min(1),
  uptime: z.number().nonnegative(),
  timestamp: z.string(),
  environment: z.string(),
  details: z.record(z.any()).optional(),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

export const ApiErrorResponseSchema = z.object({
  type: z.string().default('about:blank'),
  title: z.string().min(1),
  status: z.number().int().min(400).max(599),
  detail: z.string().min(1),
  instance: z.string().optional(),
  code: z.string().min(1),
  timestamp: z.string(),
  correlationId: z.string().optional(),
  invalidParams: z
    .array(
      z.object({
        name: z.string(),
        reason: z.string(),
      })
    )
    .optional(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        timestamp: z.string(),
        correlationId: z.string().optional(),
      })
      .optional(),
  });
}
