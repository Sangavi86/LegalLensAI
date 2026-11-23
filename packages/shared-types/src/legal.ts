import { z } from 'zod';

export const JudicialTreatmentStatusEnum = z.enum([
  'ACTIVE',
  'OVERRULED',
  'REVERSED',
  'DISTINGUISHED',
  'MODIFIED',
]);
export type JudicialTreatmentStatus = z.infer<typeof JudicialTreatmentStatusEnum>;

export const StatutoryReferenceSchema = z.object({
  statuteCode: z.string().min(1),
  actTitle: z.string().min(1),
  sectionNumber: z.string().min(1),
  sectionTitle: z.string().optional(),
  exactTextExcerpt: z.string().min(1),
  officialSourceUrl: z.string().url(),
  isMandatory: z.boolean().default(true),
});
export type StatutoryReference = z.infer<typeof StatutoryReferenceSchema>;

export const JudicialPrecedentSchema = z.object({
  caseTitle: z.string().min(1),
  digiscrNeutralCitation: z.string().min(1),
  officialScrCitation: z.string().optional(),
  court: z.string().default('Supreme Court of India'),
  decisionDate: z.string(),
  benchStrength: z.number().int().positive().default(2),
  exactRatioExcerpt: z.string().min(1),
  treatmentStatus: JudicialTreatmentStatusEnum.default('ACTIVE'),
  treatmentDetails: z.string().optional(),
  overruledByCitations: z.array(z.string()).default([]),
});
export type JudicialPrecedent = z.infer<typeof JudicialPrecedentSchema>;
