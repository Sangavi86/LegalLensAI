import { Schema, model, Document as MongooseDocument } from 'mongoose';
import type { Document, DocumentContent, DocumentProcessingLog, DocumentStatus, ProcessingStep, LogStatus } from '@jurismind/shared-types';

export interface IDocumentDocument extends MongooseDocument, Omit<Document, '_id' | 'createdAt' | 'updatedAt' | 'processingCompletedAt' | 'deletedAt' | 'indexedAt'> {
  processingCompletedAt?: Date;
  deletedAt?: Date;
  indexedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentContentDocument extends MongooseDocument, Omit<DocumentContent, '_id' | 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentProcessingLogDocument extends MongooseDocument, Omit<DocumentProcessingLog, '_id' | 'timestamp'> {
  timestamp: Date;
}

// ─── Document Metadata Schema ──────────────────────────────────────────────────
const documentSchema = new Schema<IDocumentDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    storedFilename: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
      lowercase: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
      index: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'en',
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'QUEUED', 'PROCESSING', 'READY', 'FAILED'],
      default: 'UPLOADED',
      index: true,
    },
    processingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    processingTime: {
      type: Number,
    },
    parserUsed: {
      type: String,
    },
    warnings: {
      type: [String],
      default: [],
    },
    extractionSuccess: {
      type: Boolean,
      default: false,
    },
    processingCompletedAt: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },

    // Reserved OCR Fields
    ocrRequired: { type: Boolean, default: null },
    ocrCompleted: { type: Boolean, default: null },
    ocrEngine: { type: String, default: null },
    ocrConfidence: { type: Number, default: null },

    // Reserved Milestone 4 Fields
    chunkCount: { type: Number, default: null },
    embeddingStatus: { type: String, default: null },
    indexedAt: { type: Date, default: null },
    summaryStatus: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query sorting & soft delete
documentSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

// Duplicate content check index per user
documentSchema.index({ userId: 1, fileHash: 1, isDeleted: 1 });

export const DocumentModel = model<IDocumentDocument>('Document', documentSchema);

// ─── Document Content Schema ───────────────────────────────────────────────────
const documentContentSchema = new Schema<IDocumentContentDocument>(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    textLength: {
      type: Number,
      required: true,
    },
    encoding: {
      type: String,
      default: 'utf-8',
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentContentModel = model<IDocumentContentDocument>(
  'DocumentContent',
  documentContentSchema
);

// ─── Document Processing Log Schema ───────────────────────────────────────────
const documentProcessingLogSchema = new Schema<IDocumentProcessingLogDocument>({
  documentId: {
    type: String,
    required: true,
    index: true,
  },
  step: {
    type: String,
    enum: ['UPLOADED', 'QUEUED', 'PROCESSING', 'TEXT_EXTRACTED', 'READY', 'FAILED'],
    required: true,
  },
  status: {
    type: String,
    enum: ['INFO', 'SUCCESS', 'WARNING', 'FAILED'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const DocumentProcessingLogModel = model<IDocumentProcessingLogDocument>(
  'DocumentProcessingLog',
  documentProcessingLogSchema
);
