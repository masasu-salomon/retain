import axios, { AxiosError } from 'axios';
import { config } from '../config';
import type { ApiErrorBody } from '../types';

const TOKEN_KEY = 'retain.token';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable (private mode) - session will not persist */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export const http = axios.create({ baseURL: config.apiUrl, timeout: 20_000 });

http.interceptors.request.use((request) => {
  const token = tokenStorage.get();
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

// AuthContext registers a handler so an expired session signs the user out everywhere.
let unauthorizedHandler: (() => void) | null = null;
export const onUnauthorized = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isAuthCall = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register');
    if (error.response?.status === 401 && !isAuthCall) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

/** Field-level validation errors keyed by field name, if the API returned any. */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return {};
  const fieldErrors: Record<string, string> = {};
  for (const item of error.response?.data?.errors ?? []) {
    if (item.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message;
  }
  return fieldErrors;
};

/** Converts any thrown value into a message that is safe to show to the user. */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (axios.isCancel(error)) return 'Request cancelled';
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'The server took too long to respond. Please try again.'
        : 'Cannot reach the server. Check your connection and try again.';
    }
    return error.response.data?.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
