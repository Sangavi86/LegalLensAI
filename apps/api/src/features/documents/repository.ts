import {
  DocumentModel,
  DocumentContentModel,
  DocumentProcessingLogModel,
  IDocumentDocument,
} from './model';
import type { CreateDocumentInput } from './types';
import type { DocumentListQueryDto } from './schema';
import type { ProcessingStep, LogStatus } from '@jurismind/shared-types';

export class DocumentRepository {
  public static async createDocument(input: CreateDocumentInput): Promise<IDocumentDocument> {
    const doc = new DocumentModel({
      ...input,
      status: 'UPLOADED',
      processingProgress: 10,
      warnings: [],
      extractionSuccess: false,
      version: 1,
      isDeleted: false,
    });
    return doc.save();
  }

  public static async findByHash(userId: string, fileHash: string): Promise<IDocumentDocument | null> {
    return DocumentModel.findOne({
      userId,
      fileHash,
      isDeleted: false,
    });
  }

  public static async findById(documentId: string, userId: string): Promise<IDocumentDocument | null> {
    return DocumentModel.findOne({
      _id: documentId,
      userId,
      isDeleted: false,
    });
  }

  public static async findActiveByUser(
    userId: string,
    query: DocumentListQueryDto
  ): Promise<{ items: IDocumentDocument[]; total: number }> {
    const filter: Record<string, unknown> = {
      userId,
      isDeleted: false,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { originalFilename: searchRegex }];
    }

    const sortOption: Record<string, 1 | -1> = {};
    switch (query.sort) {
      case 'createdAt_asc':
        sortOption.createdAt = 1;
        break;
      case 'title_asc':
        sortOption.title = 1;
        break;
      case 'title_desc':
        sortOption.title = -1;
        break;
      case 'createdAt_desc':
      default:
        sortOption.createdAt = -1;
        break;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      DocumentModel.find(filter).sort(sortOption).skip(skip).limit(query.limit),
      DocumentModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  public static async softDelete(documentId: string, userId: string): Promise<IDocumentDocument | null> {
    return DocumentModel.findOneAndUpdate(
      { _id: documentId, userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }

  public static async createDocumentContent(
    documentId: string,
    userId: string,
    rawText: string,
    encoding: string = 'utf-8'
  ) {
    return DocumentContentModel.create({
      documentId,
      userId,
      rawText,
      textLength: rawText.length,
      encoding,
    });
  }

  public static async findDocumentContent(documentId: string) {
    return DocumentContentModel.findOne({ documentId });
  }

  public static async createProcessingLog(
    documentId: string,
    step: ProcessingStep,
    status: LogStatus,
    message: string
  ) {
    return DocumentProcessingLogModel.create({
      documentId,
      step,
      status,
      message,
      timestamp: new Date(),
    });
  }

  public static async findProcessingLogs(documentId: string) {
    return DocumentProcessingLogModel.find({ documentId }).sort({ timestamp: 1 });
  }

  public static async updateStatusAndProgress(
    documentId: string,
    status: 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED',
    processingProgress: number,
    extraData?: Partial<IDocumentDocument>
  ): Promise<IDocumentDocument | null> {
    return DocumentModel.findByIdAndUpdate(
      documentId,
      {
        $set: {
          status,
          processingProgress,
          ...extraData,
        },
      },
      { new: true }
    );
  }
}
