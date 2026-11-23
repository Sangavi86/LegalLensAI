import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { config } from '../../config/app.config';
import type { ApiSuccess } from '@jurismind/shared-types';

const COOKIE_NAME = 'refreshToken';

function setRefreshTokenCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.NODE_ENV === 'production',
    path: '/api/v1/auth',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  });
}

function clearRefreshTokenCookie(reply: FastifyReply): void {
  reply.clearCookie(COOKIE_NAME, {
    path: '/api/v1/auth',
  });
}

export class AuthController {
  public static async register(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration input.',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const result = await AuthService.register(parseResult.data);
    setRefreshTokenCookie(reply, result.refreshToken);

    const response: ApiSuccess = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    };

    return reply.status(201).send(response);
  }

  public static async login(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid login input.',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const result = await AuthService.login(parseResult.data);
    setRefreshTokenCookie(reply, result.refreshToken);

    const response: ApiSuccess = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    };

    return reply.status(200).send(response);
  }

  public static async refresh(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken =
      (request.cookies as Record<string, string>)[COOKIE_NAME] ||
      (request.body as { refreshToken?: string })?.refreshToken;

    if (!refreshToken) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Refresh token cookie or body is required.',
        },
      });
    }

    const result = await AuthService.refresh(refreshToken);
    setRefreshTokenCookie(reply, result.refreshToken);

    const response: ApiSuccess = {
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    };

    return reply.status(200).send(response);
  }

  public static async logout(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken =
      (request.cookies as Record<string, string>)[COOKIE_NAME] ||
      (request.body as { refreshToken?: string })?.refreshToken;

    await AuthService.logout(refreshToken);
    clearRefreshTokenCookie(reply);

    const response: ApiSuccess = {
      success: true,
      data: { message: 'Logged out successfully.' },
    };

    return reply.status(200).send(response);
  }

  public static async me(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user?.sub) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated.' },
      });
    }

    const user = await AuthService.getCurrentUser(request.user.sub);

    const response: ApiSuccess = {
      success: true,
      data: { user },
    };

    return reply.status(200).send(response);
  }

  public static async googleAuthRedirect(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    if (!config.GOOGLE_CLIENT_ID) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Google Client ID is not configured.',
        },
      });
    }

    const callbackUrl =
      config.GOOGLE_CALLBACK_URL ||
      'http://localhost:8000/api/v1/auth/google/callback';

    const params = new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return reply.redirect(url);
  }

  public static async googleCallback(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { code } = request.query as { code?: string };
    if (!code) {
      return reply.status(400).send({
        success: false,
        error: { code: 'OAUTH_ERROR', message: 'Missing authorization code.' },
      });
    }

    try {
      const result = await AuthService.handleGoogleOAuth(code);
      setRefreshTokenCookie(reply, result.refreshToken);

      // Redirect to frontend dashboard with access token parameter or session storage
      const redirectUrl = `${config.FRONTEND_URL}/auth/callback?accessToken=${encodeURIComponent(result.accessToken)}`;
      return reply.redirect(redirectUrl);
    } catch (err) {
      const redirectUrl = `${config.FRONTEND_URL}/login?error=google_auth_failed`;
      return reply.redirect(redirectUrl);
    }
  }
}
