import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

import { config } from './config/app.config';
import { connectDatabase } from './core/database/mongodb.client';
import { errorHandler } from './core/middleware/error-handler.middleware';
import { healthRoutes } from './features/health/health.routes';

/**
 * Build and configure the Fastify application instance.
 * Separated from server startup to support testing.
 */
export async function buildApp() {
  const app = Fastify({
    logger:
      config.NODE_ENV === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
            },
          }
        : true,
    trustProxy: true,
  });

  // ─── Security plugins ───────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // Configured per-route in frontend
  });

  await app.register(cors, {
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(cookie, {
    secret: config.COOKIE_SECRET,
    hook: 'onRequest',
  });

  // ─── Rate limiting ─────────────────────────────────────
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down.',
      },
    }),
  });

  // ─── Global error handler ──────────────────────────────
  app.setErrorHandler(errorHandler);

  // ─── Not found handler ─────────────────────────────────
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested endpoint does not exist.',
      },
    });
  });

  // ─── Routes ────────────────────────────────────────────
  // All routes are versioned under /api/v1/
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes);
      // Future route registrations will go here:
      // await v1.register(authRoutes, { prefix: '/auth' });
      // await v1.register(documentRoutes, { prefix: '/documents' });
    },
    { prefix: '/api/v1' }
  );

  return app;
}

/**
 * Start the server.
 */
async function start() {
  try {
    // Connect to database before accepting traffic
    await connectDatabase();

    const app = await buildApp();

    await app.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });

    console.log(`\n🚀 JurisMind API running on http://localhost:${config.PORT}`);
    console.log(`📋 Health: http://localhost:${config.PORT}/api/v1/health`);
    console.log(`🏓 Ping:   http://localhost:${config.PORT}/api/v1/ping\n`);

    // ─── Graceful shutdown ──────────────────────────────
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      await app.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
