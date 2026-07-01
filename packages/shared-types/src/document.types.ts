// ─────────────────────────────────────────────
//  Document Types
// ─────────────────────────────────────────────

export type DocumentType =
  | 'contract'
  | 'nda'
  | 'lease'
  | 'employment'
  | 'tos'
  | 'other';

export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'analyzed'
  | 'failed';

export interface Document {
  _id: string;
  userId: string;
  title: string;
  docType: DocumentType;
  jurisdiction?: string;
  originalLanguage: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  rawText?: string;
  pageCount?: number;
  wordCount?: number;
  status: DocumentStatus;
  versionNumber: number;
  parentDocId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  _id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  pageStart?: number;
  pageEnd?: number;
  faissVectorId?: number;
  createdAt: string;
}
