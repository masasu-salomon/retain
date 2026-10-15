import { http } from './client';
import type { AdminInsights, DashboardData, DataResponse } from '../types';

export const dashboardApi = {
  get: async (month: string, signal?: AbortSignal) =>
    (await http.get<DataResponse<DashboardData>>('/dashboard', { params: { month }, signal })).data.data,
};

export const adminApi = {
  insights: async (signal?: AbortSignal) =>
    (await http.get<DataResponse<AdminInsights>>('/admin/insights', { signal })).data.data,
};
