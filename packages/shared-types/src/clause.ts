import { z } from 'zod';

export const ClauseTypeEnum = z.enum([
  'INDEMNITY',
  'LIMITATION_OF_LIABILITY',
  'TERMINATION',
  'GOVERNING_LAW_AND_JURISDICTION',
  'DISPUTE_RESOLUTION_ARBITRATION',
  'CONFIDENTIALITY',
  'NON_COMPETE',
  'INTELLECTUAL_PROPERTY',
  'FORCE_MAJEURE',
  'PAYMENT_TERMS',
  'REPRESENTATIONS_AND_WARRANTIES',
  'MISCELLANEOUS',
]);
export type ClauseType = z.infer<typeof ClauseTypeEnum>;

export const BoundingBoxSchema = z.object({
  page: z.number().int().positive(),
  x0: z.number(),
  y0: z.number(),
  x1: z.number(),
  y1: z.number(),
});
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

export const ContractClauseSchema = z.object({
  clauseId: z.string().min(1),
  documentId: z.string().min(1),
  tenantId: z.string().min(1),
  clauseNumber: z.string().min(1), // e.g., "14.2"
  clauseTitle: z.string().optional(),
  rawText: z.string().min(1),
  normalizedText: z.string().min(1),
  clauseType: ClauseTypeEnum,
  pageSpan: z.object({
    startPage: z.number().int().positive(),
    endPage: z.number().int().positive(),
    boundingBoxes: z.array(BoundingBoxSchema).default([]),
  }),
  crossReferences: z.array(z.string()).default([]),
  tokenLength: z.number().int().nonnegative(),
});
export type ContractClause = z.infer<typeof ContractClauseSchema>;
