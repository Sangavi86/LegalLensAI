import type { FastifyInstance } from 'fastify';
import type { ApiSuccess } from '@jurismind/shared-types';
import { mongoose } from '../../core/database/mongodb.client';

interface HealthData {
  status: 'ok' | 'degraded';
  version: string;
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
  };
}

/**
 * Health check routes — no authentication required.
 */
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/health
  app.get('/health', async (_request, reply) => {
    const dbState = mongoose.connection.readyState;
    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    const isHealthy = dbState === 1;

    const data: HealthData = {
      status: isHealthy ? 'ok' : 'degraded',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
    };

    const response: ApiSuccess<HealthData> = {
      success: true,
      data,
    };

    reply.status(isHealthy ? 200 : 503).send(response);
  });

  // GET /api/v1/ping — lightweight liveness probe
  app.get('/ping', async (_request, reply) => {
    reply.send({ pong: true, ts: Date.now() });
  });
}
