import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { monthQuery } from '../validators/budgets.js';

const router = Router();

router.get('/', authenticate, validate({ query: monthQuery }), getDashboard);

export default router;
