import { prisma } from './prisma.js';
import { monthRange } from './dates.js';
import { toNumber } from './serializers.js';

/** Total amount a user spent during a "YYYY-MM" month. */
export const getMonthlySpent = async (userId, month) => {
  const { start, end } = monthRange(month);
  const result = await prisma.expense.aggregate({
    where: { userId, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return toNumber(result._sum.amount);
};
