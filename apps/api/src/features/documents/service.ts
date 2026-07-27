import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DocumentRepository } from './repository';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, DocumentListQueryDto } from './schema';
import { config } from '../../config/app.config';
import type { DocumentDetailResponse } from '@jurismind/shared-types';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

export class DocumentService {
  /**
   * Ensure uploads directory exists on disk.
   */
  private static ensureUploadDirectory(): void {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Compute SHA-256 hash of file buffer.
   */
  public static computeFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Sanitize original filename to prevent directory traversal and header injection.
   */
  public static sanitizeFilename(filename: string): string {
    return path.basename(filename).replace(/[^a-zA-Z0-9_.\-\s]/g, '_');
  }

  /**
   * Upload and initialize document ingestion pipeline.
   */
  public static async uploadDocument(
    userId: string,
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    fileSize: number,
    title?: string,
    description?: string
  ) {
    // 1. Validation: File size
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      const error = new Error(`File size exceeds maximum limit of 20 MB.`);
      (error as unknown as { statusCode: number; code: string }).statusCode = 400;
      (error as unknown as { statusCode: number; code: string }).code = 'FILE_TOO_LARGE';
      throw error;
    }

    const cleanFilename = this.sanitizeFilename(originalFilename);
    const extension = path.extname(cleanFilename).toLowerCase().replace('.', '');

    // 2. Validation: Extension & MIME type
    if (!ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number])) {
      const error = new Error(`Unsupported file extension '.${extension}'. Allowed formats: PDF, DOCX, TXT.`);
      (error as unknown as { statusCode: number; code: string }).statusCode = 400;
      (error as unknown as { statusCode: number; code: string }).code = 'UNSUPPORTED_FORMAT';
      throw error;
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number]) && mimeType !== 'application/octet-stream') {
      const error = new Error(`Unsupported MIME type '${mimeType}'.`);
      (error as unknown as { statusCode: number; code: string }).statusCode = 400;
      (error as unknown as { statusCode: number; code: string }).code = 'UNSUPPORTED_MIME_TYPE';
      throw error;
    }

    // 3. Compute SHA-256 Hash & Check Duplicates
    const fileHash = this.computeFileHash(fileBuffer);
    const existingDoc = await DocumentRepository.findByHash(userId, fileHash);
    if (existingDoc) {
      const error = new Error(`A document with identical content has already been uploaded.`);
      (error as unknown as { statusCode: number; code: string }).statusCode = 409;
      (error as unknown as { statusCode: number; code: string }).code = 'DUPLICATE_CONTENT';
      throw error;
    }

    // 4. Save file to disk securely
    this.ensureUploadDirectory();
    const storedFilename = `${crypto.randomUUID()}.${extension}`;
    const storagePath = path.join('uploads', 'documents', storedFilename);
    const fullDiskPath = path.join(process.cwd(), storagePath);

    await fs.promises.writeFile(fullDiskPath, fileBuffer);

    // 5. Create Document Metadata Record
    const documentTitle = title && title.trim() ? title.trim() : cleanFilename;

    const document = await DocumentRepository.createDocument({
      userId,
      title: documentTitle,
      description,
      originalFilename: cleanFilename,
      storedFilename,
      storagePath,
      mimeType,
      extension,
      fileSize,
      fileHash,
    });

    await DocumentRepository.createProcessingLog(
      document._id.toString(),
      'UPLOADED',
      'INFO',
      `Document uploaded successfully to ${storagePath}.`
    );

    // 6. Dispatch Decoupled Async Background Ingestion Pipeline
    setImmediate(() => {
      this.processDocumentPipeline(document._id.toString(), userId, fullDiskPath, mimeType, extension).catch(
        (err) => console.error(`Background ingestion error for ${document._id}:`, err)
      );
    });

    return document;
  }

  /**
   * Decoupled Document Processing Pipeline Execution.
   */
  public static async processDocumentPipeline(
    documentId: string,
    userId: string,
    fullDiskPath: string,
    mimeType: string,
    extension: string
  ): Promise<void> {
    try {
      // 1. Mark QUEUED
      await DocumentRepository.updateStatusAndProgress(documentId, 'QUEUED', 25);
      await DocumentRepository.createProcessingLog(documentId, 'QUEUED', 'INFO', 'Document queued for processing.');

      // 2. Mark PROCESSING
      await DocumentRepository.updateStatusAndProgress(documentId, 'PROCESSING', 40);
      await DocumentRepository.createProcessingLog(documentId, 'PROCESSING', 'INFO', 'Executing text extraction in AI service.');

      // 3. Call AI Service
      const aiServiceUrl = `${config.AI_SERVICE_URL}/ai/v1/documents/process`;
      const response = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: fullDiskPath,
          mimeType,
          extension,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI Service error (${response.status}): ${errText}`);
      }

      const resData = (await response.json()) as {
        success: boolean;
        data: {
          text: string;
          language: string;
          pageCount: number;
          wordCount: number;
          characterCount: number;
          parserUsed: string;
          processingTime: number;
          warnings: string[];
        };
      };

      if (!resData.success || !resData.data) {
        throw new Error('AI Service returned invalid payload structure.');
      }

      const extraction = resData.data;

      // 4. Save Extracted Content in DocumentContent Collection
      await DocumentRepository.createDocumentContent(
        documentId,
        userId,
        extraction.text,
        'utf-8'
      );

      await DocumentRepository.createProcessingLog(
        documentId,
        'TEXT_EXTRACTED',
        'SUCCESS',
        `Extracted ${extraction.characterCount} characters using ${extraction.parserUsed} in ${extraction.processingTime}ms.`
      );

      // 5. Update Document to READY
      await DocumentRepository.updateStatusAndProgress(documentId, 'READY', 100, {
        pageCount: extraction.pageCount,
        wordCount: extraction.wordCount,
        characterCount: extraction.characterCount,
        language: extraction.language || 'en',
        parserUsed: extraction.parserUsed,
        processingTime: extraction.processingTime,
        warnings: extraction.warnings || [],
        extractionSuccess: true,
        processingCompletedAt: new Date(),
      } as any);

      await DocumentRepository.createProcessingLog(
        documentId,
        'READY',
        'SUCCESS',
        'Document processing finished successfully.'
      );
    } catch (err: any) {
      console.error(`Document processing failed for ID ${documentId}:`, err);

      await DocumentRepository.updateStatusAndProgress(documentId, 'FAILED', 0, {
        extractionSuccess: false,
        warnings: [err.message || 'Unknown processing error'],
      } as any);

      await DocumentRepository.createProcessingLog(
        documentId,
        'FAILED',
        'FAILED',
        `Processing failed: ${err.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Get user documents list with pagination, search, and filters.
   */
  public static async getUserDocuments(userId: string, query: DocumentListQueryDto) {
    const { items, total } = await DocumentRepository.findActiveByUser(userId, query);
    const hasMore = query.page * query.limit < total;

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      hasMore,
    };
  }

  /**
   * Get document metadata along with extracted raw text and processing logs.
   */
  public static async getDocumentById(userId: string, documentId: string): Promise<DocumentDetailResponse> {
    const document = await DocumentRepository.findById(documentId, userId);
    if (!document) {
      const error = new Error('Document not found.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 404;
      (error as unknown as { statusCode: number; code: string }).code = 'NOT_FOUND';
      throw error;
    }

    const [content, logs] = await Promise.all([
      DocumentRepository.findDocumentContent(documentId),
      DocumentRepository.findProcessingLogs(documentId),
    ]);

    return {
      document: document.toObject() as any,
      content: content ? (content.toObject() as any) : null,
      logs: logs.map((l) => l.toObject() as any),
    };
  }

  /**
   * Soft delete document record and remove binary file from disk.
   */
  public static async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await DocumentRepository.softDelete(documentId, userId);
    if (!document) {
      const error = new Error('Document not found.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 404;
      (error as unknown as { statusCode: number; code: string }).code = 'NOT_FOUND';
      throw error;
    }

    // Delete physical file from disk
    const fullDiskPath = path.join(process.cwd(), document.storagePath);
    if (fs.existsSync(fullDiskPath)) {
      try {
        await fs.promises.unlink(fullDiskPath);
      } catch (err) {
        console.warn(`Failed to delete disk file ${fullDiskPath}:`, err);
      }
    }

    await DocumentRepository.createProcessingLog(
      documentId,
      'FAILED',
      'WARNING',
      'Document soft deleted and disk file removed.'
    );
  }

  /**
   * Retry processing for failed document.
   */
  public static async retryProcessing(userId: string, documentId: string): Promise<void> {
    const document = await DocumentRepository.findById(documentId, userId);
    if (!document) {
      const error = new Error('Document not found.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 404;
      (error as unknown as { statusCode: number; code: string }).code = 'NOT_FOUND';
      throw error;
    }

    const fullDiskPath = path.join(process.cwd(), document.storagePath);
    if (!fs.existsSync(fullDiskPath)) {
      const error = new Error('Physical document file missing from disk.');
      (error as unknown as { statusCode: number; code: string }).statusCode = 404;
      (error as unknown as { statusCode: number; code: string }).code = 'FILE_NOT_FOUND';
      throw error;
    }

    setImmediate(() => {
      this.processDocumentPipeline(document._id.toString(), userId, fullDiskPath, document.mimeType, document.extension).catch(
        (err) => console.error(`Retry background ingestion error for ${document._id}:`, err)
      );
    });
  }
}
