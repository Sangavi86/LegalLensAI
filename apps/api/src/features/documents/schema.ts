import { z } from 'zod';

export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'] as const;
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const documentListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z
    .enum(['UPLOADED', 'QUEUED', 'PROCESSING', 'READY', 'FAILED'])
    .optional(),
  sort: z
    .enum(['createdAt_desc', 'createdAt_asc', 'title_asc', 'title_desc'])
    .default('createdAt_desc'),
});

export type DocumentListQueryDto = z.infer<typeof documentListQuerySchema>;
