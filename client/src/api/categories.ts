import { http } from './client';
import type { Category, CategoryInput, DataResponse } from '../types';

export const categoriesApi = {
  list: async (signal?: AbortSignal) => (await http.get<DataResponse<Category[]>>('/categories', { signal })).data.data,
  create: async (input: CategoryInput) => (await http.post<DataResponse<Category>>('/categories', input)).data.data,
  update: async (id: string, input: Partial<CategoryInput>) =>
    (await http.put<DataResponse<Category>>(`/categories/${id}`, input)).data.data,
  remove: async (id: string) => {
    await http.delete(`/categories/${id}`);
  },
};
