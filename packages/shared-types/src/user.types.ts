// ─────────────────────────────────────────────
//  User Types
// ─────────────────────────────────────────────

export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  googleId?: string;
  preferredLanguage: string; // BCP-47 e.g. "en", "hi", "es"
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  _id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  preferredLanguage: string;
  createdAt: string;
}
