import { prisma } from '../lib/prisma.js';
import { conflict, notFound } from '../lib/httpError.js';
import { serializeCategory } from '../lib/serializers.js';

/** GET /api/categories - available to every signed-in user; admins also get usage counts. */
export const listCategories = async (req, res) => {
  const isAdmin = req.user.role === 'ADMIN';
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    ...(isAdmin && { include: { _count: { select: { expenses: true } } } }),
  });
  res.json({ data: categories.map(serializeCategory) });
};

const ensureUniqueName = async (name, excludeId) => {
  const existing = await prisma.category.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, ...(excludeId && { NOT: { id: excludeId } }) },
  });
  if (existing) {
    throw conflict(`A category named "${existing.name}" already exists`);
  }
};

/** POST /api/categories (admin) */
export const createCategory = async (req, res) => {
  const { name, color } = req.valid.body;
  await ensureUniqueName(name);
  const category = await prisma.category.create({ data: { name, ...(color && { color }) } });
  res.status(201).json({ data: serializeCategory({ ...category, _count: { expenses: 0 } }) });
};

/** PUT /api/categories/:id (admin) */
export const updateCategory = async (req, res) => {
  const { id } = req.valid.params;
  const { name, color } = req.valid.body;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw notFound('Category not found');
  if (name) await ensureUniqueName(name, id);

  const category = await prisma.category.update({
    where: { id },
    data: { ...(name && { name }), ...(color && { color }) },
    include: { _count: { select: { expenses: true } } },
  });
  res.json({ data: serializeCategory(category) });
};

/** DELETE /api/categories/:id (admin) - refuses to delete a category that expenses still use. */
export const deleteCategory = async (req, res) => {
  const { id } = req.valid.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { expenses: true } } },
  });
  if (!category) throw notFound('Category not found');

  const usage = category._count.expenses;
  if (usage > 0) {
    throw conflict(
      `"${category.name}" is used by ${usage} expense${usage === 1 ? '' : 's'} and cannot be deleted. Rename it instead.`,
    );
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).end();
};
