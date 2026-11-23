import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // Edge security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Correlation ID and structured request logger
  app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    const startTime = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${durationMs}ms)`, {
        correlationId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      });
    });

    next();
  });

  // Mount API Router under configured prefix (default: /api/v1)
  app.use(config.API_PREFIX, apiRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      type: 'https://api.legallens.ai/errors/not-found',
      title: 'Resource Not Found',
      status: 404,
      detail: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
      instance: req.originalUrl,
      code: 'ENDPOINT_NOT_FOUND',
      timestamp: new Date().toISOString(),
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
