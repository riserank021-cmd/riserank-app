/**
 * Report service — wraps POST /users/report/:questionId
 */

import { apiClient } from './client';
import type { ApiResponse } from '../types/api.types';

export type ReportReason =
  | 'wrong_answer'
  | 'incorrect_question'
  | 'typo_or_language'
  | 'outdated_content'
  | 'other';

export interface ReportPayload {
  questionId: string;
  reason: ReportReason;
  note?: string;
}

export const reportService = {
  reportQuestion({ questionId, reason, note }: ReportPayload) {
    return apiClient.post<ApiResponse>(`/users/report/${questionId}`, { reason, note });
  },
};
