/**
 * useApiError — extracts a user-facing message from any Axios error.
 *
 * Usage:
 *   const { extractError } = useApiError();
 *   try { ... } catch(e) { Toast.show({ text2: extractError(e) }); }
 */

import { useCallback } from 'react';
import type { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  error?: string;
}

export function useApiError() {
  const extractError = useCallback((err: unknown, fallback = 'Something went wrong'): string => {
    if (!err) return fallback;

    const axiosErr = err as AxiosError<ApiErrorBody>;

    // Server returned a structured error body
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr.response?.data?.error) return axiosErr.response.data.error;

    // Network timeout / no connection
    if (axiosErr.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    if (axiosErr.message === 'Network Error') return 'No internet connection.';

    // Generic Axios message
    if (axiosErr.message) return axiosErr.message;

    return fallback;
  }, []);

  return { extractError };
}
