// Shared domain and API types. These mirror the JSON returned by the Retain API.

export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  name: string;
}

export const PAYMENT_METHODS = ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'OTHER'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  /** Only present for admins. */
  expenseCount?: number;
}

export type CategorySummary = Pick<Category, 'id' | 'name' | 'color'>;

export interface CategoryInput {
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  /** Calendar date, "YYYY-MM-DD". */
  date: string;
  paymentMethod: PaymentMethod;
  notes: string | null;
  categoryId: string;
  category?: CategorySummary;
  /** Only present in admin listings. */
  user?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpenseListResponse {
  data: Expense[];
  pagination: Pagination;
  summary: { totalAmount: number };
}

export type SortField = 'date' | 'amount' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

/** Query parameters accepted by GET /expenses (empty values omitted). */
export interface ExpenseQueryParams {
  search?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export type BudgetStatus = 'none' | 'within' | 'approaching' | 'over';

export interface BudgetSummary {
  budget: number | null;
  totalSpent: number;
  remaining: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
}

export interface MonthlyBudget extends BudgetSummary {
  month: string;
  updatedAt: string | null;
}

export interface BudgetHistoryItem extends BudgetSummary {
  id: string;
  month: string;
  amount: number;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  count: number;
}

export interface DashboardData {
  month: string;
  totalSpent: number;
  expenseCount: number;
  averageExpense: number;
  budget: BudgetSummary;
  highestExpense: Expense | null;
  spendingByCategory: (CategorySpending & { percentage: number })[];
  dailySpending: { date: string; total: number }[];
  recentExpenses: Expense[];
}

export interface AdminInsights {
  month: string;
  totals: {
    users: number;
    admins: number;
    newUsersThisMonth: number;
    expenses: number;
    expenseValue: number;
    expensesThisMonth: number;
    expenseValueThisMonth: number;
    categories: number;
  };
  spendingPerCategory: CategorySpending[];
  topCategories: CategorySpending[];
  bottomCategories: CategorySpending[];
  recentExpenses: Expense[];
  recentUsers: User[];
}

/** Envelope used by most single-resource and list endpoints. */
export interface DataResponse<T> {
  data: T;
}

export interface ApiErrorBody {
  message: string;
  errors?: { field: string; message: string }[];
}
