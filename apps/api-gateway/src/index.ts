import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`LegalLens Express API Gateway listening on port ${config.PORT}`, {
    port: config.PORT,
    environment: config.NODE_ENV,
    apiPrefix: config.API_PREFIX,
    nodeVersion: process.version,
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default server;
