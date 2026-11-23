import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config/app.config';
import type { JwtPayload } from '@jurismind/shared-types';

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Shared JWT Service — RS256 Asymmetric Token Operations
 * Private key is used for signing; Public key is used for verification.
 */
export class JwtService {
  private static getPrivateKey(): string {
    const key = config.JWT_PRIVATE_KEY;
    if (!key || key === 'placeholder') {
      throw new Error('JWT_PRIVATE_KEY is not configured in environment.');
    }
    return key;
  }

  private static getPublicKey(): string {
    const key = config.JWT_PUBLIC_KEY;
    if (!key || key === 'placeholder') {
      throw new Error('JWT_PUBLIC_KEY is not configured in environment.');
    }
    return key;
  }

  /**
   * Generate access and refresh token pair for a user ID and email.
   */
  public static generateTokens(userId: string, email: string): GeneratedTokens {
    const privateKey = this.getPrivateKey();

    const accessOptions: SignOptions = {
      algorithm: 'RS256',
      expiresIn: config.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'],
    };

    const refreshOptions: SignOptions = {
      algorithm: 'RS256',
      expiresIn: config.JWT_REFRESH_EXPIRY as SignOptions['expiresIn'],
    };

    const payload = { sub: userId, email };

    const accessToken = jwt.sign(payload, privateKey, accessOptions);
    const refreshToken = jwt.sign(payload, privateKey, refreshOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Verify and decode access token using RSA public key.
   */
  public static verifyAccessToken(token: string): JwtPayload {
    const publicKey = this.getPublicKey();
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;
  }

  /**
   * Verify and decode refresh token using RSA public key.
   */
  public static verifyRefreshToken(token: string): JwtPayload {
    const publicKey = this.getPublicKey();
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;
  }
}
