import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ExpenseQueryParams, PaymentMethod, SortField, SortOrder } from '../types';
import type { RootState } from './index';

/**
 * Search, filter, sort and pagination state for the expense list.
 * Values are kept as strings where they back form inputs; the selectors below
 * turn them into clean API query parameters.
 */
export interface ExpenseFiltersState {
  search: string;
  categoryId: string;
  paymentMethod: PaymentMethod | '';
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export const initialFiltersState: ExpenseFiltersState = {
  search: '',
  categoryId: '',
  paymentMethod: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10,
};

const expenseFiltersSlice = createSlice({
  name: 'expenseFilters',
  initialState: initialFiltersState,
  reducers: {
    // Any change to what is being shown sends the user back to the first page.
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryId = action.payload;
      state.page = 1;
    },
    setPaymentMethodFilter(state, action: PayloadAction<PaymentMethod | ''>) {
      state.paymentMethod = action.payload;
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<{ startDate?: string; endDate?: string }>) {
      if (action.payload.startDate !== undefined) state.startDate = action.payload.startDate;
      if (action.payload.endDate !== undefined) state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setAmountRange(state, action: PayloadAction<{ minAmount?: string; maxAmount?: string }>) {
      if (action.payload.minAmount !== undefined) state.minAmount = action.payload.minAmount;
      if (action.payload.maxAmount !== undefined) state.maxAmount = action.payload.maxAmount;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: SortField; order?: SortOrder }>) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order ?? state.order;
      state.page = 1;
    },
    /** Clicking the active column flips the order; clicking a new column sorts it descending. */
    toggleSort(state, action: PayloadAction<SortField>) {
      if (state.sortBy === action.payload) {
        state.order = state.order === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = action.payload;
        state.order = 'desc';
      }
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
    clearFilters(state) {
      return { ...initialFiltersState, sortBy: state.sortBy, order: state.order, limit: state.limit };
    },
    resetFilters() {
      return initialFiltersState;
    },
  },
});

export const {
  setSearch,
  setCategoryFilter,
  setPaymentMethodFilter,
  setDateRange,
  setAmountRange,
  setSort,
  toggleSort,
  setPage,
  setPageSize,
  clearFilters,
  resetFilters,
} = expenseFiltersSlice.actions;

export default expenseFiltersSlice.reducer;

// Selectors

export const selectExpenseFilters = (state: RootState) => state.expenseFilters;

const toNumberOrUndefined = (value: string) => {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

/** API query parameters derived from the filter state, with empty values removed. */
export const selectExpenseQueryParams = createSelector([selectExpenseFilters], (filters): ExpenseQueryParams => {
  const params: ExpenseQueryParams = {
    sortBy: filters.sortBy,
    order: filters.order,
    page: filters.page,
    limit: filters.limit,
  };
  const search = filters.search.trim();
  if (search) params.search = search;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  const minAmount = toNumberOrUndefined(filters.minAmount);
  const maxAmount = toNumberOrUndefined(filters.maxAmount);
  if (minAmount !== undefined) params.minAmount = minAmount;
  if (maxAmount !== undefined) params.maxAmount = maxAmount;
  return params;
});

/** Number of narrowing filters in use (search, sort and paging excluded). */
export const selectActiveFilterCount = createSelector(
  [selectExpenseFilters],
  (filters) =>
    [
      filters.categoryId,
      filters.paymentMethod,
      filters.startDate || filters.endDate,
      filters.minAmount || filters.maxAmount,
    ].filter(Boolean).length,
);

export const selectHasAnyFilter = createSelector(
  [selectExpenseFilters, selectActiveFilterCount],
  (filters, count) => count > 0 || filters.search.trim() !== '',
);
