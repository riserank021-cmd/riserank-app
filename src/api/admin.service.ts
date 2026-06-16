/**
 * admin.service.ts
 * API calls for admin-only operations: add question, add current affairs, bulk CSV import.
 * Only accessible to users with role = 'admin' | 'superadmin'.
 */

import { apiClient } from './client';
import type { ApiResponse } from '../types/api.types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Bilingual {
  en: string;
  hi: string;
}

export interface QuestionPayload {
  text: Bilingual;
  options: {
    A: Bilingual;
    B: Bilingual;
    C: Bilingual;
    D: Bilingual;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: Bilingual;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  examType: string[];
  tags: string[];
}

export interface CurrentAffairsPayload {
  title: Bilingual;
  summary: Bilingual;
  content: Bilingual;
  category: string;
  tags: string[];
  source: string;
  sourceUrl: string;
  publishDate: string;
  publishTime: string;  // HH:MM
  isPublished: boolean;
}

// ── Questions ─────────────────────────────────────────────────────────────────

export const adminService = {
  createQuestion(payload: QuestionPayload) {
    return apiClient.post<ApiResponse<{ _id: string }>>('/questions', payload);
  },

  listCategories() {
    return apiClient.get<ApiResponse<{ _id: string; name: Bilingual; slug: string }[]>>('/categories');
  },

  // ── Current Affairs ────────────────────────────────────────────────────────

  createCurrentAffairs(payload: CurrentAffairsPayload) {
    return apiClient.post<ApiResponse<{ _id: string }>>('/current-affairs', payload);
  },

  // ── Bulk Import ────────────────────────────────────────────────────────────

  downloadTemplate() {
    return apiClient.get('/import/template', { responseType: 'blob' });
  },

  importQuestions(csvContent: string, filename: string) {
    const formData = new FormData();
    formData.append('file', {
      uri: `data:text/csv;base64,${csvContent}`,
      type: 'text/csv',
      name: filename,
    } as any);
    return apiClient.post<ApiResponse<{ imported: number; total: number }>>('/import/questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
