/**
 * Axios client with:
 *  - Bearer token injection on every request
 *  - Automatic token refresh on 401 (single-flight queue)
 *  - Logout on refresh failure
 */

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { storage } from '../utils/storage';

// ── Retry config ──────────────────────────────────────────────────────────────
// Retry transient network failures (no response received) up to MAX_RETRIES
// times with exponential backoff. Never retry 4xx / 5xx — those are server
// responses and should surface to the UI immediately.

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

/** Returns true for errors that are worth retrying (pure network failures). */
function isRetryable(error: AxiosError): boolean {
  // No response at all — connection refused, timeout, DNS failure, etc.
  if (!error.response) return true;
  // Treat gateway timeouts (504) as retryable network noise
  if (error.response.status === 504) return true;
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Create instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach access token ─────────────────────────────────

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Token refresh state ───────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token as string);
  });
  failedQueue = [];
}

// ── Response interceptor — handle 401 + network retries ──────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // ── Exponential-backoff retry for pure network errors ──────────────────
    if (isRetryable(error) && originalRequest) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      if (originalRequest._retryCount <= MAX_RETRIES) {
        const backoff = BASE_DELAY_MS * 2 ** (originalRequest._retryCount - 1);
        await delay(backoff);
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue subsequent requests until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken: string = data.data.accessToken;

        await storage.set(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        if (data.data.refreshToken) {
          await storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens so RootNavigator redirects to Auth
        await storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        await storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        await storage.remove(STORAGE_KEYS.SESSION_ID);
        await storage.remove(STORAGE_KEYS.USER);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
