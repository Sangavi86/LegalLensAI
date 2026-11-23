// ─────────────────────────────────────────────
//  Document Types — Milestone 3
// ─────────────────────────────────────────────

export type DocumentStatus =
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

export interface Document {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  originalFilename: string;
  storedFilename: string;
  storagePath: string;
  mimeType: string;
  extension: string;
  fileSize: number;
  fileHash: string;

  // Structural & Linguistic Statistics
  pageCount: number;
  wordCount: number;
  characterCount: number;
  language: string;

  // Pipeline Lifecycle & Diagnostics
  status: DocumentStatus;
  processingProgress: number; // 0 to 100
  processingTime?: number;
  parserUsed?: string;
  warnings: string[];
  extractionSuccess: boolean;
  processingCompletedAt?: string;

  // Versioning & Soft Delete
  version: number;
  isDeleted: boolean;
  deletedAt?: string;

  // OCR Reserved Metadata (Nullable in M3)
  ocrRequired: boolean | null;
  ocrCompleted: boolean | null;
  ocrEngine: string | null;
  ocrConfidence: number | null;

  // Reserved for Milestone 4 (Nullable in M3)
  chunkCount: number | null;
  embeddingStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | null;
  indexedAt: string | null;
  summaryStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | null;

  createdAt: string;
  updatedAt: string;
}

export interface DocumentContent {
  _id: string;
  documentId: string;
  userId: string;
  rawText: string;
  textLength: number;
  encoding: string;
  createdAt: string;
  updatedAt: string;
}

export type ProcessingStep =
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'TEXT_EXTRACTED'
  | 'READY'
  | 'FAILED';

export type LogStatus = 'INFO' | 'SUCCESS' | 'WARNING' | 'FAILED';

export interface DocumentProcessingLog {
  _id: string;
  documentId: string;
  step: ProcessingStep;
  status: LogStatus;
  message: string;
  timestamp: string;
}

export interface DocumentListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: DocumentStatus;
  sort?: 'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc';
}

export interface DocumentDetailResponse {
  document: Document;
  content: DocumentContent | null;
  logs: DocumentProcessingLog[];
}
