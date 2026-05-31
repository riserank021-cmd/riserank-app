/**
 * Quiz API service — wraps all /quizzes endpoints.
 */

import { apiClient } from './client';
import type { ApiResponse, Quiz, QuizAttempt, AnswerPayload } from '../types/api.types';
import type { Language } from '../utils/constants';

export interface QuizListParams {
  page?: number;
  limit?: number;
  category?: string;
  examType?: string;
  search?: string;
}

export interface SubmitAttemptPayload {
  answers: AnswerPayload[];
  timeTakenSeconds: number;
  language: Language;
}

export const quizService = {
  getDaily() {
    return apiClient.get<ApiResponse<Quiz>>('/quizzes/daily');
  },

  list(params?: QuizListParams) {
    return apiClient.get<ApiResponse<Quiz[]>>('/quizzes', { params });
  },

  getById(quizId: string) {
    return apiClient.get<ApiResponse<Quiz>>(`/quizzes/${quizId}`);
  },

  startAttempt(quizId: string) {
    return apiClient.post<ApiResponse<{ attemptId: string; isExisting: boolean }>>(`/quizzes/${quizId}/start`);
  },

  submitAttempt(quizId: string, payload: SubmitAttemptPayload) {
    return apiClient.post<ApiResponse<QuizAttempt>>(`/quizzes/${quizId}/submit`, payload);
  },

  getHistory(params?: { page?: number; limit?: number }) {
    return apiClient.get<ApiResponse<QuizAttempt[]>>('/quizzes/history', { params });
  },

  getAttempt(attemptId: string) {
    return apiClient.get<ApiResponse<QuizAttempt>>(`/quizzes/attempt/${attemptId}`);
  },
};
