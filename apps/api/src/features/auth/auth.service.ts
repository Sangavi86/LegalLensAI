import { UserModel, IUserDocument } from './models/user.model';
import { RegisterDto, LoginDto } from './auth.schema';
import { PasswordService } from '../../core/security/password.service';
import { JwtService } from '../../core/security/jwt.service';
import { config } from '../../config/app.config';
import type { UserPublic } from '@jurismind/shared-types';

export interface AuthResult {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user with email and password.
   */
  public static async register(dto: RegisterDto): Promise<AuthResult> {
    const existingUser = await UserModel.findOne({ email: dto.email });
    if (existingUser) {
      const error = new Error('User with this email already exists.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 409;
      (error as unknown as { statusCode: number; code: string }).code = 'USER_EXISTS';
      throw error;
    }

    const passwordHash = await PasswordService.hashPassword(dto.password);

    const user = new UserModel({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      preferredLanguage: dto.preferredLanguage || 'en',
      refreshTokens: [],
    });

    const { accessToken, refreshToken } = JwtService.generateTokens(
      user._id.toString(),
      user.email
    );

    const tokenHash = PasswordService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    user.refreshTokens.push({
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });

    await user.save();

    return {
      user: user.toPublic(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate user with email and password.
   */
  public static async login(dto: LoginDto): Promise<AuthResult> {
    const user = await UserModel.findOne({ email: dto.email });
    if (!user) {
      const error = new Error('Invalid email or password.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 401;
      (error as unknown as { statusCode: number; code: string }).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    if (!user.passwordHash) {
      const error = new Error(
        'This account uses Google OAuth. Please sign in with Google.'
      );
      (error as unknown as { statusCode: number; code: string }).statusCode = 401;
      (error as unknown as { statusCode: number; code: string }).code = 'OAUTH_ACCOUNT';
      throw error;
    }

    const isPasswordValid = await PasswordService.comparePassword(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 401;
      (error as unknown as { statusCode: number; code: string }).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const { accessToken, refreshToken } = JwtService.generateTokens(
      user._id.toString(),
      user.email
    );

    const tokenHash = PasswordService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Clean up expired refresh tokens
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.expiresAt > new Date()
    );
    user.refreshTokens.push({ tokenHash, expiresAt, createdAt: new Date() });

    await user.save();

    return {
      user: user.toPublic(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate refresh token and generate a new access token.
   */
  public static async refresh(rawRefreshToken: string): Promise<RefreshResult> {
    if (!rawRefreshToken) {
      const error = new Error('Refresh token is required.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 401;
      (error as unknown as { statusCode: number; code: string }).code = 'UNAUTHORIZED';
      throw error;
    }

    let payload;
    try {
      payload = JwtService.verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 401;
      (error as unknown as { statusCode: number; code: string }).code = 'UNAUTHORIZED';
      throw error;
    }

    const user = await UserModel.findById(payload.sub);
    if (!user) {
      const error = new Error('User not found.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 401;
      (error as unknown as { statusCode: number; code: string }).code = 'UNAUTHORIZED';
      throw error;
    }

    const incomingHash = PasswordService.hashToken(rawRefreshToken);
    const tokenIndex = user.refreshTokens.findIndex(
      (t) => t.tokenHash === incomingHash && t.expiresAt > new Date()
    );

    if (tokenIndex === -1) {
      const error = new Error('Invalid or revoked refresh token.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 401;
      (error as unknown as { statusCode: number; code: string }).code = 'UNAUTHORIZED';
      throw error;
    }

    // Remove used token (rotation)
    user.refreshTokens.splice(tokenIndex, 1);

    // Clean up expired tokens
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.expiresAt > new Date()
    );

    // Issue new tokens
    const { accessToken, refreshToken: newRefreshToken } = JwtService.generateTokens(
      user._id.toString(),
      user.email
    );

    const newHash = PasswordService.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash: newHash,
      expiresAt,
      createdAt: new Date(),
    });

    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke refresh token and logout user.
   */
  public static async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;

    try {
      const payload = JwtService.verifyRefreshToken(rawRefreshToken);
      const user = await UserModel.findById(payload.sub);
      if (user) {
        const tokenHash = PasswordService.hashToken(rawRefreshToken);
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t.tokenHash !== tokenHash
        );
        await user.save();
      }
    } catch {
      // Ignore token verification errors during logout
    }
  }

  /**
   * Get current authenticated user profile.
   */
  public static async getCurrentUser(userId: string): Promise<UserPublic> {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 404;
      (error as unknown as { statusCode: number; code: string }).code = 'NOT_FOUND';
      throw error;
    }
    return user.toPublic();
  }

  /**
   * Google OAuth Callback Exchange — Uses environment variables for client secret/id.
   */
  public static async handleGoogleOAuth(code: string): Promise<AuthResult> {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured in environment.');
    }

    const callbackUrl =
      config.GOOGLE_CALLBACK_URL ||
      'http://localhost:8000/api/v1/auth/google/callback';

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const error = new Error('Failed to exchange Google OAuth code.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 400;
      (error as unknown as { statusCode: number; code: string }).code = 'OAUTH_FAILED';
      throw error;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    // 2. Fetch user profile from Google
    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!userRes.ok) {
      const error = new Error('Failed to retrieve user profile from Google.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 400;
      (error as unknown as { statusCode: number; code: string }).code = 'OAUTH_FAILED';
      throw error;
    }

    const googleUser = (await userRes.json()) as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };

    let user: IUserDocument | null = await UserModel.findOne({
      $or: [{ googleId: googleUser.id }, { email: googleUser.email.toLowerCase() }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.id;
      }
      if (googleUser.picture && !user.avatarUrl) {
        user.avatarUrl = googleUser.picture;
      }
    } else {
      user = new UserModel({
        email: googleUser.email.toLowerCase(),
        fullName: googleUser.name || 'Google User',
        avatarUrl: googleUser.picture,
        googleId: googleUser.id,
        preferredLanguage: 'en',
        refreshTokens: [],
      });
    }

    const { accessToken, refreshToken } = JwtService.generateTokens(
      user._id.toString(),
      user.email
    );

    const tokenHash = PasswordService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.expiresAt > new Date()
    );
    user.refreshTokens.push({ tokenHash, expiresAt, createdAt: new Date() });

    await user.save();

    return {
      user: user.toPublic(),
      accessToken,
      refreshToken,
    };
  }
}
