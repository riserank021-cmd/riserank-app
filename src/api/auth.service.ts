/**
 * Auth API service — wraps all /auth endpoints.
 */

import { apiClient } from './client';
import type {
  ApiResponse,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types/api.types';

export const authService = {
  register(payload: RegisterPayload) {
    return apiClient.post<ApiResponse<AuthTokens & { user: User }>>('/auth/register', payload);
  },

  login(payload: LoginPayload) {
    return apiClient.post<ApiResponse<AuthTokens & { user: User }>>('/auth/login', payload);
  },

  logout() {
    return apiClient.post<ApiResponse>('/auth/logout');
  },

  refreshToken(refreshToken: string) {
    return apiClient.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>('/auth/refresh', {
      refreshToken,
    });
  },

  sendVerificationOTP() {
    return apiClient.post<ApiResponse>('/auth/send-verification-otp');
  },

  verifyOTP(otp: string) {
    return apiClient.post<ApiResponse>('/auth/verify-email', { otp });
  },

  forgotPassword(email: string) {
    return apiClient.post<ApiResponse>('/auth/forgot-password', { email });
  },

  resetPassword(email: string, otp: string, newPassword: string) {
    return apiClient.post<ApiResponse>('/auth/reset-password', { email, otp, newPassword });
  },

  googleSignIn(idToken: string, device: 'android' | 'ios' = 'android') {
    return apiClient.post<ApiResponse<AuthTokens & { user: User; isNewUser: boolean }>>('/auth/google', {
      idToken,
      device,
    });
  },
};
