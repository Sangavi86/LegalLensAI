import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  invalidParams?: Array<{ name: string; reason: string }>;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const correlationId = (req.headers['x-correlation-id'] as string) || 'none';

  if (err instanceof ZodError) {
    const invalidParams = err.issues.map((issue) => ({
      name: issue.path.join('.'),
      reason: issue.message,
    }));

    logger.warn('Request validation failed', {
      correlationId,
      path: req.originalUrl,
      invalidParams,
    });

    res.status(400).json({
      type: 'https://api.legallens.ai/errors/validation-failed',
      title: 'Validation Error',
      status: 400,
      detail: 'The submitted request payload failed schema validation.',
      instance: req.originalUrl,
      code: 'VALIDATION_FAILED',
      timestamp: new Date().toISOString(),
      correlationId,
      invalidParams,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  logger.error('Unhandled request error', err, {
    correlationId,
    statusCode,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    type: 'https://api.legallens.ai/errors/internal-error',
    title: statusCode >= 500 ? 'Internal Server Error' : err.message,
    status: statusCode,
    detail: statusCode >= 500 ? 'An unexpected error occurred while processing your request.' : err.message,
    instance: req.originalUrl,
    code: errorCode,
    timestamp: new Date().toISOString(),
    correlationId,
  });
}
