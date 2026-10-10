import { prisma } from '../lib/prisma.js';
import { currentMonth, formatDateOnly, monthRange } from '../lib/dates.js';
import { buildBudgetSummary } from '../lib/budgetStatus.js';
import { serializeExpense, toNumber } from '../lib/serializers.js';

const withCategory = { category: { select: { id: true, name: true, color: true } } };

/**
 * GET /api/dashboard?month=YYYY-MM
 * Everything the user dashboard needs for one month in a single request.
 */
export const getDashboard = async (req, res) => {
  const userId = req.user.id;
  const month = req.valid.query.month ?? currentMonth();
  const { start, end } = monthRange(month);
  const inMonth = { userId, date: { gte: start, lt: end } };

  const [totals, budget, highest, byCategoryRaw, byDayRaw, recent, categories] = await Promise.all([
    prisma.expense.aggregate({ where: inMonth, _sum: { amount: true }, _count: true, _avg: { amount: true } }),
    prisma.budget.findUnique({ where: { userId_month: { userId, month } } }),
    prisma.expense.findFirst({
      where: inMonth,
      orderBy: [{ amount: 'desc' }, { date: 'desc' }],
      include: withCategory,
    }),
    prisma.expense.groupBy({ by: ['categoryId'], where: inMonth, _sum: { amount: true }, _count: true }),
    prisma.expense.groupBy({ by: ['date'], where: inMonth, _sum: { amount: true }, orderBy: { date: 'asc' } }),
    prisma.expense.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      include: withCategory,
    }),
    prisma.category.findMany({ select: { id: true, name: true, color: true } }),
  ]);

  const totalSpent = toNumber(totals._sum.amount);
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const spendingByCategory = byCategoryRaw
    .map((row) => {
      const category = categoryById.get(row.categoryId);
      const total = toNumber(row._sum.amount);
      return {
        categoryId: row.categoryId,
        name: category?.name ?? 'Unknown',
        color: category?.color ?? '#94a3b8',
        total,
        count: row._count,
        percentage: totalSpent > 0 ? Math.round((total / totalSpent) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  res.json({
    data: {
      month,
      totalSpent,
      expenseCount: totals._count,
      averageExpense: Math.round(toNumber(totals._avg.amount) * 100) / 100,
      budget: buildBudgetSummary(budget ? toNumber(budget.amount) : null, totalSpent),
      highestExpense: highest ? serializeExpense(highest) : null,
      spendingByCategory,
      dailySpending: byDayRaw.map((row) => ({ date: formatDateOnly(row.date), total: toNumber(row._sum.amount) })),
      recentExpenses: recent.map(serializeExpense),
    },
  });
};
