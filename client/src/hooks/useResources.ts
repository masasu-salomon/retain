import { adminApi, dashboardApi } from '../api/dashboard';
import { budgetsApi } from '../api/budgets';
import { categoriesApi } from '../api/categories';
import { expensesApi } from '../api/expenses';
import { useApiQuery } from './useApiQuery';

// Thin, typed wrappers around useApiQuery for each API resource.

export const useCategories = () => useApiQuery('categories', (signal) => categoriesApi.list(signal));

export const useExpense = (id: string | undefined) =>
  useApiQuery(id ? `expense:${id}` : null, (signal) => expensesApi.get(id as string, signal));

export const useDashboard = (month: string) =>
  useApiQuery(`dashboard:${month}`, (signal) => dashboardApi.get(month, signal));

export const useMonthlyBudget = (month: string) =>
  useApiQuery(`budget:${month}`, (signal) => budgetsApi.get(month, signal));

export const useBudgetHistory = () => useApiQuery('budget-history', (signal) => budgetsApi.history(signal));

export const useAdminInsights = () => useApiQuery('admin-insights', (signal) => adminApi.insights(signal));
