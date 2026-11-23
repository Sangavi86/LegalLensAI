import { z } from 'zod';

export const DocumentTypeEnum = z.enum([
  'CONTRACT_MSA',
  'CONTRACT_NDA',
  'CONTRACT_EMPLOYMENT',
  'CONTRACT_LEASE',
  'STATUTE_NOTIFICATION',
  'COURT_PETITION',
  'JUDGMENT',
  'OTHER',
]);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

export const JurisdictionEnum = z.enum(['IN', 'UK', 'US', 'SG']);
export type Jurisdiction = z.infer<typeof JurisdictionEnum>;

export const MalwareScanStatusEnum = z.enum(['PENDING', 'CLEAN', 'INFECTED', 'SKIPPED', 'FAILED']);
export type MalwareScanStatus = z.infer<typeof MalwareScanStatusEnum>;

export const OcrStatusEnum = z.enum(['PENDING', 'EXTRACTING', 'COMPLETED', 'FAILED']);
export type OcrStatus = z.infer<typeof OcrStatusEnum>;

export const DocumentMetadataSchema = z.object({
  documentId: z.string().min(1),
  tenantId: z.string().min(1),
  uploaderUserId: z.string().min(1),
  title: z.string().min(1),
  originalFilename: z.string().min(1),
  declaredMimeType: z.string(),
  detectedMagicMime: z.string(),
  fileSizeBytes: z.number().int().nonnegative(),
  sha256Checksum: z.string().length(64),
  storageUri: z.string().min(1),
  documentType: DocumentTypeEnum,
  jurisdiction: JurisdictionEnum.default('IN'),
  malwareScan: z.object({
    status: MalwareScanStatusEnum,
    scannedAt: z.string().optional(),
    engine: z.literal('ClamAV').default('ClamAV'),
  }),
  ocrStatus: OcrStatusEnum.default('PENDING'),
  ocrMetadata: z
    .object({
      engine: z.enum(['PYMUPDF', 'TESSERACT_5', 'HYBRID']),
      pageCount: z.number().int().nonnegative(),
      wordCount: z.number().int().nonnegative(),
      averageConfidence: z.number().min(0).max(1),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

export const DocumentUploadRequestSchema = z.object({
  documentType: DocumentTypeEnum.default('CONTRACT_MSA'),
  jurisdiction: JurisdictionEnum.default('IN'),
});
export type DocumentUploadRequest = z.infer<typeof DocumentUploadRequestSchema>;
