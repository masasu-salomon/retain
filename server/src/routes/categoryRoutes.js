import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categories.js';

const router = Router();
const adminOnly = requireRole('ADMIN');

router.use(authenticate);
router.get('/', listCategories);
router.post('/', adminOnly, validate({ body: createCategorySchema }), createCategory);
router.put('/:id', adminOnly, validate({ params: idParam, body: updateCategorySchema }), updateCategory);
router.delete('/:id', adminOnly, validate({ params: idParam }), deleteCategory);

export default router;
