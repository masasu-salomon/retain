import { http } from './client';
import type { DataResponse, Expense, ExpenseInput, ExpenseListResponse, ExpenseQueryParams } from '../types';

export const expensesApi = {
  list: async (params: ExpenseQueryParams, signal?: AbortSignal) =>
    (await http.get<ExpenseListResponse>('/expenses', { params, signal })).data,
  get: async (id: string, signal?: AbortSignal) =>
    (await http.get<DataResponse<Expense>>(`/expenses/${id}`, { signal })).data.data,
  create: async (input: ExpenseInput) => (await http.post<DataResponse<Expense>>('/expenses', input)).data.data,
  update: async (id: string, input: Partial<ExpenseInput>) =>
    (await http.put<DataResponse<Expense>>(`/expenses/${id}`, input)).data.data,
  remove: async (id: string) => {
    await http.delete(`/expenses/${id}`);
  },
};
