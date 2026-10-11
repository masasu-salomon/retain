import { Router } from 'express';
import { getInsights } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));
router.get('/insights', getInsights);

export default router;
