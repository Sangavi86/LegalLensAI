import type { FastifyRequest, FastifyReply } from 'fastify';
import { DocumentService } from './service';
import { documentListQuerySchema } from './schema';
import type { ApiSuccess } from '@jurismind/shared-types';

export class DocumentController {
  /**
   * POST /api/v1/documents/upload
   * Authenticated file upload endpoint.
   */
  public static async upload(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required.' },
      });
    }

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_FILE', message: 'No file uploaded.' },
      });
    }

    const buffer = await data.toBuffer();
    const originalFilename = data.filename;
    const mimeType = data.mimetype;

    // Fields passed alongside file in multipart
    const titleField = (data.fields.title as any)?.value;
    const descriptionField = (data.fields.description as any)?.value;

    const document = await DocumentService.uploadDocument(
      userId,
      buffer,
      originalFilename,
      mimeType,
      buffer.length,
      typeof titleField === 'string' ? titleField : undefined,
      typeof descriptionField === 'string' ? descriptionField : undefined
    );

    const response: ApiSuccess = {
      success: true,
      data: document,
    };

    return reply.status(202).send(response);
  }

  /**
   * GET /api/v1/documents
   * Paginated document listing for current user.
   */
  public static async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required.' },
      });
    }

    const parseResult = documentListQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters.',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const result = await DocumentService.getUserDocuments(userId, parseResult.data);

    const response: ApiSuccess = {
      success: true,
      data: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
      },
    };

    return reply.status(200).send(response);
  }

  /**
   * GET /api/v1/documents/:id
   * Fetch metadata, raw text, and audit logs.
   */
  public static async getById(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required.' },
      });
    }

    const { id } = request.params as { id: string };
    const detail = await DocumentService.getDocumentById(userId, id);

    const response: ApiSuccess = {
      success: true,
      data: detail,
    };

    return reply.status(200).send(response);
  }

  /**
   * DELETE /api/v1/documents/:id
   * Soft delete document record and delete binary file from disk.
   */
  public static async delete(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required.' },
      });
    }

    const { id } = request.params as { id: string };
    await DocumentService.deleteDocument(userId, id);

    const response: ApiSuccess = {
      success: true,
      data: { message: 'Document deleted successfully.' },
    };

    return reply.status(200).send(response);
  }

  /**
   * POST /api/v1/documents/:id/retry
   * Retry failed ingestion processing.
   */
  public static async retry(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required.' },
      });
    }

    const { id } = request.params as { id: string };
    await DocumentService.retryProcessing(userId, id);

    const response: ApiSuccess = {
      success: true,
      data: { message: 'Document processing re-enqueued.' },
    };

    return reply.status(200).send(response);
  }
}
