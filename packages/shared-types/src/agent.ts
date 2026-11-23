import { z } from 'zod';

export const AgentTypeEnum = z.enum([
  'DOCUMENT_UNDERSTANDING',
  'LEGAL_RESEARCH',
  'LEGAL_RISK_ASSESSMENT',
  'EVIDENCE_VERIFICATION',
  'SCENARIO_SIMULATION',
  'REPORT_GENERATION',
]);
export type AgentType = z.infer<typeof AgentTypeEnum>;

export const TaskTypeEnum = z.enum([
  'OCR_EXTRACTION',
  'MULTI_AGENT_ANALYSIS',
  'SCENARIO_SIMULATION',
  'REPORT_EXPORT',
]);
export type TaskType = z.infer<typeof TaskTypeEnum>;

export const TaskStatusEnum = z.enum([
  'PENDING',
  'STARTED',
  'PROCESSING',
  'RETRY',
  'SUCCESS',
  'FAILED',
  'REVOKED',
]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const AgentExecutionTraceSchema = z.object({
  step: z.number().int().positive(),
  agent: AgentTypeEnum,
  status: z.enum(['RUNNING', 'COMPLETED', 'FAILED', 'INTERRUPTED']),
  promptTokens: z.number().int().nonnegative().default(0),
  completionTokens: z.number().int().nonnegative().default(0),
  latencyMs: z.number().nonnegative().default(0),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  message: z.string().optional(),
});
export type AgentExecutionTrace = z.infer<typeof AgentExecutionTraceSchema>;

export const BackgroundTaskSchema = z.object({
  taskId: z.string().min(1),
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  taskType: TaskTypeEnum,
  status: TaskStatusEnum,
  progressPercentage: z.number().min(0).max(100).default(0),
  currentStepDescription: z.string(),
  retriesAttempted: z.number().int().nonnegative().default(0),
  maxRetries: z.number().int().nonnegative().default(3),
  resultPayload: z.any().optional(),
  errorDetails: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
  heartbeatAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BackgroundTask = z.infer<typeof BackgroundTaskSchema>;
