// ─────────────────────────────────────────────
//  API Response Types
// ─────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─────────────────────────────────────────────
//  SSE Event Types
// ─────────────────────────────────────────────

export type SSEEventType =
  | 'progress'
  | 'chunk'
  | 'complete'
  | 'error';

export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
}

export interface AnalysisProgressEvent {
  stage: string;
  percent: number;
  message: string;
}

// ─────────────────────────────────────────────
//  Auth Types
// ─────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
}

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  iat: number;
  exp: number;
}

// ─────────────────────────────────────────────
//  Pagination Types
// ─────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
