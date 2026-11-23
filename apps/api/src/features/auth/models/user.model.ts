import { Schema, model, Document } from 'mongoose';
import type { UserPublic } from '@jurismind/shared-types';

export interface IRefreshToken {
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IUserDocument extends Document {
  email: string;
  passwordHash?: string;
  fullName: string;
  avatarUrl?: string;
  googleId?: string;
  preferredLanguage: string;
  refreshTokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
  toPublic(): UserPublic;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    refreshTokens: [refreshTokenSchema],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toPublic = function (): UserPublic {
  return {
    _id: this._id.toString(),
    email: this.email,
    fullName: this.fullName,
    avatarUrl: this.avatarUrl,
    preferredLanguage: this.preferredLanguage,
    createdAt: this.createdAt.toISOString(),
  };
};

export const UserModel = model<IUserDocument>('User', userSchema);
