import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import type { ApiError } from '@jurismind/shared-types';

/**
 * Global Fastify error handler.
 * Normalises all errors into the standard ApiError shape.
 */
export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply
): void {
  // Zod validation errors
  if (error instanceof ZodError) {
    const response: ApiError = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.flatten().fieldErrors,
      },
    };
    reply.status(400).send(response);
    return;
  }

  // Fastify native errors (e.g. 404, 405)
  const statusCode =
    'statusCode' in error && typeof error.statusCode === 'number'
      ? error.statusCode
      : 500;

  // Map known codes to API error codes
  const codeMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
  };

  const response: ApiError = {
    success: false,
    error: {
      code: codeMap[statusCode] ?? 'INTERNAL_ERROR',
      message:
        statusCode === 500 && process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
    },
  };

  if (statusCode === 500) {
    console.error('Unhandled error:', error);
  }

  reply.status(statusCode).send(response);
}
