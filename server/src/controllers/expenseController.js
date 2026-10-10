import { prisma } from '../lib/prisma.js';
import { badRequest, notFound } from '../lib/httpError.js';
import { parseDateOnly } from '../lib/dates.js';
import { serializeExpense, toNumber } from '../lib/serializers.js';

const withCategory = { category: { select: { id: true, name: true, color: true } } };

/** Builds the Prisma `where` clause for the list filters. Always scoped to the owner. */
const buildWhere = (userId, q) => {
  const where = { userId };

  if (q.search) {
    where.OR = [
      { title: { contains: q.search, mode: 'insensitive' } },
      { notes: { contains: q.search, mode: 'insensitive' } },
      { category: { name: { contains: q.search, mode: 'insensitive' } } },
    ];
  }
  if (q.categoryId) where.categoryId = q.categoryId;
  if (q.paymentMethod) where.paymentMethod = q.paymentMethod;
  if (q.startDate || q.endDate) {
    where.date = {
      ...(q.startDate && { gte: parseDateOnly(q.startDate) }),
      ...(q.endDate && { lte: parseDateOnly(q.endDate) }),
    };
  }
  if (q.minAmount != null || q.maxAmount != null) {
    where.amount = {
      ...(q.minAmount != null && { gte: q.minAmount }),
      ...(q.maxAmount != null && { lte: q.maxAmount }),
    };
  }
  return where;
};

/**
 * GET /api/expenses
 * Supports search, category / payment-method / date / amount filters,
 * sorting and pagination. Responds with the page plus totals for the whole filtered set.
 */
export const listExpenses = async (req, res) => {
  const q = req.valid.query;
  const where = buildWhere(req.user.id, q);

  const [items, total, aggregate] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      include: withCategory,
      // Secondary sort keeps pagination stable when primary values tie.
      orderBy: [{ [q.sortBy]: q.order }, { createdAt: 'desc' }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ]);

  res.json({
    data: items.map(serializeExpense),
    pagination: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / q.limit)),
    },
    summary: { totalAmount: toNumber(aggregate._sum.amount) },
  });
};

/** Loads an expense owned by the user. Other users' expenses are reported as not found. */
const findOwnedExpense = async (id, userId) => {
  const expense = await prisma.expense.findFirst({ where: { id, userId }, include: withCategory });
  if (!expense) throw notFound('Expense not found');
  return expense;
};

const ensureCategoryExists = async (categoryId) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw badRequest('Selected category does not exist');
};

/** GET /api/expenses/:id */
export const getExpense = async (req, res) => {
  const expense = await findOwnedExpense(req.valid.params.id, req.user.id);
  res.json({ data: serializeExpense(expense) });
};

/** POST /api/expenses */
export const createExpense = async (req, res) => {
  const body = req.valid.body;
  await ensureCategoryExists(body.categoryId);

  const expense = await prisma.expense.create({
    data: { ...body, date: parseDateOnly(body.date), userId: req.user.id },
    include: withCategory,
  });
  res.status(201).json({ data: serializeExpense(expense) });
};

/** PUT /api/expenses/:id */
export const updateExpense = async (req, res) => {
  const { id } = req.valid.params;
  const body = req.valid.body;
  await findOwnedExpense(id, req.user.id);
  if (body.categoryId) await ensureCategoryExists(body.categoryId);

  const expense = await prisma.expense.update({
    where: { id },
    data: { ...body, ...(body.date && { date: parseDateOnly(body.date) }) },
    include: withCategory,
  });
  res.json({ data: serializeExpense(expense) });
};

/** DELETE /api/expenses/:id */
export const deleteExpense = async (req, res) => {
  const { id } = req.valid.params;
  await findOwnedExpense(id, req.user.id);
  await prisma.expense.delete({ where: { id } });
  res.status(204).end();
};
