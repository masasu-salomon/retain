import { prisma } from '../lib/prisma.js';
import { notFound } from '../lib/httpError.js';
import { buildBudgetSummary } from '../lib/budgetStatus.js';
import { serializeBudget, toNumber } from '../lib/serializers.js';
import { getMonthlySpent } from '../lib/spending.js';

const summaryFor = async (userId, month) => {
  const [budget, totalSpent] = await Promise.all([
    prisma.budget.findUnique({ where: { userId_month: { userId, month } } }),
    getMonthlySpent(userId, month),
  ]);
  return {
    month,
    ...buildBudgetSummary(budget ? toNumber(budget.amount) : null, totalSpent),
    updatedAt: budget?.updatedAt ?? null,
  };
};

/** GET /api/budgets - the user's budget history (latest 12 months) with spending for each. */
export const listBudgets = async (req, res) => {
  const budgets = await prisma.budget.findMany({
    where: { userId: req.user.id },
    orderBy: { month: 'desc' },
    take: 12,
  });

  const data = await Promise.all(
    budgets.map(async (budget) => {
      const totalSpent = await getMonthlySpent(req.user.id, budget.month);
      return { ...serializeBudget(budget), ...buildBudgetSummary(toNumber(budget.amount), totalSpent) };
    }),
  );
  res.json({ data });
};

/** GET /api/budgets/:month - budget summary (spent, remaining, status) for one month. */
export const getBudget = async (req, res) => {
  res.json({ data: await summaryFor(req.user.id, req.valid.params.month) });
};

/** PUT /api/budgets/:month - create or update the budget for a month. */
export const upsertBudget = async (req, res) => {
  const { month } = req.valid.params;
  const { amount } = req.valid.body;
  const userId = req.user.id;

  await prisma.budget.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, amount },
    update: { amount },
  });
  res.json({ data: await summaryFor(userId, month) });
};

/** DELETE /api/budgets/:month */
export const deleteBudget = async (req, res) => {
  const { month } = req.valid.params;
  const result = await prisma.budget.deleteMany({ where: { userId: req.user.id, month } });
  if (result.count === 0) throw notFound('No budget set for this month');
  res.status(204).end();
};
