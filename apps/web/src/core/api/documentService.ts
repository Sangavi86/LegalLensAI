import { apiClient } from './apiClient';
import type { ApiResponse, Document, DocumentDetailResponse } from '@jurismind/shared-types';

export interface AIAnalysisResult {
  riskScore: number;
  executiveSummary: string;
  importantDates: string[];
  financialObligations: string[];
  terminationClauses: string[];
  responsibilities: string[];
  negotiationSuggestions: string[];
  clauses: {
    id: string;
    originalText: string;
    simplifiedExplanation: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    recommendation: string;
    suggestedRewrite?: string;
  }[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export const documentService = {
  // Existing functionality from Milestone 3
  uploadDocument: (formData: FormData, onUploadProgress?: (progressEvent: any) => void) => {
    return apiClient.post<ApiResponse<Document>>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },

  listDocuments: (params?: Record<string, string>) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiClient.get<ApiResponse<Document[]>>(`/documents${query ? `?${query}` : ''}`);
  },

  getDocumentById: (id: string) => {
    return apiClient.get<ApiResponse<DocumentDetailResponse>>(`/documents/${id}`);
  },

  deleteDocument: (id: string) => {
    return apiClient.delete<ApiResponse<{ message: string }>>(`/documents/${id}`);
  },

  retryDocument: (id: string) => {
    return apiClient.post<ApiResponse<{ message: string }>>(`/documents/${id}/retry`);
  },

  // TODO: Backend endpoint needs implementation
  // POST /api/v1/documents/:id/analysis
  startAnalysis: (id: string) => {
    return apiClient.post<ApiResponse<{ message: string }>>(`/documents/${id}/analysis`);
  },

  // TODO: Backend endpoint needs implementation
  // GET /api/v1/documents/:id/analysis
  getAnalysis: (id: string) => {
    return apiClient.get<ApiResponse<AIAnalysisResult>>(`/documents/${id}/analysis`);
  },

  // TODO: Backend endpoint needs implementation
  // POST /api/v1/documents/:id/chat
  sendChatMessage: (id: string, message: string) => {
    return apiClient.post<ApiResponse<AIChatMessage>>(`/documents/${id}/chat`, { message });
  },

  // TODO: Backend endpoint needs implementation
  // GET /api/v1/documents/:id/chat
  getChatHistory: (id: string) => {
    return apiClient.get<ApiResponse<AIChatMessage[]>>(`/documents/${id}/chat`);
  },

  // TODO: Backend endpoint needs implementation
  // POST /api/v1/documents/:id/report/pdf
  downloadPdfReport: (id: string) => {
    return apiClient.post(`/documents/${id}/report/pdf`, {}, { responseType: 'blob' });
  },
};
