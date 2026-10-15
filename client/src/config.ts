export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  currency: import.meta.env.VITE_CURRENCY || 'USD',
} as const;
