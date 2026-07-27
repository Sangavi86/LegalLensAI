import type { FastifyInstance } from 'fastify';
import { DocumentController } from './controller';
import { authenticateUser } from '../../core/middleware/auth.middleware';

export async function documentRoutes(app: FastifyInstance): Promise<void> {
  // All document routes require authenticated user
  app.addHook('preHandler', authenticateUser);

  app.post('/upload', DocumentController.upload);
  app.get('/', DocumentController.list);
  app.get('/:id', DocumentController.getById);
  app.delete('/:id', DocumentController.delete);
  app.post('/:id/retry', DocumentController.retry);
}
