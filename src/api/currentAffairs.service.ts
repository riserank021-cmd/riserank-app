/**
 * Current Affairs API service — wraps all /current-affairs endpoints.
 */

import { apiClient } from './client';
import type { ApiResponse, CurrentAffair } from '../types/api.types';

export interface CurrentAffairsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  language?: 'en' | 'hi';
}

export const currentAffairsService = {
  list(params?: CurrentAffairsParams) {
    return apiClient.get<ApiResponse<CurrentAffair[]>>('/current-affairs', { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<CurrentAffair>>(`/current-affairs/${id}`);
  },
};
