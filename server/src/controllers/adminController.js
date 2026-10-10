import { prisma } from '../lib/prisma.js';
import { currentMonth, monthRange } from '../lib/dates.js';
import { serializeExpense, serializeUser, toNumber } from '../lib/serializers.js';

const RANK_SIZE = 5;
const RECENT_SIZE = 8;

/**
 * GET /api/admin/insights
 * Platform-wide statistics for the admin dashboard.
 * "Expenses this month" counts expenses *recorded* (created) during the current calendar month.
 */
export const getInsights = async (_req, res) => {
  const month = currentMonth();
  const { start, end } = monthRange(month);
  const createdThisMonth = { createdAt: { gte: start, lt: end } };

  const [
    totalUsers,
    adminCount,
    totals,
    monthTotals,
    usersThisMonth,
    perCategoryRaw,
    categories,
    recentExpenses,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.expense.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.expense.aggregate({ where: createdThisMonth, _sum: { amount: true }, _count: true }),
    prisma.user.count({ where: createdThisMonth }),
    prisma.expense.groupBy({ by: ['categoryId'], _sum: { amount: true }, _count: true }),
    prisma.category.findMany({ select: { id: true, name: true, color: true } }),
    prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      take: RECENT_SIZE,
      include: {
        category: { select: { id: true, name: true, color: true } },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: RECENT_SIZE,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const usageById = new Map(perCategoryRaw.map((row) => [row.categoryId, row]));

  // Every category is included (with zeros) so unused categories appear in the "least used" ranking.
  const categoryStats = categories.map((category) => {
    const usage = usageById.get(category.id);
    return {
      categoryId: category.id,
      name: category.name,
      color: category.color,
      total: toNumber(usage?._sum.amount),
      count: usage?._count ?? 0,
    };
  });

  const byUsage = (direction) => (a, b) =>
    direction * (a.count - b.count) || direction * (a.total - b.total) || a.name.localeCompare(b.name);

  res.json({
    data: {
      month,
      totals: {
        users: totalUsers,
        admins: adminCount,
        newUsersThisMonth: usersThisMonth,
        expenses: totals._count,
        expenseValue: toNumber(totals._sum.amount),
        expensesThisMonth: monthTotals._count,
        expenseValueThisMonth: toNumber(monthTotals._sum.amount),
        categories: categories.length,
      },
      spendingPerCategory: [...categoryStats].sort((a, b) => b.total - a.total),
      topCategories: [...categoryStats].sort(byUsage(-1)).slice(0, RANK_SIZE),
      bottomCategories: [...categoryStats].sort(byUsage(1)).slice(0, RANK_SIZE),
      recentExpenses: recentExpenses.map(serializeExpense),
      recentUsers: recentUsers.map(serializeUser),
    },
  });
};
