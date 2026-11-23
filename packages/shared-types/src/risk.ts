import { z } from 'zod';

export const RiskSeverityEnum = z.enum([
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'INFORMATIONAL',
]);
export type RiskSeverity = z.infer<typeof RiskSeverityEnum>;

export const RiskCategoryEnum = z.enum([
  'STATUTORY_UNENFORCEABILITY',
  'UNBOUNDED_FINANCIAL_LIABILITY',
  'ONE_SIDED_TERMINATION',
  'REGULATORY_NON_COMPLIANCE',
  'JURISDICTIONAL_DEFECT',
  'AMBIGUOUS_OBLIGATION',
  'IP_EXPOSURE',
]);
export type RiskCategory = z.infer<typeof RiskCategoryEnum>;

export const StructuredFeaturesSchema = z.object({
  clauseLengthTokens: z.number().int().nonnegative(),
  liabilityCapRatio: z.number(), // -1 if uncapped, 1.0 for 1x
  hasUnilateralTermination: z.boolean(),
  indemnityCarveoutsCount: z.number().int().nonnegative(),
  nonCompeteDurationMonths: z.number().int().nonnegative(),
  jurisdictionDivergenceFlag: z.boolean(),
  ambiguityEntropyScore: z.number().min(0).max(1),
  penaltyDoctrineIndicator: z.boolean(),
});
export type StructuredFeatures = z.infer<typeof StructuredFeaturesSchema>;

export const SHAPFeatureAttributionSchema = z.object({
  featureName: z.string(),
  featureValue: z.union([z.string(), z.number(), z.boolean()]),
  attributionWeight: z.number(),
});
export type SHAPFeatureAttribution = z.infer<typeof SHAPFeatureAttributionSchema>;

export const ModelBasedExplanationSchema = z.object({
  baseValue: z.number(),
  shapFeatureAttributions: z.array(SHAPFeatureAttributionSchema),
});
export type ModelBasedExplanation = z.infer<typeof ModelBasedExplanationSchema>;

export const QualitativeIRACSchema = z.object({
  issue: z.string().min(1),
  rule: z.string().min(1),
  application: z.string().min(1),
  conclusion: z.string().min(1),
});
export type QualitativeIRAC = z.infer<typeof QualitativeIRACSchema>;

export const RiskFindingSchema = z.object({
  riskId: z.string().min(1),
  clauseId: z.string().min(1),
  clauseNumber: z.string().min(1),
  category: RiskCategoryEnum,
  severity: RiskSeverityEnum,
  calibratedRiskScore: z.number().min(0).max(1),
  structuredFeatures: StructuredFeaturesSchema,
  modelBasedExplanation: ModelBasedExplanationSchema,
  qualitativeIRAC: QualitativeIRACSchema,
  exactClauseText: z.string().min(1),
  mitigationRecommendation: z.object({
    recommendedAmendment: z.string(),
    cleanReplacementText: z.string(),
    fallbackNegotiationPosition: z.string(),
  }),
  isAbstention: z.boolean().default(false),
  abstentionReason: z.string().optional(),
  hitlReviewed: z.boolean().default(false),
  createdAt: z.string(),
});
export type RiskFinding = z.infer<typeof RiskFindingSchema>;
