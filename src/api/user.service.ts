/**
 * User API service — profile, bookmarks, leaderboard.
 */

import { apiClient } from './client';
import type { ApiResponse, User, LeaderboardEntry, CategoryStat } from '../types/api.types';
import type { LeaderboardPeriod } from '../utils/constants';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  state?: string;
  preferredLanguage?: 'en' | 'hi';
  preferredExams?: string[];
}

export const userService = {
  getProfile() {
    return apiClient.get<ApiResponse<User>>('/users/profile');
  },

  updateProfile(payload: UpdateProfilePayload) {
    return apiClient.put<ApiResponse<User>>('/users/profile', payload);
  },

  getCategoryStats() {
    return apiClient.get<ApiResponse<{ stats: CategoryStat[] }>>('/users/category-stats');
  },

  // ── Bookmarks ───────────────────────────────────────────────────────────────

  getBookmarks(params?: { page?: number; limit?: number }) {
    return apiClient.get<ApiResponse>('/users/bookmarks', { params });
  },

  addBookmark(questionId: string) {
    return apiClient.post<ApiResponse>(`/users/bookmarks/${questionId}`);
  },

  removeBookmark(questionId: string) {
    return apiClient.delete<ApiResponse>(`/users/bookmarks/${questionId}`);
  },

  // ── Leaderboard ─────────────────────────────────────────────────────────────

  getLeaderboard(period: LeaderboardPeriod = 'weekly', params?: { page?: number; limit?: number }) {
    // Backend uses 'periodType' param and 'alltime' (no hyphen) for all-time
    const periodType = period === 'all-time' ? 'alltime' : period;
    return apiClient.get<ApiResponse<LeaderboardEntry[]>>('/users/leaderboard', {
      params: { periodType, ...params },
    });
  },

  getMyRank(period: LeaderboardPeriod = 'weekly') {
    const periodType = period === 'all-time' ? 'alltime' : period;
    return apiClient.get<ApiResponse<{ rank: number; entry: LeaderboardEntry }>>('/users/leaderboard/my-rank', {
      params: { periodType },
    });
  },
};
