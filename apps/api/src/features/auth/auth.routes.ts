import type { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { authenticateUser } from '../../core/middleware/auth.middleware';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Public auth endpoints
  app.post('/register', AuthController.register);
  app.post('/login', AuthController.login);
  app.post('/refresh', AuthController.refresh);
  app.post('/logout', AuthController.logout);

  // Google OAuth endpoints
  app.get('/google', AuthController.googleAuthRedirect);
  app.get('/google/callback', AuthController.googleCallback);

  // Protected auth endpoint
  app.get('/me', { preHandler: [authenticateUser] }, AuthController.me);
}
