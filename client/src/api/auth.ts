import { http } from './client';
import type { AuthResponse, LoginCredentials, RegisterPayload, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials) => (await http.post<AuthResponse>('/auth/login', credentials)).data,
  register: async (payload: RegisterPayload) => (await http.post<AuthResponse>('/auth/register', payload)).data,
  me: async (signal?: AbortSignal) => (await http.get<{ user: User }>('/auth/me', { signal })).data.user,
};
