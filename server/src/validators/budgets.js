import { z } from 'zod';
import { money, month, optionalParam } from './common.js';

export const monthParam = z.object({ month });
export const upsertBudgetSchema = z.object({ amount: money });
export const monthQuery = z.object({ month: optionalParam(month) });
