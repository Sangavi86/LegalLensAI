import type { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from '../security/jwt.service';
import type { JwtPayload } from '@jurismind/shared-types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * Authentication Middleware
 * Validates RS256 Bearer JWT Access Token on protected endpoints.
 */
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required.',
      },
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = JwtService.verifyAccessToken(token);
    request.user = payload;
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired authentication token.',
      },
    });
  }
}
