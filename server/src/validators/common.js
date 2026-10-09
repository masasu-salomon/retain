import { z } from 'zod';
import { isValidMonth } from '../lib/dates.js';

/** Treats empty query-string values ("?search=") as absent. */
export const optionalParam = (schema) =>
  z.preprocess((value) => (value === '' || value == null ? undefined : value), schema.optional());

export const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), 'Invalid date');

export const month = z.string().refine(isValidMonth, 'Month must be in YYYY-MM format');

export const money = z.coerce
  .number({ error: 'Amount must be a number' })
  .positive('Amount must be greater than 0')
  .max(1_000_000_000, 'Amount is too large')
  .transform((value) => Math.round(value * 100) / 100);

export const idParam = z.object({ id: z.uuid('Invalid id') });
