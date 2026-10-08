import { formatDateOnly } from './dates.js';

// Prisma returns Decimal objects for money columns; the API always responds with numbers.
export const toNumber = (value) => (value == null ? 0 : Number(value));

export const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const serializeCategory = (category) => ({
  id: category.id,
  name: category.name,
  color: category.color,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  ...(category._count ? { expenseCount: category._count.expenses } : {}),
});

export const serializeExpense = (expense) => ({
  id: expense.id,
  title: expense.title,
  amount: toNumber(expense.amount),
  date: formatDateOnly(expense.date),
  paymentMethod: expense.paymentMethod,
  notes: expense.notes,
  categoryId: expense.categoryId,
  category: expense.category
    ? { id: expense.category.id, name: expense.category.name, color: expense.category.color }
    : undefined,
  user: expense.user ? { id: expense.user.id, name: expense.user.name } : undefined,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
});

export const serializeBudget = (budget) => ({
  id: budget.id,
  month: budget.month,
  amount: toNumber(budget.amount),
  createdAt: budget.createdAt,
  updatedAt: budget.updatedAt,
});
