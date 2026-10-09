import { z } from 'zod';
import { dateOnly, money, optionalParam } from './common.js';

export const PAYMENT_METHODS = ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'OTHER'];

const expenseBody = {
  title: z.string().trim().min(1, 'Title is required').max(120),
  amount: money,
  categoryId: z.uuid('Select a valid category'),
  date: dateOnly,
  paymentMethod: z.enum(PAYMENT_METHODS, { error: 'Select a valid payment method' }),
  notes: z
    .string()
    .trim()
    .max(1000)
    .nullish()
    .transform((value) => (value ? value : null)),
};

export const createExpenseSchema = z.object(expenseBody);
export const updateExpenseSchema = z
  .object(expenseBody)
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'Provide at least one field to update');

export const listExpensesQuery = z
  .object({
    search: optionalParam(z.string().trim().max(120)),
    categoryId: optionalParam(z.uuid('Invalid category')),
    paymentMethod: optionalParam(z.enum(PAYMENT_METHODS)),
    startDate: optionalParam(dateOnly),
    endDate: optionalParam(dateOnly),
    minAmount: optionalParam(z.coerce.number().min(0)),
    maxAmount: optionalParam(z.coerce.number().min(0)),
    sortBy: optionalParam(z.enum(['date', 'amount', 'title', 'createdAt'])).default('date'),
    order: optionalParam(z.enum(['asc', 'desc'])).default('desc'),
    page: optionalParam(z.coerce.number().int().min(1)).default(1),
    limit: optionalParam(z.coerce.number().int().min(1).max(100)).default(10),
  })
  .refine((q) => !q.startDate || !q.endDate || q.startDate <= q.endDate, {
    message: 'Start date must be on or before end date',
    path: ['startDate'],
  })
  .refine((q) => q.minAmount == null || q.maxAmount == null || q.minAmount <= q.maxAmount, {
    message: 'Minimum amount must not exceed maximum amount',
    path: ['minAmount'],
  });
