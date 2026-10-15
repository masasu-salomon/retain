import { useMemo } from 'react';
import { expensesApi } from '../api/expenses';
import { useAppSelector } from '../store/hooks';
import { selectExpenseQueryParams } from '../store/expenseFiltersSlice';
import type { ExpenseQueryParams } from '../types';
import { useApiQuery } from './useApiQuery';
import { useDebounce } from './useDebounce';

/**
 * Fetches the expense page described by the Redux filter state.
 * The search text is debounced so typing doesn't fire a request per keystroke.
 */
export function useExpenses() {
  const params = useAppSelector(selectExpenseQueryParams);
  const debouncedSearch = useDebounce(params.search);

  const effectiveParams = useMemo<ExpenseQueryParams>(() => {
    const { search: _ignored, ...rest } = params;
    return debouncedSearch ? { ...rest, search: debouncedSearch } : rest;
  }, [params, debouncedSearch]);

  const query = useApiQuery(JSON.stringify(effectiveParams), (signal) => expensesApi.list(effectiveParams, signal));

  return {
    ...query,
    /** True while the user is still typing and the debounced search hasn't caught up. */
    searchPending: (params.search ?? '') !== (debouncedSearch ?? ''),
  };
}
