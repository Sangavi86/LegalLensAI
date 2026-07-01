// ─────────────────────────────────────────────
//  Analysis Types
// ─────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AnalysisStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export type ClauseType =
  | 'indemnification'
  | 'liability_cap'
  | 'termination_rights'
  | 'ip_ownership'
  | 'non_compete'
  | 'auto_renewal'
  | 'governing_law'
  | 'payment_terms'
  | 'force_majeure'
  | 'definitions'
  | 'confidentiality'
  | 'dispute_resolution'
  | 'other';

export interface KeyObligation {
  title: string;
  description: string;
  party: string;
  dueDate?: string;
}

export interface ImportantDate {
  label: string;
  date: string;
  description: string;
}

export interface Party {
  name: string;
  role: string;
}

export interface Analysis {
  _id: string;
  documentId: string;
  userId: string;
  status: AnalysisStatus;
  overallRiskScore?: number;
  riskLevel?: RiskLevel;
  executiveSummary?: string;
  keyObligations: KeyObligation[];
  importantDates: ImportantDate[];
  partiesIdentified: Party[];
  governingLaw?: string;
  aiModelVersion?: string;
  processingTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlternativeClause {
  title: string;
  content: string;
  rationale: string;
}

export interface AnalysisClause {
  _id: string;
  analysisId: string;
  documentId: string;
  clauseType: ClauseType;
  title: string;
  originalText: string;
  plainLanguage: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  negotiationNotes?: string;
  alternativeClauses: AlternativeClause[];
  pageNumber?: number;
  charOffsetStart?: number;
  charOffsetEnd?: number;
  isRedFlag: boolean;
  tags: string[];
  createdAt: string;
}

// ─────────────────────────────────────────────
//  Decision Types
// ─────────────────────────────────────────────

export type DecisionRecommendation = 'sign' | 'negotiate' | 'reject';

export interface DecisionReport {
  analysisId: string;
  recommendation: DecisionRecommendation;
  confidence: number;
  summary: string;
  topRisks: string[];
  negotiationPriorities: string[];
  generatedAt: string;
}

// ─────────────────────────────────────────────
//  Conversation Types
// ─────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface Citation {
  chunkId: string;
  pageNumber?: number;
  excerpt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  citations: Citation[];
  tokensUsed?: number;
  modelUsed?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  documentId?: string;
  analysisId?: string;
  title: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}
