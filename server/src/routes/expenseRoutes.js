import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from '../controllers/expenseController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import { createExpenseSchema, listExpensesQuery, updateExpenseSchema } from '../validators/expenses.js';

const router = Router();

router.use(authenticate);
router.get('/', validate({ query: listExpensesQuery }), listExpenses);
router.post('/', validate({ body: createExpenseSchema }), createExpense);
router.get('/:id', validate({ params: idParam }), getExpense);
router.put('/:id', validate({ params: idParam, body: updateExpenseSchema }), updateExpense);
router.delete('/:id', validate({ params: idParam }), deleteExpense);

export default router;
