import { Router } from 'express';
import { deleteBudget, getBudget, listBudgets, upsertBudget } from '../controllers/budgetController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { monthParam, upsertBudgetSchema } from '../validators/budgets.js';

const router = Router();

router.use(authenticate);
router.get('/', listBudgets);
router.get('/:month', validate({ params: monthParam }), getBudget);
router.put('/:month', validate({ params: monthParam, body: upsertBudgetSchema }), upsertBudget);
router.delete('/:month', validate({ params: monthParam }), deleteBudget);

export default router;
