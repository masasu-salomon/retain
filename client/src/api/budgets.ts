import { http } from './client';
import type { BudgetHistoryItem, DataResponse, MonthlyBudget } from '../types';

export const budgetsApi = {
  history: async (signal?: AbortSignal) =>
    (await http.get<DataResponse<BudgetHistoryItem[]>>('/budgets', { signal })).data.data,
  get: async (month: string, signal?: AbortSignal) =>
    (await http.get<DataResponse<MonthlyBudget>>(`/budgets/${month}`, { signal })).data.data,
  save: async (month: string, amount: number) =>
    (await http.put<DataResponse<MonthlyBudget>>(`/budgets/${month}`, { amount })).data.data,
  remove: async (month: string) => {
    await http.delete(`/budgets/${month}`);
  },
};
