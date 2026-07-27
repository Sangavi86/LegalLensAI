import type { Document, DocumentContent, DocumentProcessingLog, DocumentListQuery } from '@jurismind/shared-types';

export type { Document, DocumentContent, DocumentProcessingLog, DocumentListQuery };

export interface CreateDocumentInput {
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
}

export interface DocumentExtractionResult {
  text: string;
  language: string;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  parserUsed: string;
  processingTime: number;
  warnings: string[];
}
